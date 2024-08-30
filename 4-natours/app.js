const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

// adds various methods of express
const app = express();

// middlewares
app.use(morgan('dev'));
app.use(express.json());

// custom middlewares
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

const PORT = 3000;

// reading mock data
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

// Route handler functions
// function to get all tours
const getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
};

// function to get one tour by params
const getTour = (req, res) => {
  // converting the id to Number type because everything is stored as string in req.params
  const id = parseInt(req.params.id);

  // using find method to access the object whose id matches with the one in the params
  // if no object found, then find returns undefined
  const tour = tours.find((element) => element.id === id);

  // checking if the tour exists or not
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

// function to create a new tour
const createTour = (req, res) => {
  // creating id for each new post
  const newId = tours[tours.length - 1].id + 1;

  // Object.assign to merge two objects
  // could also spread operator - { id: newId, ...req.body }
  const newTour = Object.assign({ id: newId }, req.body);

  // adding this tour to the tours array
  tours.push(newTour);

  // persisting this data into the json file
  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (err) => {
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  });
};

// function to update a tour
// we are not writing the logic for this one
const updateTour = (req, res) => {
  const id = parseInt(req.params.id);

  if (id > tours.length - 1) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'sucsess',
    data: {
      tour: '<Updated tour here...>',
    },
  });
};

// function to delete a tour
// we are not writing the logic for this one
const deleteTour = (req, res) => {
  const id = parseInt(req.params.id);

  if (id > tours.length - 1) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  res.status(204).json({
    status: 'sucsess',
    data: null,
  });
};

// GET route to get all the tours
// app.get('/api/v1/tours', getAllTours);

// GET route to get one specific tour through params
// app.get('/api/v1/tours/:id', getTour);

// POST route to create a new tour
// app.post('/api/v1/tours', createTour);

// PATCH route to update a tour
// app.patch('/api/v1/tours/:id', updateTour);

// DELETE route to update a tour
// app.delete('/api/v1/tours/:id',deleteTour);

// prettier-ignore
app
  .route('/api/v1/tours')
  .get(getAllTours)
  .post(createTour);

// prettier-ignore
app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

// starting the server
app.listen(PORT, () => {
  console.log(`App running on PORT ${PORT}`);
});
