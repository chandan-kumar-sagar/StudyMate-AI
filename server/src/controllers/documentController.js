const extractText = require('../utils/extractText');
const chunkText = require('../utils/chunkText');
const ragService = require('../services/ragService');
const embeddingService = require('../services/embeddingService');

exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    if (!embeddingService.isReady()) {
      try {
        await Promise.race([
          embeddingService.init(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Embedding model is still loading. Please wait a moment and try again.')), 30000)
          )
        ]);
      } catch (initErr) {
        return res.status(503).json({ success: false, message: initErr.message });
      }
    }

    const { originalname, buffer, mimetype } = req.file;

    const text = await extractText(buffer, mimetype);
    
    const cleanText = text.replace(/\s+/g, ' ').trim();
    if (!cleanText) {
      return res.status(400).json({ 
        success: false, 
        message: 'Could not extract any text from the document. If this is a scanned PDF (image-only), please use a text-selectable PDF or plain text file.' 
      });
    }

    const chunks = chunkText(cleanText, 1000, 200);
    console.log(`[Upload] "${originalname}" → ${chunks.length} chunks to index`);

    await ragService.addDocumentToVectorStore(chunks, {
      documentName: originalname,
      source: 'upload'
    });

    res.json({
      success: true,
      message: `Document indexed successfully (${chunks.length} chunks)`,
      document: originalname,
      chunks: chunks.length
    });
  } catch (error) {
    next(error);
  }
};
