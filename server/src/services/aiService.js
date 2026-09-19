const groq = require('../config/groq');
const ragService = require('./ragService');
const webSearchService = require('./webSearchService');

// System prompt instructing the model
const SYSTEM_PROMPT = `You are StudyMate AI, a helpful Ed-Tech assistant.
You explain concepts clearly and step-by-step. Use simple language unless asked for advanced detail.
If you receive context from retrieved documents, prefer that information and NEVER invent information outside of it.
If the provided documents don't contain enough information, say so.
Mention sources when RAG is used.`;

class AiService {
  /**
   * Processes a chat request, optionally using RAG or Vision or Tools
   * @param {Object} params
   * @param {string} params.text - User text query
   * @param {string} [params.imageBase64] - Base64 encoded image
   * @param {string} [params.imageMimeType] - Image mime type
   * @param {boolean} [params.useRag] - Whether to use RAG
   */
  async processChat({ text, imageBase64, imageMimeType, useRag, history = [] }) {
    let finalPrompt = text;
    let sources = [];
    let toolUsed = null;

    // 1. Tool check (Simple rule-based check for the assignment)
    if (text.toLowerCase().includes('search the web') || text.toLowerCase().includes('latest information')) {
      toolUsed = 'Web Search';
      const searchResults = await webSearchService.webSearch(text);
      finalPrompt = `User Question: ${text}\n\n${searchResults}\n\nPlease answer the user's question using the web search results above.`;
    } 
    // 2. RAG check
    else if (useRag) {
      const relevantChunks = await ragService.searchRelevantChunks(text);
      if (relevantChunks.length > 0) {
        sources = relevantChunks.map(c => ({
          document: c.metadata.documentName || 'Unknown',
          page: c.metadata.pageNumber || null
        }));
        const ragContext = ragService.buildRagContext(relevantChunks);
        finalPrompt = `User Question: ${text}\n\n${ragContext}\n\nPlease answer the user's question using ONLY the context above. If the context does not contain the answer, say so.`;
      }
    }

    // 3. Build messages array
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];
    
    // Add history messages
    if (history && history.length > 0) {
      history.forEach(msg => {
        // Groq API only supports 'user', 'assistant' (which we map from 'ai'), 'system'
        const role = msg.role === 'ai' ? 'assistant' : msg.role;
        messages.push({ role, content: msg.content });
      });
    }

    if (imageBase64) {
      // Vision model request
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: finalPrompt },
          {
            type: 'image_url',
            image_url: {
              url: `data:${imageMimeType};base64,${imageBase64}`
            }
          }
        ]
      });
      
      // Use LLaVA or a vision model supported by Groq
      const completion = await groq.chat.completions.create({
        messages,
        model: 'llama-3.2-11b-vision-preview',
        max_tokens: 1024,
      });

      return {
        answer: completion.choices[0].message.content,
        sources,
        toolUsed
      };
    } else {
      // Standard text request
      messages.push({
        role: 'user',
        content: finalPrompt
      });

      const completion = await groq.chat.completions.create({
        messages,
        model: 'openai/gpt-oss-20b',
        max_tokens: 1024,
      });

      return {
        answer: completion.choices[0].message.content,
        sources,
        toolUsed
      };
    }
  }
}

module.exports = new AiService();
