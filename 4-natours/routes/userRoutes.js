const express = require('express');

const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
} = require('../controllers/userController');

const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protectedRoute,
} = require('./../controllers/authController');

const router = express.Router();

// This routes are for signning up, logging in users
router.post('/signup', signUp);
router.post('/login', login);

//Route for user to update their password when they are logged in
router.patch('/updateMyPassword', protectedRoute, updatePassword);

// Route for user to update data besides their password when they are logged in
router.patch('/updateMe', protectedRoute, updateMe);

// Route for user to delete their account when they are logged in
router.delete('/deleteMe', protectedRoute, deleteMe);

// These routes are for forgot and reset password
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
