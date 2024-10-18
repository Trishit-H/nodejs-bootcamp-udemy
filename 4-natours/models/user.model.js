const crypto = require('node:crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// Define the User schema with validation rules
const userSchema = new mongoose.Schema({
  // Name field with required validation and trimming of whitespace
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
    trim: true,
  },

  // Email field with unique constraint, lowercase transformation, and email validation
  email: {
    type: String,
    required: [true, 'Please provide an email address!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email!'], // Validates if the email is in a correct format
  },

  // Photo field (optional) to store the user's profile image URL or path
  photo: String,

  // Role field to store various user roles that is used  for
  // authorize users for specific tasks, which defaults to `user` role
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },

  // Password field with required validation and minimum length of 8 characters
  // We will add more validation and rules when we start to manage passwords
  password: {
    type: String,
    required: [true, 'Please add a password for your account!'],
    minLength: [8, 'Password must be at least 8 characters long!'],
    select: false,
  },

  // Password confirmation field with required validation
  // A validator function that checks whether the password and passwordConfirm
  // fields match or not
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
    validate: {
      //  This only works on save() and create() methods!!
      validator: function (val) {
        return val === this.password;
      },
      message: 'Password does not match!',
    },
  },

  // This field stores the time at which the password
  // was changed
  passwordChangedAt: {
    type: Date,
  },

  // Field for storing a temporary reset token
  // This token is generated when a user requests to reset their password and
  // will be compared with the incoming token to validate the reset request.
  passwordResetToken: String,

  // Field for storing the expiration time of the reset token
  // This helps ensure the reset link is only valid for a limited time, improving security.
  passwordResetTokenExpires: Date,

  // Field used to "soft delete" a user
  // if set to false, it means user has been "deleted"
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Password encryption using pre document middleware
// Only encrypt the password if it is changed/updated or,
// the password is newly created
userSchema.pre('save', async function (next) {
  // Check if the password field has been modified
  // If not, we return from this function and call `next()` to proceed to the next middleware
  // This avoids rehashing the password if it hasn't been changed
  if (!this.isModified('password')) return next();

  // If the password has been modified, hash it using bcrypt
  // We pass `10` as the salt rounds, which defines the cost factor (higher is more secure but slower)
  // This hashing ensures the password is stored securely and isn't saved as plain text
  this.password = await bcrypt.hash(this.password, 10);

  // Set `passwordConfirm` to undefined to remove it from the database
  // `passwordConfirm` is only required for user input validation; it’s not needed in the database
  this.passwordConfirm = undefined;

  // Call `next()` to proceed to the next middleware in the chain
  next();
});

// Middleware to set `passwordChangedAt` timestamp for the user document
// Runs before saving the document, but only if the password has been modified
userSchema.pre('save', function (next) {
  // If the password field is not modified or the document is new, exit the middleware
  // `this.isModified('password')` checks if the password was changed
  // `this.isNew` checks if the document is newly created
  if (!this.isModified('password') || this.isNew) return next();

  // Set the `passwordChangedAt` property to the current time minus 1 second
  // This ensures the timestamp is slightly earlier than the JWT creation time (because
  // sometimes the jwt token is created  before the document is saved) to avoid issues
  // where the token is generated before the password is updated
  this.passwordChangedAt = Date.now() - 1000;

  // Move to the next middleware in the stack
  next();
});

// This middleware runs before any query that starts with "find" (e.g., find, findOne).
// It automatically modifies the query to exclude documents where the 'active' field is set to false.
// If 'active' is not false or does not exist, the document will be included in the query results.
// The 'next()' function is called to proceed with the next middleware or execute the query.
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

/**
 * Instance method to compare candidate password with hashed password in the database.
 *
 * This method checks if the provided password (candidatePassword) matches the hashed password
 * stored in the database (userPassword). Since the `password` field is set to `select: false`,
 * it won't be included in query results by default, so we need to pass it manually as `userPassword`.
 *
 * @param {String} candidatePassword - The password input by the user attempting to log in.
 * @param {String} userPassword - The hashed password retrieved from the user document in the database.
 * @returns {Boolean} - Returns true if passwords match, false otherwise.
 */
userSchema.methods.checkPassword = async function (candidatePassword, userPassword) {
  // Uses bcrypt's compare function to match the candidate password and the hashed password.
  // The `bcrypt.compare` method will hash `candidatePassword` and check it against `userPassword`.
  return await bcrypt.compare(candidatePassword, userPassword);
};

/**
 * Checks if the user changed their password after the provided JWT token's creation.
 *
 * This method compares the `passwordChangedAt` timestamp with the JWT token's timestamp.
 * It helps determine if the JWT token should still be valid or if the user needs to re-authenticate
 * due to a recent password change.
 *
 * @method
 * @param {number} JWTTimestamp - The timestamp (in seconds) when the JWT token was issued.
 * @returns {boolean} - Returns `true` if the password was changed after the token was issued, indicating the
 *                      token should no longer be valid. Returns `false` if the password was not changed
 *                      after the token's issuance, so the token remains valid.
 */
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    // Convert `passwordChangedAt` date to a timestamp in seconds
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000);

    console.log(changedTimestamp, JWTTimestamp);

    // If `changedTimestamp` is greater than `JWTTimestamp`,
    // the password was changed after the JWT was created.
    return JWTTimestamp < changedTimestamp;
  }

  // If `passwordChangedAt` is undefined, the password has not been changed,
  // meaning the JWT token remains valid.
  return false;
};

/**
 * Generates a password reset token for the user.
 * This method creates a random reset token, hashes it for secure storage, and sets
 * an expiration time for the token. The raw reset token is returned for sending
 * to the user, while only the hashed version is stored in the database.
 *
 * @method
 * @returns {string} The raw reset token to be sent to the user for password reset verification.
 */
userSchema.methods.createPasswordResetToken = function () {
  // Generate a random token for password reset (32 bytes in hex format).
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash the token using SHA-256 and store it in the database.
  // Storing only the hashed version helps secure the reset process.
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set expiration time to 10 minutes from now to limit token validity period.
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  // Return the raw token for sending in the reset email to the user.
  return resetToken;
};

// Create and export the User model based on the userSchema
const User = mongoose.model('User', userSchema);

module.exports = User;
