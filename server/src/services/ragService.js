const embeddingService = require('./embeddingService');
const env = require('../config/env');
const chroma = require('../config/chroma');

// Fallback in-memory store if ChromaDB is not running
const fallbackVectorStore = [];

class RagService {
  constructor() {
    this.collectionName = 'studymate_docs';
    this.collection = null;
    this.initPromise = null;
    this.useFallback = false;
  }

  async getCollection() {
    if (this.useFallback) return null;
    if (this.collection) return this.collection;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        this.collection = await chroma.getOrCreateCollection({
          name: this.collectionName,
          metadata: { "hnsw:space": "cosine" },
          // Provide a dummy embedding function to prevent the DefaultEmbeddingFunction error.
          // We provide embeddings manually anyway.
          embeddingFunction: { generate: () => [] }
        });
        return this.collection;
      } catch (err) {
        console.warn('\n[RagService] Could not connect to ChromaDB. Falling back to IN-MEMORY storage.');
        console.warn('[RagService] Error:', err.message, '\n');
        this.useFallback = true;
        this.initPromise = null;
        return null;
      }
    })();
    return this.initPromise;
  }

  /**
   * Adds document chunks to Vector Store (Chroma or Fallback).
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

      if (collection) {
        ids.push(`${baseMetadata.documentName}-chunk-${i}-${Date.now()}`);
        embeddings.push(embedding);
        documents.push(chunk);
        metadatas.push({ ...baseMetadata, chunkIndex: i });
      } else {
        // Fallback
        fallbackVectorStore.push({
          id: `${baseMetadata.documentName}-chunk-${i}-${Date.now()}`,
          embedding,
          document: chunk,
          metadata: { ...baseMetadata, chunkIndex: i }
        });
      }
    }

    if (collection) {
      await collection.add({ ids, embeddings, metadatas, documents });
      console.log(`Indexed ${chunks.length} chunks from "${baseMetadata.documentName}" into ChromaDB.`);
    } else {
      console.log(`Indexed ${chunks.length} chunks from "${baseMetadata.documentName}" into IN-MEMORY store.`);
    }
  }

  /**
   * Cosine similarity between two vectors (for fallback).
   */
  _cosineSimilarity(vecA, vecB) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Finds the most similar chunks to the given query.
   * @param {string} query - The user's question
   * @returns {Promise<Array>}
   */
  async searchRelevantChunks(query) {
    const collection = await this.getCollection();
    const queryEmbedding = await embeddingService.generateEmbedding(query);

    if (collection) {
      const count = await collection.count();
      if (count === 0) return [];

      const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: env.RAG_TOP_K
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
    } else {
      // Fallback
      if (fallbackVectorStore.length === 0) return [];
      const scored = fallbackVectorStore.map(item => ({
        document: item.document,
        metadata: item.metadata,
        score: this._cosineSimilarity(queryEmbedding, item.embedding)
      }));
      scored.sort((a, b) => b.score - a.score);
      return scored.slice(0, env.RAG_TOP_K);
    }
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
      if (collection) return await collection.count();
      return fallbackVectorStore.length;
    } catch (e) {
      return fallbackVectorStore.length;
    }
  }
}

module.exports = new RagService();
