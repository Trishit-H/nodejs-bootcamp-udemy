/*
 * This file is our main entry point for the application.
 * It is responsible for setting up the server and connecting to the database.
 *
 * The structure follows good practices by separating server-related code (this file)
 * from Express-related configuration (app.js).
 */

const dotenv = require('dotenv');
const mongoose = require('mongoose');

// THIS MUST BE ON TOP
// Handling uncaught exceptions
// Uncaught exceptions - all errors or bugs that occur in our synchronous code but are
// not handled anywhere in the program
// To handle this process object emits the "uncaughtException" event which we can listen to
// using process.on
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION !! SHUTTING DOWN ...');
  console.log({
    name: err.name,
    message: err.message,
    error: err,
  });

  // Exit the process (node application) with a failure code (1)
  process.exit(1);
});

// Load environment variables from the config.env file into process.env
// This allows us to access environment-specific variables (e.g., DB credentials, PORT)
dotenv.config({ path: './config.env' });

const app = require('./app');

// Replace <PASSWORD> in the MongoDB connection string with the actual password from the environment variables
// This creates the final URI used to connect to the MongoDB database
const DB_URI = process.env.MONGODB_URI.replace('<PASSWORD>', process.env.DB_PASSWORD);

// Connect to the MongoDB database using Mongoose
// If the connection is successful, log a success message; otherwise, catch and log any errors
// Rejected promise is handled by the "unhandledRejection" event listener on the process object
mongoose.connect(DB_URI).then(() => {
  console.log('Connection to database successful');
});

// Define the port on which the server will run, defaulting to 3000 if not specified in the environment
const PORT = process.env.PORT || 3000;

// Start the server and listen for incoming requests on the specified port
// Once the server is up, log a message indicating that the app is running
// We store the result of the listen method on the server variable
// We will use this `server` variable to close the server later
const server = app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});

// This is listening to unhandled rejection errors i.e., the errors that occurs from
// promises that are rejected but don't have the catch() method to handle it
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION !! SHUTTING DOWN ...');
  console.log({
    name: err.name,
    message: err.message,
    error: err,
  });

  // We close the server which gives enough time for the server to finish any request or
  // work it is currently doing and after it's done we exit our node app
  server.close(() => {
    // Exit the process (node application) with a failure code (1)
    process.exit(1);
  });
});
