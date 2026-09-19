require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  CHROMA_URL: process.env.CHROMA_URL || 'http://localhost:8000',
  CHROMA_API_KEY: process.env.CHROMA_API_KEY || null,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  RAG_TOP_K: parseInt(process.env.RAG_TOP_K, 10) || 5,
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760
};
