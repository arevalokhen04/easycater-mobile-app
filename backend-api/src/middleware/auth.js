const mongoose = require('mongoose');
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/** Populates req.user when a valid Bearer token is present. */
async function authenticate(req, _res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing Authorization header'));
  }

  try {
    const payload = verifyToken(header.slice(7));
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) {
      return next(ApiError.unauthorized('User no longer active'));
    }
    req.user = user;
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
}

/** Same as authenticate() but does not fail when no token is sent. */
async function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return next();
  try {
    const payload = verifyToken(header.slice(7));
    req.user = await User.findById(payload.sub);
  } catch {
    // ignore invalid token on public routes
  }
  next();
}

module.exports = { authenticate, optionalAuth };
