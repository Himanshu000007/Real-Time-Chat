import Message from '../models/Message.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/ApiError.js';
import mongoose from 'mongoose';

export const getChats = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const messages = await Message.aggregate([
    {
      $match: {
        $or: [{ senderId: userId }, { receiverId: userId }],
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ['$senderId', userId] },
            '$receiverId',
            '$senderId',
          ],
        },
        lastMessage: { $first: '$$ROOT' },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 1,
        lastMessage: 1,
        'user._id': 1,
        'user.name': 1,
        'user.email': 1,
        'user.profilePic': 1,
        'user.isVerified': 1,
      },
    },
    { $sort: { 'lastMessage.createdAt': -1 } },
  ]);

  const chats = messages.map((m) => ({
    user: m.user,
    lastMessage: m.lastMessage
      ? {
          content: m.lastMessage.content,
          createdAt: m.lastMessage.createdAt,
          status: m.lastMessage.status,
          senderId: m.lastMessage.senderId,
        }
      : null,
  }));

  res.status(200).json({ success: true, chats });
});

export const getMessages = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { receiverId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(receiverId)) {
    throw new ApiError(400, 'Invalid receiver ID.');
  }

  const messages = await Message.find({
    $or: [
      { senderId: userId, receiverId: receiverId },
      { senderId: receiverId, receiverId: userId },
    ],
  })
    .sort({ createdAt: 1 })
    .populate('senderId', 'name email profilePic')
    .populate('receiverId', 'name email profilePic')
    .lean();

  await Message.updateMany(
    { senderId: receiverId, receiverId: userId, status: { $ne: 'seen' } },
    { $set: { status: 'seen' } }
  );

  res.status(200).json({ success: true, messages });
});

export const getUsers = asyncHandler(async (req, res, next) => {
  const currentUserId = req.user._id;
  const users = await User.find({
    _id: { $ne: currentUserId },
    isVerified: true,
  })
    .select('name email profilePic')
    .sort({ name: 1 })
    .lean();

  res.status(200).json({ success: true, users });
});
