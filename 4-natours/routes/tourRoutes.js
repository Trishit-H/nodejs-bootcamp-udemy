const express = require('express');

const {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
} = require('../controllers/tourController');

const router = express.Router();

// alias for /api/v1/tours?sort=-ratingsAverage,price&limit=5
// it returns the top 5 highest rated cheap tours
router.route('/get-top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/').get(getAllTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
