/**
 * APIFeatures class is responsible for applying query operations such as filtering, sorting,
 * field limiting, and pagination to a Mongoose query object based on the incoming HTTP request parameters.
 *
 * It enables chaining of methods to refine the query before executing it against the database.
 */

class APIFeatures {
  constructor(query, queryString) {
    // The `query` is the Mongoose query object that will be used to interact with the database.
    // The `queryString` is the HTTP request query parameters (e.g., req.query) received from the client.
    this.query = query;
    this.queryString = queryString;
  }

  // Method to apply filtering to the Mongoose query based on the query parameters in the request.
  filter() {
    // Create a shallow copy of the query parameters (queryString) from the request.
    // This ensures we don't modify the original object while manipulating it.
    const queryObject = { ...this.queryString };

    // Define an array of fields that should be excluded from filtering.
    // These fields (e.g., `page`, `sort`, `limit`, `fields`) are used for other operations like pagination, sorting, etc.
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    // Loop through the `excludedFields` array and delete each of these fields from the `queryObject`.
    // This prevents them from being used as part of the filtering conditions.
    excludedFields.forEach((el) => delete queryObject[el]);

    // ADVANCED FILTERING:
    // Convert the `queryObject` to a string so that we can manipulate it using regular expressions.
    // We aim to transform query parameters like `gte`, `gt`, `lte`, `lt` into MongoDB operators (`$gte`, `$gt`, `$lte`, `$lt`).
    let queryStr = JSON.stringify(queryObject);

    // Use a regular expression to find and replace the query operators (gte, gt, lte, lt) with their corresponding MongoDB operators.
    // For example, `duration[gte]=5` becomes `{ duration: { $gte: 5 } }`.
    queryStr = queryStr.replace(/\b(?:gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // Parse the modified query string back into an object and use it to build the Mongoose query.
    // The `find()` method does not execute the query but returns a Mongoose Query object, allowing for further chaining.
    this.query = this.query.find(JSON.parse(queryStr));

    // Return `this` to allow for method chaining in the `APIFeatures` class.
    return this;
  }

  // Method for sorting the query results based on the fields specified in the request query string.
  sort() {
    if (this.queryString.sort) {
      // If the `sort` parameter is provided in the query string, convert it into a format
      // that Mongoose can use. The sort fields are separated by commas in the request,
      // but MongoDB expects space-separated fields.
      const sortBy = this.queryString.sort.split(',').join(' ');

      // Chain the `sort()` method to the query and pass the formatted sort fields.
      this.query = this.query.sort(sortBy);
    } else {
      // If no sort parameter is provided, the default sorting is by `ratingsAverage` in descending order.
      this.query = this.query.sort('-ratingsAverage');
    }

    // Return `this` to enable method chaining in the `APIFeatures` class.
    return this;
  }

  // Method for limiting the fields returned in the query results.
  limitingFields() {
    if (this.queryString.fields) {
      // If the `fields` parameter is provided in the query string, convert it into a format
      // that Mongoose can use. The requested fields are separated by commas in the request,
      // but MongoDB expects space-separated fields.
      const selectFields = this.queryString.fields.split(',').join(' ');

      // Chain the `select()` method to the query and pass the formatted fields to be selected.
      this.query = this.query.select(selectFields);
    } else {
      // If no `fields` parameter is provided, exclude certain fields (e.g., `__v`, `createdAt`, `updatedAt`)
      // from the results by default. The `-` sign indicates exclusion.
      this.query = this.query.select('-__v -createdAt -updatedAt');
    }

    // Return `this` to enable method chaining in the `APIFeatures` class.
    return this;
  }

  // Method for implementing pagination in the query results.
  paginate() {
    // Convert the `page` and `limit` query parameters into numbers, and set default values
    // if they are not provided. `page` defaults to 1, and `limit` defaults to 100.
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 100;

    // Calculate the number of documents to skip based on the current page.
    // For example, on page 2 with a limit of 10, you would skip the first 10 results.
    const skip = (page - 1) * limit;

    // Chain the `skip()` and `limit()` methods to the query to implement pagination.
    this.query = this.query.skip(skip).limit(limit);

    // Return `this` to enable method chaining in the `APIFeatures` class.
    return this;
  }
}

// Exporting the APIFeatures class
module.exports = APIFeatures;
