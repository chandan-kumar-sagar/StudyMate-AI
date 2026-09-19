const { pipeline } = require('@xenova/transformers');

class EmbeddingService {
  constructor() {
    this.extractor = null;
    this.modelName = 'Xenova/all-MiniLM-L6-v2'; // 384 dimensional embeddings
    this.initPromise = null; // Track in-flight init to avoid duplicate loads
  }

  /**
   * Initializes the embedding model. Safe to call multiple times — only loads once.
   * Returns a promise so callers can await readiness.
   */
  init() {
    if (this.extractor) return Promise.resolve();
    if (this.initPromise) return this.initPromise; // Re-use in-flight promise

    this.initPromise = (async () => {
      console.log(`[EmbeddingService] Loading model: ${this.modelName} (this may take a moment on first run)...`);
      try {
        this.extractor = await pipeline('feature-extraction', this.modelName);
        console.log('[EmbeddingService] Embedding model loaded and ready.');
      } catch (err) {
        this.initPromise = null; // Allow retry on next call
        throw err;
      }
    })();

    return this.initPromise;
  }

  /**
   * Generates embedding for given text
   * @param {string} text - The input text
   * @returns {Promise<number[]>} - 384D float array
   */
  async generateEmbedding(text) {
    if (!this.extractor) {
      await this.init();
    }
    // Generate embedding
    const output = await this.extractor(text, { pooling: 'mean', normalize: true });
    // Convert to regular array
    return Array.from(output.data);
  }

  /**
   * Returns true if the model is already loaded in memory.
   */
  isReady() {
    return this.extractor !== null;
  }
}

const instance = new EmbeddingService();

// Kick off model loading immediately at require-time so it's warm by the time
// the first request arrives. Errors are logged but don't crash the server.
instance.init().catch(err => {
  console.warn('[EmbeddingService] Background model pre-load failed:', err.message);
});

module.exports = instance;
