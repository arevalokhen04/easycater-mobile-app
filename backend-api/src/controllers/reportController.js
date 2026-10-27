const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Package = require('../models/Package');
const asyncHandler = require('../utils/asyncHandler');

const range = (req) => {
  const from = req.query.from ? new Date(req.query.from) : new Date(new Date().getFullYear(), 0, 1);
  const to = req.query.to ? new Date(req.query.to) : new Date();
  return { from, to };
};

/** GET /api/v1/reports/sales */
const sales = asyncHandler(async (req, res) => {
  const { from, to } = range(req);

  const [byPackage, totals] = await Promise.all([
    Booking.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to }, status: { $ne: 'cancelled' } } },
      { $group: { _id: '$package', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
      { $populate: { path: '_id', model: 'Package', select: 'name category' } },
      { $sort: { revenue: -1 } },
    ]),
    Payment.aggregate([
      { $match: { status: 'paid', paidAt: { $gte: from, $lte: to } } },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$amount' },
          payments: { $sum: 1 },
          byMethod: { $push: '$method' },
        },
      },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      range: { from, to },
      revenue: totals[0]?.revenue || 0,
      payments: totals[0]?.payments || 0,
      byMethod: (totals[0]?.byMethod || []).reduce((acc, m) => ({ ...acc, [m]: (acc[m] || 0) + 1 }), {}),
      byPackage: byPackage.map((r) => ({
        package: r._id,
        bookings: r.count,
        revenue: r.revenue,
      })),
    },
  });
});

/** GET /api/v1/reports/top-packages?limit=5 */
const topPackages = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 5;

  const rows = await Booking.aggregate([
    { $match: { status: { $nin: ['cancelled', 'pending'] } } },
    { $group: { _id: '$package', bookings: { $sum: 1 }, revenue: { $sum: '$total' } } },
    { $sort: { bookings: -1 } },
    { $limit: limit },
    { $lookup: { from: 'packages', localField: '_id', foreignField: '_id', as: 'package' } },
    { $unwind: '$package' },
    {
      $project: {
        _id: 0,
        bookings: 1,
        revenue: 1,
        package: { name: '$package.name', category: '$package.category', image: '$package.image' },
      },
    },
  ]);

  res.json({ success: true, data: rows });
});

/** GET /api/v1/reports/bookings */
const bookings = asyncHandler(async (req, res) => {
  const { from, to } = range(req);

  const rows = await Booking.aggregate([
    { $match: { eventDate: { $gte: from, $lte: to } } },
    {
      $group: {
        _id: { year: { $year: '$eventDate' }, month: { $month: '$eventDate' } },
        count: { $sum: 1 },
        guests: { $sum: '$guestCount' },
        revenue: { $sum: '$total' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({ success: true, data: rows });
});

/** GET /api/v1/reports/customers */
const customers = asyncHandler(async (_req, res) => {
  const rows = await Booking.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    { $group: { _id: '$customer', bookings: { $sum: 1 }, spend: { $sum: '$total' } } },
    { $sort: { spend: -1 } },
    { $limit: 10 },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        bookings: 1,
        spend: 1,
        user: { name: '$user.name', email: '$user.email' },
      },
    },
  ]);

  res.json({ success: true, data: rows });
});

module.exports = { sales, topPackages, bookings, customers };
