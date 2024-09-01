const express = require('express');

const {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  // checkId,
  checkReqBody,
} = require('../controllers/tourController');

const router = express.Router();

// this middleware is for checking if the param containing the id is valid or not
// router.param('id', checkId);

router.route('/').get(getAllTours).post(checkReqBody, createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
