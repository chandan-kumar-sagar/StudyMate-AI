require('dotenv').config();

// Parse CHROMA_URL into host + port + ssl for chromadb v3.x client
const rawChromaUrl = process.env.CHROMA_URL || 'http://localhost:8000';
const chromaParsed = (() => {
  const withProto = rawChromaUrl.startsWith('http') ? rawChromaUrl : `https://${rawChromaUrl}`;
  const url = new URL(withProto);
  return {
    host: url.hostname,
    port: url.port ? parseInt(url.port, 10) : (url.protocol === 'https:' ? 443 : 8000),
    ssl: url.protocol === 'https:',
  };
})();

module.exports = {
  PORT: process.env.PORT || 5000,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  CHROMA_HOST: chromaParsed.host,
  CHROMA_PORT: chromaParsed.port,
  CHROMA_SSL: chromaParsed.ssl,
  CHROMA_URL: rawChromaUrl,
  CHROMA_API_KEY: process.env.CHROMA_API_KEY || null,
  CHROMA_TENANT: process.env.CHROMA_TENANT || 'default_tenant',
  CHROMA_DATABASE: process.env.CHROMA_DATABASE || 'default_database',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  RAG_TOP_K: parseInt(process.env.RAG_TOP_K, 10) || 5,
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760
};

