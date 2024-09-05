const Tour = require('./../models/tour.model');
const APIFeatures = require('./../utils/apiFeatures');

/**
 * Middleware to set default query parameters for fetching top 5 cheap tours.
 * This middleware modifies the query parameters in the request to:
 * - Limit results to 5 tours
 * - Sort by ratingsAverage (descending) and price (ascending)
 * - Select specific fields: name, price, ratingsAverage, summary, difficulty
 */
const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

/**
 * Controller function to get all tours based on query parameters.
 * - Uses the `APIFeatures` class to apply filtering, field limiting, and pagination.
 * - Responds with a JSON object containing the list of tours and their count.
 */
const getAllTours = async (req, res) => {
  try {
    // Create an instance of APIFeatures with the query and request parameters.
    const features = new APIFeatures(Tour.find(), req.query)
      .filter() // Apply filtering based on query parameters
      .sort() // Apply sorting based on query values
      .limitingFields() // Limit fields to be returned
      .paginate(); // Implement pagination

    // Execute the query and retrieve the tours
    const tours = await features.query;

    // Respond with a success status and the list of tours
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    // Respond with a fail status and error message if an error occurs
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

/**
 * Controller function to get a single tour by its ID.
 * - Finds the tour by its ID from the request parameters.
 * - Responds with the tour data if found.
 */
const getTour = async (req, res) => {
  try {
    // Find a single tour by ID
    const tour = await Tour.findById(req.params.id);

    // Respond with the tour data if found
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    // Respond with a fail status and error message if an error occurs
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

/**
 * Controller function to create a new tour.
 * - Creates a new tour document with the data provided in the request body.
 * - Responds with the newly created tour data.
 */
const createTour = async (req, res) => {
  try {
    // Create a new tour with the request body data
    const newTour = await Tour.create(req.body);

    // Respond with the created tour data
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    // Respond with a fail status and error message if invalid data is sent
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent',
    });
  }
};

/**
 * Controller function to update an existing tour by its ID.
 * - Updates the tour with the data provided in the request body.
 * - Responds with the updated tour data.
 */
const updateTour = async (req, res) => {
  try {
    // Update the tour by ID and return the updated document
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Run validators to ensure data integrity
    });

    // Respond with the updated tour data
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    // Respond with a fail status and error message if an error occurs
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

/**
 * Controller function to delete a tour by its ID.
 * - Deletes the tour document identified by the request parameters.
 * - Responds with a success status and no data upon successful deletion.
 */
const deleteTour = async (req, res) => {
  try {
    // Delete the tour by ID
    await Tour.findByIdAndDelete(req.params.id);

    // Respond with a success status and no content
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    // Respond with a fail status and error message if an error occurs
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

// Exporting the controller functions for use in routing
module.exports = {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
};
