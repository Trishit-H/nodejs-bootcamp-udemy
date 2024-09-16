const AppError = require('./../utils/appError');

// Function to generate errors using AppError class
// for CastError i.e., invalid ObjectId
const handleCastErrorMongoose = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// Function to generate errors using AppError class
// for DuplicateKeys
const handleDuplicateFieldMongoose = (err) => {
  const message = `${Object.keys(err.keyValue)}: ${Object.values(
    err.keyValue
  )} already exists! Enter a different value`;
  return new AppError(message, 400);
};

// Function to generate errors using AppError class
// for ValidationError
const handleValidationError = (err) => {
  const errorsMessageStr = Object.values(err.errors)
    .map((el) => el.message)
    .join(', ');
  const message = `Invalid input data! ${errorsMessageStr}`;
  return new AppError(message, 400);
};

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
  if (err.isOperational) {
    // Here we would only send the error if it is an operational one
    // Send the error response with minimal information
    res.status(err.statusCode).json({
      status: err.status, // Provide the status (e.g., 'fail' or 'error')
      message: err.message, // Provide a generic error message (should be user-friendly)
      // In production, we avoid sending the full error details or stack trace for security reasons
    });
  } else {
    // For programming errors, we send a generic error message to the client
    // And we print the error in the console for us developers to see

    console.error('ERROR!!!!', err);

    res.status(500).json({
      status: 'fail',
      message: 'Something went very wrong!',
    });
  }
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
    // Had to do this instead of `let error = {...err}` to copy the err object because
    // the spread operator does a shallow copy and for some reason doesn't copy
    // the "name" property from the err object and god knows what else
    let error = JSON.parse(JSON.stringify(err));

    // This is for handling errors that are made when an invalid object id for mongoose
    // is passed which results in an CastError. And so it is an operational error
    // and we have to make an error object using AppError class to make it operational
    // The handling is done in handleCastErrorMongoose function
    if (error.name === 'CastError') {
      error = handleCastErrorMongoose(error);
    }

    // This is for handling errors that occur when a duplicate value for a field is
    // entered. The error has no name property but it has a code property that is
    // set to 11000. We will use this to create an error object using AppError class
    // and make it an operational error
    if (error.code === 11000) {
      error = handleDuplicateFieldMongoose(error);
    }

    // This is for handling errors that occur when a value for a field doesn not
    // fullfil the validation criteria  in the schema. The error has a name of
    // "ValidationError"
    if (error.name === 'ValidationError') {
      error = handleValidationError(error);
    }
    sendErrorProduction(error, res);
  }
};
