import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

export const protect = async (req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'Not authorized. Please login.'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password -otp -otpExpires');
    if (!user) {
      return next(new ApiError(401, 'User not found. Please login again.'));
    }
    if (!user.isVerified) {
      return next(new ApiError(403, 'Please verify your email before accessing the app.'));
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Session expired. Please login again.'));
    }
    return next(new ApiError(401, 'Invalid token. Please login again.'));
  }
};
