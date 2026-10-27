const express = require('express');
const ctrl = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');

const router = express.Router();

router.use(authenticate);

router.get('/', ctrl.list);
router.get('/unread-count', ctrl.unreadCount);
router.patch('/read-all', ctrl.markAllRead);
router.patch('/:id/read', ctrl.markRead);
router.delete('/:id', ctrl.remove);
router.post('/broadcast', requireAdmin, ctrl.broadcast);

module.exports = router;
