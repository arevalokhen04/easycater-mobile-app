/**
 * Wraps an async route handler so rejected promises reach the error middleware.
 * Express 5 forwards rejections automatically, but this keeps intent explicit.
 */
module.exports = function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
