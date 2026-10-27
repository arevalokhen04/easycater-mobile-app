const MenuItem = require('../models/MenuItem');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/** GET /api/v1/menu */
const list = asyncHandler(async (req, res) => {
  const { search, category, dietary, package: pkg, isFeatured, page = 1, limit = 50 } = req.query;

  const filter = {};
  if (category) filter.category = category;
  if (pkg) filter.package = pkg;
  if (isFeatured === 'true') filter.isFeatured = true;
  if (dietary) filter.dietary = { $in: dietary.split(',').map((d) => d.trim()) };
  if (search) filter.name = new RegExp(search.trim(), 'i');

  const [items, total] = await Promise.all([
    MenuItem.find(filter)
      .populate('package', 'name slug')
      .sort({ isFeatured: -1, name: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    MenuItem.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    meta: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
  });
});

/** GET /api/v1/menu/categories */
const categories = asyncHandler(async (_req, res) => {
  const rows = await MenuItem.aggregate([
    { $match: { isAvailable: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  res.json({ success: true, data: rows.map((r) => ({ category: r._id, count: r.count })) });
});

/** GET /api/v1/menu/:id */
const getOne = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id).populate('package', 'name slug');
  if (!item) throw ApiError.notFound('Menu item not found');
  res.json({ success: true, data: item });
});

/** POST /api/v1/menu  (admin) */
const create = asyncHandler(async (req, res) => {
  const item = await MenuItem.create(req.body);
  res.status(201).json({ success: true, data: item });
});

/** PUT /api/v1/menu/:id  (admin) */
const update = asyncHandler(async (req, res) => {
  const item = await MenuItem.findByIdAndUpdate(req.params.id, { $set: req.body }, {
    new: true,
    runValidators: true,
  });
  if (!item) throw ApiError.notFound('Menu item not found');
  res.json({ success: true, data: item });
});

/** DELETE /api/v1/menu/:id  (admin) */
const remove = asyncHandler(async (req, res) => {
  const item = await MenuItem.findByIdAndDelete(req.params.id);
  if (!item) throw ApiError.notFound('Menu item not found');
  res.json({ success: true, message: 'Menu item deleted' });
});

module.exports = { list, categories, getOne, create, update, remove };
