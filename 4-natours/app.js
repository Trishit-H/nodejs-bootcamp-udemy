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

// Export the Express application to be used in the server file
module.exports = app;
