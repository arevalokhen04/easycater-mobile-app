const Booking = require('../models/Booking');
const Package = require('../models/Package');
const MenuItem = require('../models/MenuItem');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const SERVICE_RATE = 0.10; // 10%
const TAX_RATE = 0.12; // 12%

function computeTotals(pkg, guestCount, addOns = []) {
  const subtotal = pkg.pricePerHead * guestCount + addOns.reduce((sum, a) => sum + a.price * a.quantity, 0);
  const serviceCharge = Math.round(subtotal * SERVICE_RATE * 100) / 100;
  const tax = Math.round((subtotal + serviceCharge) * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + serviceCharge + tax) * 100) / 100;
  return { subtotal, serviceCharge, tax, total };
}

/** GET /api/v1/bookings */
const list = asyncHandler(async (req, res) => {
  const { status, paymentStatus, from, to, search, page = 1, limit = 20 } = req.query;

  const filter = {};
  // Admins see everything, customers only their own
  if (req.user.role !== 'admin') filter.customer = req.user._id;
  if (status) filter.status = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (from || to) {
    filter.eventDate = {};
    if (from) filter.eventDate.$gte = new Date(from);
    if (to) filter.eventDate.$lte = new Date(to);
  }
  if (search) {
    filter.bookingNumber = new RegExp(search.trim(), 'i');
  }

  const [items, total] = await Promise.all([
    Booking.find(filter)
      .populate('customer', 'name email phone')
      .populate('package', 'name slug pricePerHead image')
      .sort({ eventDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Booking.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    meta: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
  });
});

/** GET /api/v1/bookings/:id */
const getOne = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('customer', 'name email phone')
    .populate('package', 'name slug pricePerHead image inclusions')
    .populate('addOns.menuItem', 'name image');

  if (!booking) throw ApiError.notFound('Booking not found');
  if (req.user.role !== 'admin' && booking.customer._id.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not your booking');
  }

  const payments = await Payment.find({ booking: booking._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: { ...booking.toObject(), payments } });
});

/** POST /api/v1/bookings */
const create = asyncHandler(async (req, res) => {
  const { package: packageId, eventDate, eventTime, guestCount, venue, address, notes, eventType, addOns = [] } =
    req.body;

  const pkg = await Package.findById(packageId);
  if (!pkg) throw ApiError.notFound('Package not found');
  if (!pkg.isActive) throw ApiError.badRequest('This package is no longer available');

  if (guestCount < pkg.minGuests || guestCount > pkg.maxGuests) {
    throw ApiError.badRequest(
      `Guest count must be between ${pkg.minGuests} and ${pkg.maxGuests} for this package`
    );
  }

  const resolvedAddOns = await Promise.all(
    addOns.map(async (a) => {
      const item = await MenuItem.findById(a.menuItem);
      if (!item) throw ApiError.notFound(`Menu item ${a.menuItem} not found`);
      return { menuItem: item._id, name: item.name, price: item.price, quantity: a.quantity || 1 };
    })
  );

  const totals = computeTotals(pkg, guestCount, resolvedAddOns);

  const booking = await Booking.create({
    customer: req.user._id,
    package: pkg._id,
    eventType: eventType || pkg.category,
    eventDate,
    eventTime,
    guestCount,
    venue,
    address,
    notes,
    addOns: resolvedAddOns,
    ...totals,
  });

  await Notification.create({
    user: req.user._id,
    title: 'Booking received',
    message: `Your booking ${booking.bookingNumber} for ${pkg.name} is pending confirmation.`,
    type: 'booking',
    data: { bookingId: booking._id },
  });

  res.status(201).json({ success: true, data: booking });
});

/** PUT /api/v1/bookings/:id  (admin - status management) */
const updateStatus = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw ApiError.notFound('Booking not found');

  const { status, notes } = req.body;
  if (status) booking.status = status;
  if (notes !== undefined) booking.notes = notes;
  await booking.save();

  await Notification.create({
    user: booking.customer,
    title: 'Booking update',
    message: `Your booking ${booking.bookingNumber} is now "${booking.status}".`,
    type: 'booking',
    data: { bookingId: booking._id },
  });

  res.json({ success: true, data: booking });
});

/** PATCH /api/v1/bookings/:id/cancel */
const cancel = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw ApiError.notFound('Booking not found');
  if (req.user.role !== 'admin' && booking.customer.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not your booking');
  }
  if (['completed', 'cancelled'].includes(booking.status)) {
    throw ApiError.badRequest(`Booking is already ${booking.status}`);
  }

  booking.status = 'cancelled';
  await booking.save();

  await Notification.create({
    user: booking.customer,
    title: 'Booking cancelled',
    message: `Booking ${booking.bookingNumber} has been cancelled.`,
    type: 'booking',
  });

  res.json({ success: true, data: booking });
});

/** GET /api/v1/bookings/:id/quote - price preview without saving */
const quote = asyncHandler(async (req, res) => {
  const { package: packageId, guestCount, addOns = [] } = req.body;

  const pkg = await Package.findById(packageId);
  if (!pkg) throw ApiError.notFound('Package not found');

  const resolvedAddOns = await Promise.all(
    addOns.map(async (a) => {
      const item = await MenuItem.findById(a.menuItem);
      if (!item) throw ApiError.notFound(`Menu item ${a.menuItem} not found`);
      return { menuItem: item._id, name: item.name, price: item.price, quantity: a.quantity || 1 };
    })
  );

  res.json({ success: true, data: computeTotals(pkg, Number(guestCount), resolvedAddOns) });
});

module.exports = { list, getOne, create, updateStatus, cancel, quote, computeTotals };
