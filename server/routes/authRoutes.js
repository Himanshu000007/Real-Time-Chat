import express from 'express';
import {
  signup,
  verifyOTP,
  login,
  getMe,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  validateSignup,
  validateVerifyOTP,
  validateLogin,
} from '../middleware/validate.js';
import { otpRateLimiter } from '../middleware/rateLimitOTP.js';

const router = express.Router();

router.post('/signup', otpRateLimiter, validateSignup, signup);
router.post('/verify-otp', otpRateLimiter, validateVerifyOTP, verifyOTP);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);

export default router;
