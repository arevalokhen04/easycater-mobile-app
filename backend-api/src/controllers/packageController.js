const Package = require('../models/Package');
const MenuItem = require('../models/MenuItem');
const Booking = require('../models/Booking');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const slugify = require('../utils/slugify');
const { absoluteUrl, saveDataImage } = require('../utils/images');

/** GET /api/v1/packages */
const list = asyncHandler(async (req, res) => {
  const { search, category, isPopular, minPrice, maxPrice, page = 1, limit = 20 } = req.query;

  // Admins manage inactive packages too; customers only see active ones.
  const isAdmin = req.user?.role === 'admin';
  const filter = {};
  if (!isAdmin) filter.isActive = true;
  if (category) filter.category = category;
  if (isPopular === 'true') filter.isPopular = true;
  if (minPrice || maxPrice) {
    filter.pricePerHead = {};
    if (minPrice) filter.pricePerHead.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerHead.$lte = Number(maxPrice);
  }
  if (search) {
    const rx = new RegExp(search.trim(), 'i');
    filter.$or = [{ name: rx }, { description: rx }];
  }

  const [items, total, bookedRows] = await Promise.all([
    Package.find(filter)
      .sort({ isPopular: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Package.countDocuments(filter),
    Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: '$package', count: { $sum: 1 } } },
    ]),
  ]);
  const booked = new Map(bookedRows.map((r) => [String(r._id), r.count]));

  res.json({
    success: true,
    data: items.map((p) => ({
      ...p.toObject(),
      image: absoluteUrl(req, p.image),
      bookedCount: booked.get(String(p._id)) || 0,
    })),
    meta: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
  });
});

/** GET /api/v1/packages/:idOrSlug */
const getOne = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const query = /^[0-9a-fA-F]{24}$/.test(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug };

  const item = await Package.findOne(query);
  if (!item) throw ApiError.notFound('Package not found');

  const menu = await MenuItem.find({ package: item._id, isAvailable: true });
  res.json({
    success: true,
    data: { ...item.toObject(), image: absoluteUrl(req, item.image), menu },
  });
});

/** POST /api/v1/packages  (admin) */
const create = asyncHandler(async (req, res) => {
  if (req.body.image && req.body.image.startsWith('data:')) {
    req.body.image = saveDataImage('pkg', req.body.image);
  }
  const payload = { ...req.body, slug: slugify(req.body.slug || req.body.name) };
  // Rating policy: 1-5 only - negatives and overflow values are clamped.
  if (payload.rating !== undefined && payload.rating !== null && payload.rating !== '') {
    const n = Number(payload.rating);
    payload.rating = Number.isNaN(n) ? undefined : Math.min(5, Math.max(1, n));
  }
  const item = await Package.create({ ...payload, createdBy: req.user._id });
  item.image = absoluteUrl(req, item.image);
  res.status(201).json({ success: true, data: item });
});

/** PUT /api/v1/packages/:id  (admin) */
const update = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (payload.name && !payload.slug) payload.slug = slugify(payload.name);
  if (payload.image && payload.image.startsWith('data:')) {
    payload.image = saveDataImage('pkg', payload.image);
  }
  if (payload.rating !== undefined && payload.rating !== null && payload.rating !== '') {
    const n = Number(payload.rating);
    payload.rating = Number.isNaN(n) ? undefined : Math.min(5, Math.max(1, n));
  }

  const item = await Package.findByIdAndUpdate(req.params.id, { $set: payload }, {
    new: true,
    runValidators: true,
  });
  if (!item) throw ApiError.notFound('Package not found');
  item.image = absoluteUrl(req, item.image);
  res.json({ success: true, data: item });
});

/** DELETE /api/v1/packages/:id  (admin) */
const remove = asyncHandler(async (req, res) => {
  const item = await Package.findByIdAndDelete(req.params.id);
  if (!item) throw ApiError.notFound('Package not found');
  await MenuItem.deleteMany({ package: item._id });
  res.json({ success: true, message: 'Package deleted' });
});

module.exports = { list, getOne, create, update, remove };
