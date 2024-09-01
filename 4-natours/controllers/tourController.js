const Tour = require('./../models/tour.model');

// function to get all tours
const getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    // results: tours.length,
    // data: {
    //   tours,
    // },
  });
};

// function to get one tour by params
const getTour = (req, res) => {
  // converting the id to Number type because everything is stored as string in req.params
  const id = parseInt(req.params.id);

  // using find method to access the object whose id matches with the one in the params
  // if no object found, then find returns undefined
  // const tour = tours.find((element) => element.id === id);

  res.status(200).json({
    status: 'success',
    // data: {
    //   tour,
    // },
  });
};

// function to create a new tour
const createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent',
    });
  }
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
  // checkId,
};
