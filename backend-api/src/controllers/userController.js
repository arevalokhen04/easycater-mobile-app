const User = require('../models/User');
const Booking = require('../models/Booking');
const { publicUser } = require('./authController');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/** GET /api/v1/users?search=&role=&page=&limit=  (admin) */
const listUsers = asyncHandler(async (req, res) => {
  const { search, role, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (search) {
    const rx = new RegExp(search.trim(), 'i');
    filter.$or = [{ name: rx }, { email: rx }];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: users.map(publicUser),
    meta: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
  });
});

/** GET /api/v1/users/:id */
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  res.json({ success: true, data: publicUser(user) });
});

/** PUT /api/v1/users/:id */
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!user) throw ApiError.notFound('User not found');
  res.json({ success: true, data: publicUser(user) });
});

/** DELETE /api/v1/users/:id */
const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    throw ApiError.badRequest('You cannot delete your own account');
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  res.json({ success: true, message: 'User deleted' });
});

/** GET /api/v1/users/:id/bookings */
const userBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ customer: req.params.id }).sort({ eventDate: -1 });
  res.json({ success: true, data: bookings });
});

module.exports = { listUsers, getUser, updateUser, deleteUser, userBookings };
