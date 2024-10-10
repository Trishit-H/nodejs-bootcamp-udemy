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

// Create and export the User model based on the userSchema
const User = mongoose.model('User', userSchema);

module.exports = User;
