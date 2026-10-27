const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Package = require('../models/Package');
const MenuItem = require('../models/MenuItem');
const asyncHandler = require('../utils/asyncHandler');

const startOfDay = (d) => {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

/** GET /api/v1/dashboard  (admin) */
const summary = asyncHandler(async (_req, res) => {
  const today = startOfDay(new Date());

  const [
    totalBookings,
    pendingBookings,
    upcomingBookings,
    totalCustomers,
    totalPackages,
    activeMenuItems,
    revenueAgg,
    bookingsByStatus,
    recentBookings,
  ] = await Promise.all([
    Booking.countDocuments(),
    Booking.countDocuments({ status: 'pending' }),
    Booking.countDocuments({ eventDate: { $gte: new Date() }, status: { $ne: 'cancelled' } }),
    User.countDocuments({ role: 'customer' }),
    Package.countDocuments({ isActive: true }),
    MenuItem.countDocuments({ isAvailable: true }),
    Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Booking.find()
      .populate('customer', 'name email')
      .populate('package', 'name')
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  res.json({
    success: true,
    data: {
      totalBookings,
      pendingBookings,
      upcomingBookings,
      totalCustomers,
      totalPackages,
      activeMenuItems,
      totalRevenue: revenueAgg[0]?.total || 0,
      bookingsByStatus: Object.fromEntries(bookingsByStatus.map((r) => [r._id, r.count])),
      recentBookings,
    },
  });
});

/** GET /api/v1/dashboard/chart?months=6 */
const revenueChart = asyncHandler(async (req, res) => {
  const months = Math.min(Number(req.query.months) || 6, 24);
  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1));
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const rows = await Payment.aggregate([
    { $match: { status: 'paid', paidAt: { $gte: since } } },
    {
      $group: {
        _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } },
        revenue: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const labels = [];
  for (let i = 0; i < months; i += 1) {
    const d = new Date(since);
    d.setMonth(since.getMonth() + i);
    labels.push({
      label: d.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
      revenue: 0,
      count: 0,
    });
  }

  rows.forEach((r) => {
    const idx = (r._id.year - since.getFullYear()) * 12 + (r._id.month - since.getMonth());
    if (labels[idx]) {
      labels[idx].revenue = r.revenue;
      labels[idx].count = r.count;
    }
  });

  res.json({ success: true, data: labels });
});

module.exports = { summary, revenueChart };
