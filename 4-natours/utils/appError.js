/**
 * Define a custom error class that extends the built-in Error class
 * We use this class to create error objects, that will be handled later by the
 * global error handler middleware in `app.js`
 */
class AppError extends Error {
  // Constructor method to initialize the custom error
  constructor(message, statusCode) {
    // Call the parent class (Error) constructor with the message
    super(message);

    // Assign the HTTP status code to the instance property
    this.statusCode = statusCode;

    // Determine if the error is a client error (4xx) or server error (5xx)
    // and set the status property accordingly
    this.status = statusCode.toString().startsWith('4') ? 'fail' : 'error';

    // Custom property to indicate if the error is operational
    // An operational error is expected and can be handled by the application
    this.isOperational = true;

    // Capture the stack trace for the error instance
    // Excludes the current constructor from the stack trace to make it cleaner
    Error.captureStackTrace(this, this.constructor);
  }
}

// Export the AppError class for use in other modules
module.exports = AppError;
