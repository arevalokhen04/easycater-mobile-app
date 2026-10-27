const express = require('express');
const ctrl = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/', ctrl.summary);
router.get('/chart', ctrl.revenueChart);

module.exports = router;
