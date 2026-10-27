const User = require('../models/User');
const Notification = require('../models/Notification');
const { signToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatar: user.avatar,
  address: user.address,
  createdAt: user.createdAt,
});

/** POST /api/v1/auth/register */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  if (await User.exists({ email: email.toLowerCase() })) {
    throw ApiError.conflict('Email is already registered');
  }

  const user = await User.create({ name, email, password, phone, address, role: 'customer' });

  await Notification.create({
    user: user._id,
    title: 'Welcome to EasyCater!',
    message: 'Your account is ready. Browse our packages and book your event today.',
    type: 'system',
  });

  res.status(201).json({ success: true, data: { user: publicUser(user), token: signToken(user) } });
});

/** POST /api/v1/auth/login */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (!user.isActive) throw ApiError.forbidden('Account is deactivated');

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  res.json({ success: true, data: { user: publicUser(user), token: signToken(user) } });
});

/** GET /api/v1/auth/me */
const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: publicUser(req.user) });
});

/** PUT /api/v1/auth/password */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password updated' });
});

module.exports = { register, login, me, changePassword, publicUser };
