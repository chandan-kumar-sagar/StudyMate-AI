const multer = require('multer');
const env = require('../config/env');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, TXT, JPG, PNG, and WEBP are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE
  },
  fileFilter: fileFilter
});

module.exports = upload;
