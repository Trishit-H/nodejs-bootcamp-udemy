const express = require('express');
const morgan = require('morgan');

// Import router for tour-related routes (e.g., CRUD operations for tours)
const tourRouter = require('./routes/tourRoutes');

// Import router for user-related routes (e.g., user authentication and profile management)
const userRouter = require('./routes/userRoutes');

// Initialize the Express application
const app = express();

// 1) MIDDLEWARES

// Morgan middleware for logging HTTP request information (only in development mode)
// This middleware logs details such as method, status, response time, etc., which helps with debugging.
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Middleware to parse incoming JSON data from the request body
// This allows us to access the parsed data via `req.body` in route handlers.
app.use(express.json());

// Middleware to serve static files from the "public" directory
// Any file placed in the public directory will be served directly (e.g., images, CSS, JavaScript files).
app.use(express.static(`${__dirname}/public`));

// 2) CUSTOM MIDDLEWARES

// Custom middleware to add a `requestTime` property to the `req` object
// This records the timestamp when the request was received, which can be useful for logging or analytics.
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES

// Mount the tour router on the /api/v1/tours route
// All routes related to tours (e.g., getting all tours, creating a tour) will be handled by `tourRouter`.
app.use('/api/v1/tours', tourRouter);

// Mount the user router on the /api/v1/users route
// All routes related to users (e.g., signing up, logging in) will be handled by `userRouter`.
app.use('/api/v1/users', userRouter);

// Middleware to handle all undefined routes (404 errors)
// `app.all()` is used to catch requests to any HTTP method (GET, POST, PATCH, etc.)
// `*` is a wildcard that matches any route not previously defined in the app
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Cannot find ${req.originalUrl} on this server`,
  // });

  // Here we define an error object using the Error class
  // And pass in a string that is set to the message property on the error object
  // and then we add status and statusCode properties to the error object
  // Then we call the next function and pass in this error object to it
  // When we pass anything to the next function, Express automatically assumes it to be an error
  // and it will skip all the middlewares in the middleware stack and go straight to the
  // global error handling middleware, where it will be handled
  const err = new Error(`Cannot find ${req.originalUrl} on this server`);
  err.status = 'fail';
  err.statusCode = 404;
  next(err);
});

/**
 * Simple global error-handling middleware function
 * When we pass in four arguments to a middleware (err, req, res, next),
 * express automatically understands that it is an error handling middleware
 */
app.use((err, req, res, next) => {
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
});

// Export the Express application to be used in the server file
module.exports = app;
