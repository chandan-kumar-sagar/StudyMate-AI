const express = require('express');
const cors = require('cors');
const errorHandler = require('./src/middleware/errorHandler');

const env = require('./src/config/env');

const app = express();

// CORS — allow requests from our frontend.
// Using origin: true reflects the request origin, fixing issues when Vite runs on 5174 instead of 5173.
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
const chatRoutes = require('./src/routes/chatRoutes');
const documentRoutes = require('./src/routes/documentRoutes');

app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'StudyMate AI Server is running' });
});

// Model readiness status — lets the client show a "model loading" notice
app.get('/api/status', (req, res) => {
  const embeddingService = require('./src/services/embeddingService');
  res.json({
    modelReady: embeddingService.isReady(),
    message: embeddingService.isReady()
      ? 'All systems ready.'
      : 'Embedding model is loading, please wait before uploading documents...'
  });
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;
