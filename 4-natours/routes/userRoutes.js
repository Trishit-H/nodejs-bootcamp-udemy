const express = require('express');

const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
} = require('./../controllers/authController');

const router = express.Router();

// This routes are for signning up, logging in users
router.post('/signup', signUp);
router.post('/login', login);

// These routes are for forgot and reset password
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password', resetPassword);

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
