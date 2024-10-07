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

	// Password field with required validation and minimum length of 8 characters
	// We will add more validation and rules when we start to manage passwords
	password: {
		type: String,
		required: [true, 'Please add a password for your account!'],
		minLength: [8, 'Password must be at least 8 characters long!'],
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

// Create and export the User model based on the userSchema
const User = mongoose.model('User', userSchema);

module.exports = User;
