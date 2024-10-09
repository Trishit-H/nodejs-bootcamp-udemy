const express = require('express');
const {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStatistics,
  getMonthlyPlan,
} = require('./../controllers/tourController');
const { protectedRoute } = require('./../controllers/authController.js');

const router = express.Router();

// Route for getting the top 5 highest-rated cheap tours
// This is an alias for the URL /api/v1/tours?sort=-ratingsAverage,price&limit=5
// It uses the aliasTopTours middleware to pre-configure the query parameters before calling getAllTours
router.route('/get-top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getTourStatistics);

router.route('/monthly-plan/:year').get(getMonthlyPlan);

// Routes for handling all tours (GET all tours and POST a new tour)
router.route('/').get(protectedRoute, getAllTours).post(createTour);

// Routes for handling a single tour by ID (GET, PATCH, DELETE)
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
