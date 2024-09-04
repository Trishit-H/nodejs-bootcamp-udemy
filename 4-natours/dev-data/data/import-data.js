const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('./../../models/tour.model');

dotenv.config({ path: './config.env' });

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

// read the json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

// import data to the database
const addData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data added successfully');
  } catch (err) {
    console.log('Error adding data:', err);
  }
  process.exit();
};

// delete data from the database
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data deleted successfully');
  } catch (err) {
    console.log('Error deleting data:', err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  addData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
