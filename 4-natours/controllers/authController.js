/**
 * authController.js function is responsible for
 *   - sign up users
 *   - sign in users
 *   - resetting password
 *   - and all things related to authentication
 */

const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/user.model.js');
const handleAsyncErrors = require('./../utils/handleAsyncErrors.js');
const AppError = require('./../utils/appError.js');

// Function to generate a JSON Web Token for a user based on their user ID
/**
 * @param {String} id - The mongodb _id of a user document
 * @returns {String} - JWT token
 */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Controller function to create/sign-up a new user
 * This function handles the user registration process, ensuring data integrity
 * and security by validating and controlling the input fields.
 */
const signUp = handleAsyncErrors(async (req, res) => {
  // The code below demonstrates an insecure approach and poses serious security risks:
  // Directly inserting `req.body` into the database allows any field from the request body
  // to be saved, which means a malicious user could add a `role: admin` field, granting themselves admin access.
  // This approach should be avoided for data integrity and security reasons.
  // const newUser = await User.create(req.body);

  // Correct approach:
  // Instead, explicitly specify only the fields needed for creating a user in the database.
  // This way, any unwanted or potentially harmful fields are ignored, preventing unauthorized
  // roles or permissions from being assigned.
  const newUser = await User.create({
    name: req.body.name, // User's name, required for registration
    email: req.body.email, // User's email, must be unique and valid
    password: req.body.password, // User's password, must meet security requirements
    passwordConfirm: req.body.passwordConfirm, // Confirmation of the user's password
    passwordChangedAt: req.body.passwordChangedAt || undefined,
    role: req.body.role || 'user',
  });

  // Set password to undefined before sending the response
  // This is to ensure we don't leak password as a security flaw
  newUser.password = undefined;

  // Generate a JSON Web Token (JWT) for the newly created user using the `signToken` method
  // This token is used for authentication in subsequent requests, allowing the user to remain logged in.
  const token = signToken(newUser._id);

  // Send a response back to the client with the status, token, and user data.
  res.status(201).json({
    status: 'success', // Indicate the request was successful
    token, // Send the generated token to the client
    data: {
      user: newUser, // Send the created user data back to the client
    },
  });
});

/**
 * Controller function for logging in an existing user.
 * This function validates the user's credentials (email and password)
 * and generates a JWT token if they are valid.
 */
const login = handleAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if both email and password are provided
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Query the database for the user by email, including the password field,
  // which is typically excluded due to `select: false` in the User schema
  // so we have to add a `+` sign when selection password
  const user = await User.findOne({ email }).select('+password');

  // Verify the user exists and that the provided password matches the stored password
  // To do that we use the `checkPassword`instance method that we defined in the userSchema
  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // Generate a new token for the user upon successful login
  const token = signToken(user._id);

  // Send success response with the token to authenticate future requests
  res.status(200).json({
    status: 'success',
    token,
  });
});

/**
 * Middleware function to protect routes that require authentication.
 * Validates the JWT token, checks if the user still exists,
 * and verifies if the password was not changed after the token was issued.
 */
const protectedRoute = handleAsyncErrors(async (req, res, next) => {
  // 1) Get the token from the request headers if present
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Extract the token from the `Authorization` header (e.g., "Bearer <token>")
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token is provided, return a 401 Unauthorized error
  if (!token) {
    return next(new AppError('You are not logged in!', 401));
  }

  // 2) Verify the token using JWT and the secret key
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if the user still exists in the database
  const user = await User.findById(decoded.id);
  if (!user) {
    // If the user associated with this token no longer exists, return a 401 Unauthorized error
    return next(new AppError('The user for this token no longer exists', 401));
  }

  // 4) Verify if the user changed their password after the token was issued
  // using the changedPasswordAfter instance method defined on each documentof the
  // user model
  if (user.changedPasswordAfter(decoded.iat)) {
    // If the password has been changed since the token was issued, the token is invalidated.
    // Return a 401 Unauthorized error and prompt the user to log in again.
    return next(
      new AppError(
        'Your password was changed. Please log in again with your new password!',
        401
      )
    );
  }

  // 5) Grant access to the protected route by attaching the user to the request object
  // and calling the next function
  req.user = user;
  next();
});

/**
 * `restrictedRoute` is a higher-order middleware function that restricts access to specific user roles
 * It uses closures to "remember" the roles passed to it and checks if the authenticated user has permission.
 */
const restrictedRoute =
  // Accepts a variable number of role arguments (e.g., 'admin', 'manager')
  // and collects them into an array called `roles` using the rest parameter.

    (...roles) =>
    // Returns the actual middleware function, with access to `roles` due to closures.
    (req, res, next) => {
      // `req.user` is expected to be populated by a prior authentication middleware - `protectedRoute`.
      // This middleware should authenticate the user and store user data in `req.user`.

      // Checks if the user's role, `req.user.role`, is included in the allowed `roles` array.
      if (!roles.includes(req.user.role)) {
        // If the user's role is not allowed, an error is passed to the next middleware
        // with a 403 Forbidden status code and an error message.
        return next(
          new AppError('You do not have permission to perform this action', 403)
        );
      }

      // If the user has one of the allowed roles, `next()` is called to proceed with the request.
      next();
    };

module.exports = {
  signUp,
  login,
  protectedRoute,
  restrictedRoute,
};
