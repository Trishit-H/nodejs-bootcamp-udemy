const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

// Define the tour schema which will outline the structure of each document in the "tours" collection
// The schema enforces specific data types and validation rules for each field
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [40, 'A tour name must be equal or less than 40 characters'],
      minLength: [10, 'A tour name must have at least 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
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
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be equal or above 1.0'],
      max: [5, 'Rating must be equal or less 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // the this keyword here refers to the current document only when we are creating a new document
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below the regular price',
      },
    },
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
    secretTour: {
      type: Boolean,
      default: false,
    },
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

// DOCUMENT MIDDLEWARE: Executes before .save() and .create(), but not for .insertMany().
// The 'save' is a pre-save hook, which allows us to run custom logic before saving the document to the database.
// The 'this' keyword refers to the document instance that is being saved.
// In this middleware, we generate a slug from the document's name field and assign it to the slug property.
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// DOCUMENT MIDDLEWARE: Pre-save hook that runs before a document is saved to the database.
// This middleware will execute right before the document is persisted to the database.
// We can use this hook for logging, validation, or modifying the document before saving.
tourSchema.pre('save', function (next) {
  console.log('Will save document to database...');
  next();
});

// DOCUMENT MIDDLEWARE: Post-save hook that runs after a document has been saved to the database.
// This middleware executes after the document has been successfully persisted.
// The 'doc' argument refers to the saved document, which can be logged, processed, or used for further actions.
tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});

// QUERY MIDDLEWARE: Middleware functions that execute before queries like find(), findOne(), findOneAndUpdate(), etc.
// The `this` keyword in this context refers to the Query object that is about to be executed.

// PRE-QUERY MIDDLEWARE to modify queries before execution
// This middleware will be applied to all queries that start with 'find' (e.g., find, findOne, findOneAndUpdate, etc.)
// It adds a filter to exclude documents where `secretTour` is true and tracks the start time of the query.
tourSchema.pre(/^find/, function (next) {
  // Modify the query to exclude documents where `secretTour` is true
  this.find({ secretTour: { $ne: true } });

  // Add a custom property to the Query object to track the start time
  this.start = Date.now();

  next();
});

// POST-QUERY MIDDLEWARE that executes after the query has been executed
// This middleware is applied to all queries that start with 'find' (e.g., find, findOne, findOneAndUpdate, etc.)
// It logs the duration of the query and the documents returned by the query.
tourSchema.post(/^find/, function (docs, next) {
  // Access the custom property set in the `pre` middleware
  // Calculate and log the duration of the query by subtracting the start time from the current time
  console.log(`Query took ${Date.now() - this.start} milliseconds`);

  // `docs` contains the documents returned by the query
  // console.log(docs);

  next();
});

// AGGREGATION MIDDLEWARE: This middleware is executed before an aggregation pipeline is run.
// The `pre` hook allows us to modify the aggregation pipeline or add additional stages before the query is executed.
// This middleware is for the /tour-stats route
tourSchema.pre('aggregate', function (next) {
  // `this` refers to the aggregation object.

  // `this.pipeline()` returns the array of stages in the aggregation pipeline.
  // `unshift()` adds a new stage to the beginning of the pipeline.
  // We are adding a `$match` stage to filter out documents where `secretTour` is true.
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

  // Log the modified pipeline to the console for debugging purposes.
  console.log(this.pipeline());

  next();
});

// Create the Tour model using the defined schema
// This model represents the "tours" collection in the MongoDB database
const Tour = mongoose.model('Tour', tourSchema);

// Export the Tour model for use in other parts of the application
module.exports = Tour;
