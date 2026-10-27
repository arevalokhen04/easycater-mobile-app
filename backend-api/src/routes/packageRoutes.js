const express = require('express');
const ctrl = require('../controllers/packageController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');
const upload = require('../middleware/upload');

const router = express.Router();

// Public / customer
router.get('/', optionalAuth, ctrl.list);
router.get('/:idOrSlug', optionalAuth, ctrl.getOne);

// Admin
router.post('/', authenticate, requireAdmin, ctrl.create);
router.put('/:id', authenticate, requireAdmin, ctrl.update);
router.delete('/:id', authenticate, requireAdmin, ctrl.remove);
router.post('/upload', authenticate, requireAdmin, upload.single('image'), (req, res) => {
  res.json({ success: true, data: { url: `/uploads/${req.file.filename}` } });
});

module.exports = router;
