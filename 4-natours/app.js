const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Import the global error handler function
const globalErrorHandler = require('./controllers/errorController');

// Import the custom error class (AppError)
const AppError = require('./utils/appError');

// Import router for tour-related routes (e.g., CRUD operations for tours)
const tourRouter = require('./routes/tourRoutes');

// Import router for user-related routes (e.g., user authentication and profile management)
const userRouter = require('./routes/userRoutes');

// Initialize the Express application
const app = express();

// 1) MIDDLEWARES

// Set security http headers using helmet
app.use(helmet());

// Morgan middleware for logging HTTP request information (only in development mode)
// This middleware logs details such as method, status, response time, etc., which helps with debugging.
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiter function
const limiter = rateLimit({
  // Set the time window to 1 hour (60 minutes * 60 seconds * 1000 milliseconds)
  windowMs: 60 * 60 * 1000,

  // Limit each IP address to a maximum of 100 requests per 1-hour window
  limit: 100,

  // Custom response message sent when the limit is exceeded
  message: 'Too many requests from this IP address! Try again after an hour.',
});

// Apply the rate limiter middleware to all routes that start with '/api'
// This helps to:
// - Prevent brute-force attacks by limiting the number of requests an IP can make in a given time
// - Avoid Denial-of-Service (DoS) attacks that can overwhelm your API with too many requests
// - Ensure fair usage of your API resources by controlling request rates
app.use('/api', limiter);

// Middleware to parse incoming JSON data from the request body
// This allows us to access the parsed data via `req.body` in route handlers.
// [LECTURE 144] Added the limit option to make sure that the size of the request object
// does not exceed a certain amount. In this case, it is 30kb.
app.use(express.json({ limit: '30kb' }));

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
  /**
  const err = new Error(`Cannot find ${req.originalUrl} on this server`);
  err.status = 'fail';
  err.statusCode = 404;
  next(err);
   */

  // Using the AppError class to create an error object
  // Passing the error message and status code when creating the error object
  // Then passing the error object in the next function
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// Middleware to implement global error handling
app.use(globalErrorHandler);

// Export the Express application to be used in the server file
module.exports = app;
