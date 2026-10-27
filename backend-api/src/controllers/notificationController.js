const Notification = require('../models/Notification');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

/** GET /api/v1/notifications */
const list = asyncHandler(async (req, res) => {
  const { isRead, page = 1, limit = 20 } = req.query;

  const filter = { user: req.user._id };
  if (isRead === 'true') filter.isRead = true;
  if (isRead === 'false') filter.isRead = false;

  const [items, total, unread] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: req.user._id, isRead: false }),
  ]);

  res.json({
    success: true,
    data: items,
    meta: { page: Number(page), limit: Number(limit), total, unread },
  });
});

/** GET /api/v1/notifications/unread-count */
const unreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ user: req.user._id, isRead: false });
  res.json({ success: true, data: { count } });
});

/** PATCH /api/v1/notifications/:id/read */
const markRead = asyncHandler(async (req, res) => {
  const item = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: { isRead: true } },
    { new: true }
  );
  res.json({ success: true, data: item });
});

/** PATCH /api/v1/notifications/read-all */
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { $set: { isRead: true } });
  res.json({ success: true, message: 'All notifications marked as read' });
});

/** DELETE /api/v1/notifications/:id */
const remove = asyncHandler(async (req, res) => {
  await Notification.deleteOne({ _id: req.params.id, user: req.user._id });
  res.json({ success: true, message: 'Notification deleted' });
});

/** POST /api/v1/notifications  (admin - broadcast) */
const broadcast = asyncHandler(async (req, res) => {
  const { title, message, type = 'system', userIds } = req.body;

  const recipients = userIds?.length
    ? await User.find({ _id: { $in: userIds } })
    : await User.find({ role: 'customer' });

  const docs = recipients.map((u) => ({ user: u._id, title, message, type }));
  await Notification.insertMany(docs);

  res.status(201).json({ success: true, message: `Sent to ${docs.length} user(s)` });
});

module.exports = { list, unreadCount, markRead, markAllRead, remove, broadcast };
