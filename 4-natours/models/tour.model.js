const mongoose = require('mongoose');

// Define the tour schema which will outline the structure of each document in the "tours" collection
// The schema enforces specific data types and validation rules for each field
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      required: [true, 'A tour must have a summary'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    startDates: [Date],
  },
  {
    // Schema options:
    // timestamps: Automatically adds `createdAt` and `updatedAt` fields to the schema.
    // toJSON and toObject: Enables the virtual properties (like `durationInWeeks`) to be included when the documents are converted to JSON or plain objects.
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// durationInWeeks - a virtual property that calculates and returns the duration in weeks based on the `duration` field (assumed to be in days).
// This property won't be stored in the database but can be accessed like a normal field when retrieving documents.
tourSchema.virtual('durationInWeeks').get(function () {
  return (this.duration / 7).toFixed(1); // Convert days to weeks and round to one decimal place.
});

// Create the Tour model using the defined schema
// This model represents the "tours" collection in the MongoDB database
const Tour = mongoose.model('Tour', tourSchema);

// Export the Tour model for use in other parts of the application
module.exports = Tour;
