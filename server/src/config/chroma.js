const { ChromaClient } = require('chromadb');
const env = require('./env');


const clientConfig = {
  path: env.CHROMA_URL,
};

if (env.CHROMA_API_KEY) {
  clientConfig.auth = {
    provider: 'token',
    credentials: env.CHROMA_API_KEY,
    tokenHeaderType: 'X_CHROMA_TOKEN'
  };
}

const chroma = new ChromaClient(clientConfig);

module.exports = chroma;
