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

  // Respond to the client with the error details
  // Set the HTTP status to the 'statusCode' from the error object
  res.status(err.statusCode).json({
    // Send the status (e.g., 'fail' or 'error') from the error object
    status: err.status,

    // Send the error message to provide more context about the issue
    message: err.message,
  });
};
