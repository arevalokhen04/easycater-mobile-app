const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
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

  const [users, total, bookingRows, spendRows] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    User.countDocuments(filter),
    Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: '$customer', count: { $sum: 1 } } },
    ]),
    Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: '$user', sum: { $sum: '$amount' } } },
    ]),
  ]);
  const bookings = new Map(bookingRows.map((r) => [String(r._id), r.count]));
  const spend = new Map(spendRows.map((r) => [String(r._id), r.sum]));

  res.json({
    success: true,
    data: users.map((u) => ({
      ...publicUser(u),
      bookings: bookings.get(String(u._id)) || 0,
      totalSpent: spend.get(String(u._id)) || 0,
    })),
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
  // Whitelist - prevents mass-assignment of email/role/password
  // (bcrypt hashing is a pre-save hook and would be skipped by findByIdAndUpdate).
  const allowed = ['name', 'phone', 'address', 'avatar', 'isActive', 'role'];
  const payload = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) payload[key] = req.body[key];
  });

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: payload },
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
