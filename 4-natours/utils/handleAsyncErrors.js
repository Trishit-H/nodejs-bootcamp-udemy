/**
 * This utility function `handleAsyncErrors` is used to handle errors in asynchronous
 * route handler functions in an Express application.
 *
 * ### How it works:
 *
 * 1. **Accepts a Function (Async Middleware/Route Handler)**:
 *    - The `handleAsyncErrors` function takes an async function `fn` as an argument. This `fn`
 *      represents an Express route handler or middleware that is
 *      asynchronous (i.e., it returns a promise or uses `async/await`).
 *
 * 2. **Returns a New Function**:
 *    - `handleAsyncErrors` returns a new function that receives the usual Express
 *       parameters: `req`, `res`, and `next`.
 *    -  When the returned function is called, it invokes the passed `fn(req, res, next)`
 *       (i.e., the async handler function).
 *
 * 3. **Error Handling with `.catch()`**:
 *    - The key part of the returned function is that it immediately appends
 *      `.catch(next)` to the async handler.
 *    - This ensures that if `fn` throws an error or its promise is rejected, the
 *      error will automatically be passed to `next()`. In Express, calling `next()`
 *      with an error argument directs the error to the global error-handling middleware.
 *
 * 4. **Eliminates the Need for Try-Catch**:
 *    - Normally, handling async errors would require wrapping the code inside
 *      a try-catch block. This utility function removes the need for that, making
 *      the code cleaner by avoiding repetitive try-catch statements.
 *
 * ### How it helps in the workflow:
 *
 * - **Keeps Controllers Clean**: With `handleAsyncErrors`, you can focus on the core logic
 *   in your route handlers without worrying about manually catching errors. This reduces
 *   code duplication and makes your controller functions more readable.
 *
 * - **Consistent Error Handling**: It ensures that all async errors are consistently
 *   passed to Express' global error handling middleware, improving overall error management
 *   across the application.
 *
 * - **Simplifies Code**: Instead of writing repetitive try-catch blocks in each route
 *   handler, you wrap the async function with `handleAsyncErrors`, allowing you to focus
 *   solely on the functionality of each route.
 *
 * ### Example Usage:
 *
 * Before `handleAsyncErrors`, you'd need to write:
 * ```js
 * const createTour = async (req, res, next) => {
 *   try {
 *     const newTour = await Tour.create(req.body);
 *     res.status(201).json({ status: 'success', data: { tour: newTour } });
 *   } catch (err) {
 *      status: 'fail',
 *      message: err.message
 *     })
 *   }
 * };
 * ```
 *
 * With `handleAsyncErrors`, it simplifies to:
 * ```js
 * const createTour = handleAsyncErrors(async (req, res, next) => {
 *   const newTour = await Tour.create(req.body);
 *   res.status(201).json({ status: 'success', data: { tour: newTour } });
 * });
 * ```
 */

module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
