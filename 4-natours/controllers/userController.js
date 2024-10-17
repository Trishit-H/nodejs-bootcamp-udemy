const User = require('./../models/user.model.js');
const handleAsyncErrors = require('./../utils/handleAsyncErrors.js');
const AppError = require('./../utils/appError.js');

/**
 * Filters an object to include only specified fields.
 *
 * @param {Object} obj - The original object to filter.
 * @param {...string} allowedFields - A list of allowed field names.
 * @returns {Object} - A new object containing only the allowed fields from the original object.
 *
 * @example
 * // Example usage:
 * const obj = { name: 'Alice', email: 'alice@example.com', password: '12345' };
 * const filteredObj = filterObj(obj, 'name', 'email');
 * // filteredObj = { name: 'Alice', email: 'alice@example.com' }
 */
const filterObj = (obj, ...allowedFields) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => allowedFields.includes(key))
  );
};

/**
 * Controller function to handle profile updates for a user updateMe is an asynchronous function
 *  that allows users to update only specific fields (e.g., 'name' and 'email') and prevents
 * updates to restricted fields like 'password' and 'passwordConfirm'.
 */
const updateMe = handleAsyncErrors(async (req, res, next) => {
  // If the request body contains 'password' or 'passwordConfirm', exit the function.
  // This prevents accidental password changes on this route and directs users to the proper
  // route for updating passwords.
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // Use filterObj to create a new object (filteredBody) with only 'name' and 'email' fields from req.body.
  // This ensures that only allowed fields are updated.
  const filteredBody = filterObj(req.body, 'name', 'email');

  // Update the user's profile using their ID, passing in filteredBody to ensure
  // only allowed fields are updated.
  // The options { new: true, runValidators: true } return the updated document
  // and run validation checks.
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  // Send a success response with the updated user data
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

/**
 * Controller function to let the user delete their account
 * Marks the user's account as inactive by setting the 'active' field to false.
 * This is a "soft delete" function, meaning the user's data isn't removed
 * from the database but is instead flagged as inactive, allowing future reactivation
 * or retention of associated data.
 * Sends a 204 status response indicating successful operation with no content.
 */
const deleteMe = handleAsyncErrors(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// function to get all users
const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined yet...',
  });
};

// function to get one user
const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined yet...',
  });
};

// function to create user
const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined yet...',
  });
};

// function to update user
const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined yet...',
  });
};

// function to delete user
const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined yet...',
  });
};

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
};
