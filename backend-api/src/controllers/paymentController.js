const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/** GET /api/v1/payments */
const list = asyncHandler(async (req, res) => {
  const { status, method, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (req.user.role !== 'admin') filter.user = req.user._id;
  if (status) filter.status = status;
  if (method) filter.method = method;

  const [items, total] = await Promise.all([
    Payment.find(filter)
      .populate('booking', 'bookingNumber eventDate total')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Payment.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    meta: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
  });
});

/** GET /api/v1/payments/:id */
const getOne = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('booking', 'bookingNumber eventDate total')
    .populate('user', 'name email');
  if (!payment) throw ApiError.notFound('Payment not found');
  if (req.user.role !== 'admin' && payment.user._id.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not your payment');
  }
  res.json({ success: true, data: payment });
});

/** POST /api/v1/payments - record a payment against a booking */
const create = asyncHandler(async (req, res) => {
  const { booking: bookingId, amount, method } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw ApiError.notFound('Booking not found');
  if (req.user.role !== 'admin' && booking.customer.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not your booking');
  }
  if (amount > booking.total) throw ApiError.badRequest('Amount exceeds booking total');

  const payment = await Payment.create({
    booking: booking._id,
    user: booking.customer,
    amount,
    method,
    status: 'paid',
    paidAt: new Date(),
  });

  const paidTotal = await Payment.aggregate([
    { $match: { booking: booking._id, status: 'paid' } },
    { $group: { _id: null, sum: { $sum: '$amount' } } },
  ]);

  const sum = paidTotal[0]?.sum || 0;
  booking.paymentStatus = sum >= booking.total ? 'paid' : 'partial';
  await booking.save();

  await Notification.create({
    user: booking.customer,
    title: 'Payment received',
    message: `We received your payment of ${amount.toLocaleString()} for booking ${booking.bookingNumber}.`,
    type: 'payment',
    data: { bookingId: booking._id },
  });

  res.status(201).json({ success: true, data: payment });
});

/** PUT /api/v1/payments/:id  (admin - verify / refund) */
const updateStatus = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) throw ApiError.notFound('Payment not found');

  const { status } = req.body;
  payment.status = status;
  if (status === 'paid') payment.paidAt = new Date();
  await payment.save();

  await Notification.create({
    user: payment.user,
    title: 'Payment update',
    message: `Your payment ${payment.referenceNumber} is now "${status}".`,
    type: 'payment',
  });

  res.json({ success: true, data: payment });
});

module.exports = { list, getOne, create, updateStatus };
