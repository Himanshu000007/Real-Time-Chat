import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendOTPEmail } from '../config/email.js';
import { generateOTP } from '../utils/generateOTP.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/ApiError.js';

const createToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

export const signup = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email }).select('+otp +otpExpires');
  if (existingUser) {
    if (existingUser.isVerified) {
      throw new ApiError(400, 'An account with this email already exists. Please login.');
    }
    const otp = generateOTP(6);
    const hashedOtp = await bcrypt.hash(otp, 10);
    existingUser.name = name;
    existingUser.password = password;
    existingUser.otp = hashedOtp;
    existingUser.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await existingUser.save();
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEV] OTP for', email, '→', otp);
      return res.status(200).json({
        success: true,
        message: 'OTP sent to your email. Please verify to complete signup.',
        email,
      });
    }
    await sendOTPEmail(email, otp);
    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete signup.',
      email,
    });
  }

  const otp = generateOTP(6);
  const hashedOtp = await bcrypt.hash(otp, 10);

  await User.create({
    name,
    email,
    password,
    isVerified: false,
    otp: hashedOtp,
    otpExpires: new Date(Date.now() + 5 * 60 * 1000),
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('[DEV] OTP for', email, '→', otp);
    return res.status(201).json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete signup.',
      email,
    });
  }
  await sendOTPEmail(email, otp);

  res.status(201).json({
    success: true,
    message: 'OTP sent to your email. Please verify to complete signup.',
    email,
  });
});

export const verifyOTP = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email }).select('+otp +otpExpires');
  if (!user) {
    throw new ApiError(404, 'No account found with this email. Please sign up first.');
  }

  if (user.isVerified) {
    throw new ApiError(400, 'Email is already verified. Please login.');
  }

  if (!user.otp || !user.otpExpires) {
    throw new ApiError(400, 'OTP expired or invalid. Please request a new OTP.');
  }

  if (new Date() > user.otpExpires) {
    await User.findByIdAndUpdate(user._id, { $unset: { otp: 1, otpExpires: 1 } });
    throw new ApiError(400, 'OTP has expired. Please request a new OTP.');
  }

  const isMatch = await bcrypt.compare(otp, user.otp);
  if (!isMatch) {
    throw new ApiError(400, 'Invalid OTP. Please check and try again.');
  }

  await User.findByIdAndUpdate(user._id, {
    isVerified: true,
    $unset: { otp: 1, otpExpires: 1 },
  });

  res.status(200).json({
    success: true,
    message: 'Email verified successfully. You can now login.',
    email,
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (!user.isVerified) {
    throw new ApiError(403, 'Please verify your email first. Check your inbox for the OTP.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = createToken(user._id);
  const userResponse = await User.findById(user._id).select('-password -otp -otpExpires');

  res.status(200).json({
    success: true,
    token,
    user: userResponse,
  });
});

export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('-password -otp -otpExpires');
  res.status(200).json({ success: true, user });
});
