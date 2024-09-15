// Function that generates error that will be sent during development
// In development mode, we provide detailed error information to aid debugging
const sendErrorDevelopment = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status, // Provide the status (e.g., 'fail' or 'error')
    message: err.message, // Provide the error message for more context
    error: err, // Provide the complete error object (detailed information)
    stack: err.stack, // Provide the error stack trace for debugging
  });
};

// Function that generates error that will be sent during production
// In production mode, we provide only essential error information to avoid exposing sensitive details
const sendErrorProduction = (err, res) => {
  // Send the error response with minimal information
  res.status(err.statusCode).json({
    status: err.status, // Provide the status (e.g., 'fail' or 'error')
    message: err.message, // Provide a generic error message (should be user-friendly)
    // In production, we avoid sending the full error details or stack trace for security reasons
  });
};

/**
 * Simple global error-handling middleware function
 * When we pass in four arguments to a middleware (err, req, res, next),
 * express automatically understands that it is an error handling middleware
 */
module.exports = (err, req, res, next) => {
  // If the error object doesn't have a 'statusCode', set it to 500 (Internal Server Error)
  err.statusCode = err.statusCode || 500;

  // If the error object doesn't have a 'status', set it to 'error'
  err.status = err.status || 'error';

  // Check if the application is in development mode
  if (process.env.NODE_ENV === 'development') {
    sendErrorDevelopment(err, res);

    // Check if the application is in production mode
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorProduction(err, res);
  }
};
