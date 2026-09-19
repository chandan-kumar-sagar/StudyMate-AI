const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const upload = require('../middleware/upload');

router.post('/upload', upload.single('document'), documentController.uploadDocument);

module.exports = router;
