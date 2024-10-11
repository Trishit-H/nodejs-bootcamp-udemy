/**
 * authController.js file is responsible for
 *   - sign up users
 *   - sign in users
 *   - resetting password
 *   - and all things related to authentication
 */

const crypto = require('node:crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/user.model.js');
const handleAsyncErrors = require('./../utils/handleAsyncErrors.js');
const AppError = require('./../utils/appError.js');
const sendEmail = require('./../utils/email.js');

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

/**
 * Forgot Password Controller
 * This asynchronous function handles the password reset process by:
 * 1) Checking if the user exists based on the provided email.
 * 2) Generating a unique, temporary token for password reset and saving it to the database.
 * 3) Sending an email to the user with a link to reset their password.

 * How It Works:
 * - If no user is found with the given email, the function sends a 404 error.
 * - If the user is found:
 *    1) A reset token is created using the `createPasswordResetToken` instance method which also 
 *       temporarily stores the token on the user object, in the passwordResetToken field defined in the userSchema.
 *    2) The user data is saved (to save the passwordResetToken field), bypassing validations (so that only the token updates).
 *    3) An email with the reset URL is sent to the user.
 * - If email sending fails, the function clears the reset token fields and reports an error.
 */
const forgotPassword = handleAsyncErrors(async (req, res, next) => {
  // 1) Get user based on POSTed email
  // Finds the user in the database by matching the email provided in the request body
  const user = await User.findOne({ email: req.body.email });

  // If no user is found, return an error to the client
  if (!user) {
    // Passes an error to the next middleware, indicating that no user exists with this email
    return next(new AppError('There is no user with this email address', 404));
  }

  // 2) Generate the random reset token
  // Calls a method on the user instance to create a random password reset token
  const resetToken = user.createPasswordResetToken();
  // Saves the reset token and its expiration time to the user document in the database
  // `validateBeforeSave: false` bypasses other schema validations to allow quick saving of just the reset token fields
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  // Constructs the password reset URL, which includes the generated reset token as part of the URL
  // URL would look like this - http://127.0.0.1:8000/api/v1/users/reset-password/57843ytu74t74twejfbyugfywe
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/reset-password/${resetToken}`;

  // Defines the email message with instructions for the user to reset their password
  const message = `Forgot your password? Submit a patch request with your new password 
  and passwordConfirm to: ${resetURL}\nIf you didn't forget your password, please ignore this
  email`;

  try {
    // Attempts to send an email to the user's email address containing the reset token and instructions
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for only 10 minutes)',
      message,
    });

    // Sends a successful response to the client, confirming that the reset email has been sent
    res.status(200).json({
      status: 'success',
      message: 'Password reset token sent to your email',
    });
  } catch (err) {
    // If email sending fails, clears the reset token fields on the user document
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    // Saves the user document without the reset token fields, disabling validation for quick update
    await user.save({ validateBeforeSave: false });

    // Passes an error to the next middleware, indicating a problem with sending the email
    return next(
      new AppError('There was an error sending the email. Try again later.', 500)
    );
  }
});

/**
 * resetPassword - Resets a user's password using a secure token provided in the URL.
 *
 * Workflow:
 * 1. Retrieves the user based on an encrypted token and checks if it is valid.
 * 2. If valid, updates the user's password and clears the reset token fields.
 * 3. Ensures the password validation occurs and updates the `passwordChangedAt` field.
 * 4. Logs the user in by generating a new JSON Web Token (JWT) and sends it as the response.
 */
const resetPassword = handleAsyncErrors(async (req, res, next) => {
  // 1) Get the user based on the token
  // To do this we need the unencrypted token from the reset-password url. Then we will encrypt it
  // using the same process we did to encrypt it in the `createResetPasswordToken` instance method
  // defined on the userSchema. We do this because, using that particular process, we always get the
  // same encrypted value for an input no matter how many times we run it.
  // T hen we can use this token to do a findOne({passwordResetToken: value}) query to find the user

  // 1.a) Encrypt the hash token that we get from req.params
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  // 1.b) Find the user using this encrypted token and check if the token expiration time is greater
  // than the current date to deterime if the token is still valid or not
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  // 2) If the token has not expired, and there is a user, set the new password
  // and also use `passwordConfirm` field to check if the passwords are same. Then set
  // the `passwordResetToken` and `passwordResetTokenExpires` fields to undefined which
  // essentially deletes these fields from the database

  // 2.a) If no user is foud using the token that is appended in the url, then it means
  // either the token has expired or it the user doesn't correspond with this particular
  // token. In that case send back an error
  if (!user) {
    return next(new AppError('Token has either expired or is not valid', 400));
  }

  // 2.b) Set the password and passwordConfirm field from req.body
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  // 2.c) Set the `passwordResetToken` and `passwordResetTokenExpires` field to undefined
  // to delete them from the user document.
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;

  // 2.d) Then we save the user document. This time without using { validateBeforeSave: false }.
  // This ensures that the `password` and `passwordConfirm` fields are validated.
  // This doesn't throw errors for other fields that are required because we updating an existing
  // field even though the validation runs for all the fields in the document
  await user.save();

  // 3) Update the changedPasswordAt property for the user
  // This is done using the pre save hook that is defined on the userSchema

  // 4) After the password has been updated, we need to login the user.
  // We do this by generating a jsonwebtoken and sending it back as a response
  // Using the token, the client can login again.

  // 4.a) Generate the token using `signToken` function
  const token = signToken(user._id);

  // 4.b) Send the token back as response allowing the user to login
  res.status(200).json({
    status: 'success',
    token,
  });
});

module.exports = {
  signUp,
  login,
  protectedRoute,
  restrictedRoute,
  forgotPassword,
  resetPassword,
};
