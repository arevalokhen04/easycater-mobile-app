const Booking = require('../models/Booking');
const Package = require('../models/Package');
const MenuItem = require('../models/MenuItem');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const SERVICE_RATE = 0.10; // 10%
const TAX_RATE = 0.12; // 12%

// Booking rules - kept in sync with mobile-app/src/app/core/services/booking.service.ts
const LEAD_DAYS = 7; // events must be booked at least this many days ahead
const CANCEL_CUTOFF_HOURS = 2; // cancellations close this many hours before the event

function computeTotals(pkg, guestCount, addOns = []) {
  const subtotal = pkg.pricePerHead * guestCount + addOns.reduce((sum, a) => sum + a.price * a.quantity, 0);
  const serviceCharge = Math.round(subtotal * SERVICE_RATE * 100) / 100;
  const tax = Math.round((subtotal + serviceCharge) * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + serviceCharge + tax) * 100) / 100;
  return { subtotal, serviceCharge, tax, total };
}

/** Earliest bookable event date (today + LEAD_DAYS), local-timezone safe. */
function earliestEventDate() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + LEAD_DAYS);
  return d;
}

/** Event start as a Date from "YYYY-MM-DD" + "h:mm AM/PM". */
function eventStart(eventDate, eventTime) {
  const base = new Date(eventDate);
  const match = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(String(eventTime || ''));
  if (match) {
    let hours = Number(match[1]) % 12;
    if (match[3].toUpperCase() === 'PM') hours += 12;
    base.setHours(hours, Number(match[2]), 0, 0);
  } else {
    base.setHours(0, 0, 0, 0);
  }
  return base;
}

/** GET /api/v1/bookings/taken-dates - dates that already hold an active booking */
const takenDates = asyncHandler(async (_req, res) => {
  // Only live bookings hold a date: cancelled events freed it, and completed
  // events are finished - their day must be bookable again.
  const rows = await Booking.aggregate([
    { $match: { status: { $nin: ['cancelled', 'completed'] } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$eventDate' } } } },
    { $sort: { _id: 1 } },
  ]);
  res.json({ success: true, data: rows.map((r) => r._id) });
});

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

  const paidSums = await paidTotals(items.map((b) => b._id));
  res.json({
    success: true,
    data: items.map((b) => ({ ...b.toObject(), amountPaid: paidSums.get(String(b._id)) || 0 })),
    meta: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
  });
});

/** Sum of confirmed payments per booking id. */
const paidTotals = async (bookingIds) => {
  if (!bookingIds.length) return new Map();
  const rows = await Payment.aggregate([
    { $match: { booking: { $in: bookingIds }, status: 'paid' } },
    { $group: { _id: '$booking', sum: { $sum: '$amount' } } },
  ]);
  return new Map(rows.map((r) => [String(r._id), r.sum]));
};

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
  const amountPaid = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  res.json({ success: true, data: { ...booking.toObject(), payments, amountPaid } });
});

/** POST /api/v1/bookings */
const create = asyncHandler(async (req, res) => {
  const { package: packageId, eventDate, eventTime, guestCount, venue, address, notes, eventType, addOns = [] } =
    req.body;

  const pkg = await Package.findById(packageId);
  if (!pkg) throw ApiError.notFound('Package not found');
  if (!pkg.isActive) throw ApiError.badRequest('This package is no longer available');

  // Complete details required before a booking can be created
  if (!venue || !String(venue).trim()) throw ApiError.badRequest('Enter the venue name to continue');
  if (!address || !String(address).trim()) throw ApiError.badRequest('Enter the venue address to continue');

  // Service area - we only cater events inside General Tinio, Nueva Ecija
  if (!String(address).includes('General Tinio, Nueva Ecija')) {
    throw ApiError.badRequest('We only cater events inside General Tinio, Nueva Ecija');
  }

  // 7-day lead time
  const requested = new Date(eventDate);
  if (Number.isNaN(requested.getTime())) throw ApiError.badRequest('Choose a valid event date');
  if (requested < earliestEventDate()) {
    throw ApiError.badRequest(
      `Events must be booked at least ${LEAD_DAYS} days ahead - the earliest date is ${earliestEventDate().toISOString().slice(0, 10)}`
    );
  }

  // One event per day - a date with an active booking is fully booked.
  // Range match: stored dates may carry a time component (seed data).
  const dayStart = new Date(requested);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
  const clash = await Booking.findOne({
    eventDate: { $gte: dayStart, $lt: dayEnd },
    status: { $ne: 'cancelled' },
  });
  if (clash) {
    throw ApiError.badRequest('That date is already fully booked - please choose another date');
  }

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
  if (status) {
    // Payment gating: work starts only after a downpayment, and an event can
    // be completed only once the balance is fully settled.
    if (status !== 'cancelled' && booking.paymentStatus === 'unpaid') {
      throw ApiError.badRequest('This booking has no payment yet - collect the downpayment first.');
    }
    if (status === 'completed' && booking.paymentStatus !== 'paid') {
      throw ApiError.badRequest('The remaining balance must be paid before completing this booking.');
    }
    booking.status = status;
  }
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

  // Paid bookings are locked - they are fixed and can no longer be cancelled
  if (booking.paymentStatus === 'paid' || booking.paymentStatus === 'partial') {
    throw ApiError.badRequest('Locked - this booking is fixed: details and cancellation can no longer be changed');
  }

  // Cancellations close CANCEL_CUTOFF_HOURS before the event starts
  const msUntilStart = eventStart(booking.eventDate, booking.eventTime).getTime() - Date.now();
  if (msUntilStart <= CANCEL_CUTOFF_HOURS * 60 * 60 * 1000) {
    throw ApiError.badRequest(
      `Cancellation closed - events can only be cancelled more than ${CANCEL_CUTOFF_HOURS} hours before the start time`
    );
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

module.exports = { list, getOne, create, updateStatus, cancel, quote, takenDates, computeTotals };
