const express = require('express');
const ctrl = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/sales', ctrl.sales);
router.get('/top-packages', ctrl.topPackages);
router.get('/bookings', ctrl.bookings);
router.get('/customers', ctrl.customers);

module.exports = router;
