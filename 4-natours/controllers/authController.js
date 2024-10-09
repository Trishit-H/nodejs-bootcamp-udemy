/**
 * authController.js function is responsible for
 *   - sign up users
 *   - sign in users
 *   - resetting password
 *   - and all things related to authentication
 */

const jwt = require('jsonwebtoken');
const User = require('./../models/user.model.js');
const handleAsyncErrors = require('./../utils/handleAsyncErrors.js');

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
	});

	// Generate a JSON Web Token (JWT) for the newly created user.
	// This token is used for authentication in subsequent requests, allowing the user to remain logged in.
	const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN, // Token expiration time, set in environment variables
	});

	// Send a response back to the client with the status, token, and user data.
	res.status(201).json({
		status: 'success', // Indicate the request was successful
		token, // Send the generated token to the client
		data: {
			user: newUser, // Send the created user data back to the client
		},
	});
});

module.exports = {
	signUp,
};
