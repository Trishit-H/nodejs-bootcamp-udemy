/**
 * authController.js function is responsible for
 *   - sign up users
 *   - sign in users
 *   - resetting password
 *   - and all things related to authentication
 */

const User = require('./../models/user.model.js');
const handleAsyncErrors = require('./../utils/handleAsyncErrors.js');

/**
 * Controller function to create/sign-up a new user
 */
const signUp = handleAsyncErrors(async (req, res) => {
	const newUser = await User.create(req.body);

	res.status(201).json({
		status: 'success',
		data: {
			user: newUser,
		},
	});
});

module.exports = {
	signUp,
};
