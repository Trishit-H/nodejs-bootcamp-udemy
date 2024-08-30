const fs = require('fs');

// reading mock data
const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// callback function for router.param middleware that check whether the id present in the request is valid or not
const checkId = (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);

  const id = parseInt(req.params.id);

  if (id > tours.length - 1) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  next();
};

// this middlleware is for checking whether the req.body has name and the price field when creating a new tour
const checkReqBody = (req, res, next) => {
  const { name, price } = req.body;

  if (!name || !price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price field!',
    });
  }

  next();
};

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
  fs.writeFile(`${__dirname}/../dev-data/data/tours-simple.json`, JSON.stringify(tours), (err) => {
    if (err) {
      res.status(500).json({
        status: 'fail',
        message: err.message,
      });
    }

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
  res.status(204).json({
    status: 'sucsess',
    data: null,
  });
};

// exporting the functions
module.exports = {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  checkId,
  checkReqBody,
};
