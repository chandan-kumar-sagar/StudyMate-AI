/**
 * Splits text into chunks of a given maximum length, with overlap.
 * This is important for RAG to ensure context isn't lost between boundaries.
 * 
 * @param {string} text - The input text
 * @param {number} chunkSize - Approximate characters/words per chunk
 * @param {number} overlap - Overlap size
 * @returns {string[]}
 */
function chunkText(text, chunkSize = 1000, overlap = 200) {
  if (!text) return [];
  
  // Simple word-based chunking
  const words = text.split(/\s+/);
  const chunks = [];
  let i = 0;
  
  while (i < words.length) {
    const chunkEnd = Math.min(i + chunkSize, words.length);
    const chunk = words.slice(i, chunkEnd).join(' ');
    chunks.push(chunk);
    
    // Move forward by chunkSize - overlap
    i += (chunkSize - overlap);
  }
  
  return chunks;
}

module.exports = chunkText;
