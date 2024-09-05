const Tour = require('./../models/tour.model');

// function to get all tours
const getAllTours = async (req, res) => {
  try {
    // B U I L D    Q U E R Y
    // 1a) FILTERING

    // create a copy of the req.query object
    const queryObject = { ...req.query };

    // these are the query params that we don't want to search by
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    // remove the fields present in excludedFields array from queryObject
    excludedFields.forEach((el) => delete queryObject[el]);

    // 1b) ADVANCED FILTERING
    // here we replace the operator coming from req.query with mongodb operator
    // operators to replace - gte, gt, lte, lt with $gte, $gt, $lte, $lt

    // first convert the query object to a string
    let queryString = JSON.stringify(queryObject);
    queryString = queryString.replace(/\b(?:gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // we build our Query object here, with the filtering query and store it in the query variable
    let query = Tour.find(JSON.parse(queryString));

    // 2) SORTING
    // check if we have a sort query in the query param
    if (req.query.sort) {
      // to get a string in the following format "field1 field2..." from "field1,field2..."
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy); // if there is, then chain the sort method and pass in sortBy as the argument
    } else {
      query = query.sort('-ratingsAverage'); // if no sort query is given, sort by ratingsAverage field
    }

    // 3) FIELD LIMITING
    if (req.query.fields) {
      const selectFields = req.query.fields.split(',').join(' ');
      query = query.select(selectFields);
    } else {
      query = query.select('-__v -createdAt -updatedAt');
    }

    // 4) PAGINATION
    // page=2&limit=10 ---> page 1, 1-10 docs; page 2, 11-20 docs; page 3, 21-30 docs ...

    const page = Number(req.query.page) || 1; // convert the page value to a number and have a default value of 1
    const limit = Number(req.query.limit) || 100; // convert the limit value to a number and have a default value of 1
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // this is to check if we have any more document to show
    if (req.query.page) {
      const docCount = await Tour.countDocuments();
      if (skip >= docCount) {
        throw new Error("This page doesn't exist");
      }
    }

    // E X E C U T E   Q U E R Y
    const tours = await query.exec();

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
      message: err.message,
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
const updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

// function to delete a tour
const deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
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
