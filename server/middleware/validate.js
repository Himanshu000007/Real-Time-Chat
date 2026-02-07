import validator from 'validator';
import { ApiError } from '../utils/ApiError.js';

export const validateSignup = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push('Name is required and must be a non-empty string.');
  } else if (name.trim().length > 50) {
    errors.push('Name cannot exceed 50 characters.');
  }

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required.');
  } else if (!validator.isEmail(email.trim())) {
    errors.push('Please provide a valid email address.');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required.');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters.');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, errors.join(' ')));
  }
  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  next();
};

export const validateVerifyOTP = (req, res, next) => {
  const { email, otp } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required.');
  } else if (!validator.isEmail(email.trim())) {
    errors.push('Please provide a valid email address.');
  }

  if (!otp || typeof otp !== 'string') {
    errors.push('OTP is required.');
  } else if (!/^\d{6}$/.test(otp.trim())) {
    errors.push('OTP must be exactly 6 digits.');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, errors.join(' ')));
  }
  req.body.email = email.trim().toLowerCase();
  req.body.otp = otp.trim();
  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required.');
  } else if (!validator.isEmail(email.trim())) {
    errors.push('Please provide a valid email address.');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, errors.join(' ')));
  }
  req.body.email = email.trim().toLowerCase();
  next();
};

export const validateSendMessage = (req, res, next) => {
  const { receiverId, content } = req.body;
  const errors = [];

  if (!receiverId) {
    errors.push('Receiver ID is required.');
  }

  if (content === undefined || content === null) {
    errors.push('Message content is required.');
  } else if (typeof content !== 'string') {
    errors.push('Message content must be a string.');
  } else if (content.trim().length === 0) {
    errors.push('Message cannot be empty.');
  } else if (content.length > 5000) {
    errors.push('Message cannot exceed 5000 characters.');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, errors.join(' ')));
  }
  req.body.content = content.trim();
  next();
};
