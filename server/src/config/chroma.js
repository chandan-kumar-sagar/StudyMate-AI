const { ChromaClient } = require('chromadb');
const env = require('./env');

// chromadb v3.x uses host/port/ssl + headers (not path/auth)
const clientConfig = {
  host: env.CHROMA_HOST,
  port: env.CHROMA_PORT,
  ssl: env.CHROMA_SSL,
  tenant: env.CHROMA_TENANT,
  database: env.CHROMA_DATABASE,
};

if (env.CHROMA_API_KEY) {
  clientConfig.headers = {
    'X-Chroma-Token': env.CHROMA_API_KEY,
  };
}

const chroma = new ChromaClient(clientConfig);

module.exports = chroma;
