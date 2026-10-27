const express = require('express');
const rateLimit = require('express-rate-limit');
const ctrl = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many attempts, please try again later' },
});

router.post('/register', authLimiter, ctrl.register);
router.post('/login', authLimiter, ctrl.login);
router.get('/me', authenticate, ctrl.me);
router.put('/password', authenticate, ctrl.changePassword);

module.exports = router;
