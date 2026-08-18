// Error Handler Middleware
// Centralized error handling for Express

export const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Error] ${status}: ${message}`);
  }

  res.status(status).json({
    success: false,
    error: message,
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`,
  });
};

export default errorHandler;
