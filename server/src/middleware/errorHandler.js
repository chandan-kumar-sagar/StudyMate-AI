module.exports = (err, req, res, next) => {
  console.error('[Error]:', err.stack || err.message || err);

  const statusCode = err.statusCode || 500;

  const isDev = process.env.NODE_ENV !== 'production';
  const message = statusCode === 500 && !isDev
    ? 'Internal server error'
    : err.message || 'Something went wrong';

  res.status(statusCode).json({
    success: false,
    message
  });
};
