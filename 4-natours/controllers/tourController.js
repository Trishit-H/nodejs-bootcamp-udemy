const Tour = require('./../models/tour.model');

// function to get all tours
const getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find();

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

// function to get one tour by params
const getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
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
