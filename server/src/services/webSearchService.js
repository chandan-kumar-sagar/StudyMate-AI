const { search } = require('duck-duck-scrape');

class WebSearchService {
  /**
   * Searches the web using DuckDuckGo
   * @param {string} query 
   * @returns {Promise<string>}
   */
  async webSearch(query) {
    try {
      console.log(`Performing web search for: ${query}`);
      const results = await search(query, {
        safeSearch: 'moderate'
      });
      
      if (!results || !results.results || results.results.length === 0) {
        return "No web search results found.";
      }
      
      let context = "Here are the top web search results:\n\n";
      // Take top 3 results
      for (let i = 0; i < Math.min(3, results.results.length); i++) {
        const res = results.results[i];
        context += `Title: ${res.title}\n`;
        context += `Snippet: ${res.description}\n`;
        context += `URL: ${res.url}\n\n`;
      }
      
      return context;
    } catch (error) {
      console.error('Web search error:', error);
      return "Web search failed due to an error.";
    }
  }
}

module.exports = new WebSearchService();
