const mongoose = require('mongoose');
const validator = require('validator');

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
	// We will add more validation and rules when we start to manage passwords
	passwordConfirm: {
		type: String,
		required: [true, 'Please confirm your password!'],
	},
});

// Create and export the User model based on the userSchema
const User = mongoose.model('User', userSchema);

module.exports = User;
