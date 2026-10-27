const express = require('express');
const ctrl = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/', ctrl.listUsers);
router.get('/:id', ctrl.getUser);
router.get('/:id/bookings', ctrl.userBookings);
router.put('/:id', ctrl.updateUser);
router.delete('/:id', ctrl.deleteUser);

module.exports = router;
