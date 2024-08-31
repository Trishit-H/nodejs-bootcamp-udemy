const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// adds various methods of express
const app = express();

// 1) middlewares
// to log http request info
// this only run in development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// parses the incoming json data sent by client and makes it available in req.body
app.use(express.json());

// for serving static files. here files will be served from public directory
app.use(express.static(`${__dirname}/public`));

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
