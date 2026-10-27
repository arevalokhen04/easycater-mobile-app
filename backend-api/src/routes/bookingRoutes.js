const express = require('express');
const ctrl = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');

const router = express.Router();

router.use(authenticate);

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.post('/quote', ctrl.quote);
router.patch('/:id/cancel', ctrl.cancel);
router.put('/:id/status', requireAdmin, ctrl.updateStatus);

module.exports = router;
