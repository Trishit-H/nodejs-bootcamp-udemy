/*
We created this file because it's good practice to have everything related to the server in one file and everything related to express in separate file (app.js)

server.js is our main file, where everything starts
*/
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// what this does is it loads the content of config.env file to process.env
dotenv.config({ path: './config.env' });

const app = require('./app');

// here we replace <PASSWORD> in the connection string with the actual password
const DB_URI = process.env.MONGODB_URI.replace('<PASSWORD>', process.env.DB_PASSWORD);

// connecting to database
mongoose
  .connect(DB_URI)
  .then(() => {
    console.log('Connection to database successful');
  })
  .catch((err) => {
    console.log('Error connecting to database:', err.message);
  });

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
});

const Tour = mongoose.model('Tour', tourSchema);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App running on PORT ${PORT}`);
});
