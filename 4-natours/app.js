const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// adds various methods of express
const app = express();

// 1) middlewares
app.use(morgan('dev'));
app.use(express.json());

// 2) custom middlewares
// this middleware just logs a text to the console anytime a route is hit
app.use((req, res, next) => {
  console.log('Hello from the middleware!');
  next();
});

// this custom middleware creates a requestTime property on the req object which stores the time at which the request hit the server
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// export the app variable
module.exports = app;
