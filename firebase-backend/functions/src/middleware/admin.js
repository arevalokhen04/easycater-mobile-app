const ApiError = require('../utils/ApiError');

/** Allows only admin accounts through. Must run after authenticate(). */
function requireAdmin(req, _res, next) {
  if (!req.user) return next(ApiError.unauthorized());
  if (req.user.role !== 'admin') return next(ApiError.forbidden('Admin access required'));
  next();
}

module.exports = requireAdmin;
