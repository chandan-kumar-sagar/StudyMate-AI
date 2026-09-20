const embeddingService = require('./embeddingService');
const env = require('../config/env');
const chroma = require('../config/chroma');

class RagService {
  constructor() {
    this.collectionName = 'studymate_docs';
    this.collection = null;
    this.initPromise = null;
  }

  async getCollection() {
    if (this.collection) return this.collection;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        console.log('[RagService] Connecting to ChromaDB...');
        this.collection = await chroma.getOrCreateCollection({
          name: this.collectionName,
          metadata: { "hnsw:space": "cosine" },
          // Provide a dummy embedding function to prevent the DefaultEmbeddingFunction error.
          // We provide embeddings manually anyway.
          embeddingFunction: { generate: () => [] }
        });
        console.log('[RagService] Connected to ChromaDB collection:', this.collectionName);
        return this.collection;
      } catch (err) {
        this.initPromise = null; // Allow retry on next request
        console.error('[RagService] ChromaDB connection failed:', err.message);
        throw err; // Let the error surface — don't silently fall back
      }
    })();
    return this.initPromise;
  }

  /**
   * Adds document chunks to ChromaDB vector store.
   * @param {string[]} chunks - Array of text chunks
   * @param {Object} baseMetadata - Metadata like documentName, source
   */
  async addDocumentToVectorStore(chunks, baseMetadata) {
    const collection = await this.getCollection();

    const ids = [];
    const embeddings = [];
    const documents = [];
    const metadatas = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await embeddingService.generateEmbedding(chunk);
      ids.push(`${baseMetadata.documentName}-chunk-${i}-${Date.now()}`);
      embeddings.push(embedding);
      documents.push(chunk);
      metadatas.push({ ...baseMetadata, chunkIndex: i });
    }

    await collection.add({ ids, embeddings, metadatas, documents });
    console.log(`[RagService] Indexed ${chunks.length} chunks from "${baseMetadata.documentName}" into ChromaDB.`);
  }

  /**
   * Finds the most similar chunks to the given query.
   * @param {string} query - The user's question
   * @returns {Promise<Array>}
   */
  async searchRelevantChunks(query) {
    const collection = await this.getCollection();
    const queryEmbedding = await embeddingService.generateEmbedding(query);

    const count = await collection.count();
    if (count === 0) return [];

    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: Math.min(env.RAG_TOP_K, count)
    });

    if (!results.documents || results.documents.length === 0 || results.documents[0].length === 0) {
      return [];
    }

    const formatted = [];
    for (let i = 0; i < results.documents[0].length; i++) {
      formatted.push({
        document: results.documents[0][i],
        metadata: results.metadatas[0][i],
        score: results.distances ? results.distances[0][i] : 0
      });
    }
    return formatted;
  }

  /**
   * Builds the RAG prompt context string from retrieved chunks.
   */
  buildRagContext(chunks) {
    if (!chunks || chunks.length === 0) return '';

    let context = 'Here is relevant context retrieved from uploaded study material:\n\n';
    chunks.forEach((chunk, index) => {
      const source = chunk.metadata.documentName || 'Unknown Document';
      context += `--- Source ${index + 1}: ${source} (chunk ${chunk.metadata.chunkIndex}) ---\n`;
      context += `${chunk.document}\n\n`;
    });

    return context;
  }

  /**
   * Returns the total number of indexed document chunks.
   */
  async getIndexedCount() {
    try {
      const collection = await this.getCollection();
      return await collection.count();
    } catch (e) {
      return 0;
    }
  }
}

module.exports = new RagService();
