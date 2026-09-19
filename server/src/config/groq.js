const { Groq } = require('groq-sdk');
const env = require('./env');

if (!env.GROQ_API_KEY) {
  console.warn('Warning: GROQ_API_KEY is not set.');
}

const groq = new Groq({
  apiKey: env.GROQ_API_KEY || 'dummy_key_for_now'
});

module.exports = groq;

