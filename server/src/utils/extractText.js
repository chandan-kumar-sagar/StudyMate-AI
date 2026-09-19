const { PdfReader } = require('pdfreader');

/**
 * Extracts text from a buffer (PDF or TXT)
 * @param {Buffer} buffer - File buffer
 * @param {string} mimetype - File mime type
 * @returns {Promise<string>} - Extracted text
 */
async function extractText(buffer, mimetype) {
  if (mimetype === 'text/plain') {
    return buffer.toString('utf-8');
  }

  if (mimetype === 'application/pdf') {
    return new Promise((resolve, reject) => {
      let extractedText = '';
      new PdfReader().parseBuffer(buffer, (err, item) => {
        if (err) {
          reject(err);
        } else if (!item) {
          // Reached end of file
          resolve(extractedText);
        } else if (item.text) {
          extractedText += item.text + ' ';
        }
      });
    });
  }

  throw new Error(`Unsupported mimetype for text extraction: ${mimetype}`);
}

module.exports = extractText;
