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

/**
 * Controller function to calculate tour statistics.
 * - Aggregates data to calculate statistics like the average rating, average price, total number of tours, etc.
 * - Filters tours with a rating average greater than or equal to 4.5.
 * - Groups data by difficulty level and performs calculations for each group.
 * - Sorts the results by average price in descending order.
 * - Excludes results with a difficulty level of 'EASY'.
 */
const getTourStatistics = async (req, res) => {
  try {
    // Start the aggregation pipeline for the `Tour` model
    const stats = await Tour.aggregate([
      // Match stage: Filter tours that have an average rating of at least 4.5
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      // Group stage: Group tours by their difficulty level (converted to uppercase)
      // and calculate statistics like total tours, total ratings, average rating, etc.
      {
        $group: {
          _id: { $toUpper: '$difficulty' }, // Group by difficulty level in uppercase
          totalTours: { $sum: 1 }, // Count the total number of tours in each group
          totalRatings: { $sum: '$ratingsQuantity' }, // Sum up the total number of ratings
          avgRating: { $avg: '$ratingsAverage' }, // Calculate the average rating
          avgPrice: { $avg: '$price' }, // Calculate the average price
          minPrice: { $min: '$price' }, // Find the minimum price
          maxPrice: { $max: '$price' }, // Find the maximum price
        },
      },
      // Sort stage: Sort the groups by the average price in descending order
      {
        $sort: { avgPrice: -1 },
      },
      // Match stage: Exclude the 'EASY' difficulty level from the final results
      {
        $match: { _id: { $ne: 'EASY' } },
      },
    ]);

    // Send the aggregated statistics as the response
    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (err) {
    // If an error occurs, send a fail status with the error message
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

/**
 * Controller function to get a monthly plan for tours in a given year.
 * - Filters tours based on their start dates to match the specified year.
 * - Groups the tours by the month they start.
 * - Calculates the total number of tours for each month.
 * - Returns the names of the tours and the month they belong to.
 */
const getMonthlyPlan = async (req, res) => {
  try {
    // Parse the year from the request parameters and convert it to a number
    const year = Number(req.params.year);

    // Start the aggregation pipeline for the `Tour` model
    const plan = await Tour.aggregate([
      // Unwind stage: Deconstruct the `startDates` array so that each date becomes a separate document
      {
        $unwind: '$startDates',
      },
      // Match stage: Filter tours that have start dates within the specified year
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`), // Start of the year
            $lte: new Date(`${year}-12-31`), // End of the year
          },
        },
      },
      // Group stage: Group tours by the month of their start date
      // and calculate the total number of tours for each month
      {
        $group: {
          _id: { $month: '$startDates' }, // Group by the month (from the start date)
          totalTours: { $sum: 1 }, // Count the total number of tours in each group
          tours: { $push: '$name' }, // Collect the names of the tours in each group
        },
      },
      // AddFields stage: Add the month field to the results
      {
        $addFields: { month: '$_id' }, // Rename the `_id` field to `month`
      },
      // Project stage: Exclude the `_id` field from the final output
      {
        $project: {
          _id: 0, // Exclude the `_id` field
        },
      },
      // Sort stage: Sort the results by the total number of tours in descending order
      {
        $sort: { totalTours: -1 },
      },
    ]);

    // Send the aggregated monthly plan as the response
    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (err) {
    // If an error occurs, send a fail status with the error message
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
  getTourStatistics,
  getMonthlyPlan,
};
