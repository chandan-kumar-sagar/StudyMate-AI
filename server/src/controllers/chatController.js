const aiService = require('../services/aiService');

exports.handleChat = async (req, res, next) => {
  try {
    const { text, useRag, history } = req.body;
    let imageBase64 = null;
    let imageMimeType = null;
    let parsedHistory = [];

    try {
      if (history) {
        parsedHistory = JSON.parse(history);
      }
    } catch (e) {
      console.error('Failed to parse history:', e);
    }

    if (!text && !req.file) {
      return res.status(400).json({ success: false, message: 'Text or image is required' });
    }

    // Process uploaded image if exists
    if (req.file) {
      imageBase64 = req.file.buffer.toString('base64');
      imageMimeType = req.file.mimetype;
    }

    const aiResponse = await aiService.processChat({
      text: text || "Please analyze this image.",
      imageBase64,
      imageMimeType,
      useRag: useRag === 'true' || useRag === true,
      history: parsedHistory
    });

    res.json({
      success: true,
      answer: aiResponse.answer,
      sources: aiResponse.sources,
      toolUsed: aiResponse.toolUsed
    });
  } catch (error) {
    next(error);
  }
};
