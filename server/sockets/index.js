import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Message from '../models/Message.js';

const userSocketMap = new Map();

export const getSocketIdByUserId = (userId) => {
  return userSocketMap.get(userId?.toString());
};

export const getOnlineUserIds = () => {
  return Array.from(userSocketMap.keys());
};

const setupSocket = (io) => {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id name email');
      if (!user || !user._id) {
        return next(new Error('User not found'));
      }
      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    if (userSocketMap.has(userId)) {
      socket.to(userSocketMap.get(userId)).emit('user_offline', { userId });
    }
    userSocketMap.set(userId, socket.id);

    socket.emit('online_list', { userIds: getOnlineUserIds().filter((id) => id !== userId) });

    socket.broadcast.emit('user_online', {
      userId,
      name: socket.user?.name,
      email: socket.user?.email,
    });

    socket.on('send_message', async (payload, callback) => {
      try {
        const { receiverId, content } = payload;
        if (!receiverId || !content || typeof content !== 'string' || content.trim().length === 0) {
          if (callback) callback({ success: false, error: 'Invalid message data' });
          return;
        }
        const trimmedContent = content.trim();
        if (trimmedContent.length > 5000) {
          if (callback) callback({ success: false, error: 'Message too long' });
          return;
        }

        const message = await Message.create({
          senderId: new mongoose.Types.ObjectId(socket.userId),
          receiverId: new mongoose.Types.ObjectId(receiverId),
          content: trimmedContent,
          status: 'sent',
        });

        const populated = await Message.findById(message._id)
          .populate('senderId', 'name email profilePic')
          .populate('receiverId', 'name email profilePic')
          .lean();

        const receiverSocketId = userSocketMap.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('new_message', {
            ...populated,
            status: 'delivered',
          });
          message.status = 'delivered';
          await message.save();
        }

        socket.emit('message_sent', { ...populated });
        if (callback) callback({ success: true, message: populated });
      } catch (err) {
        if (callback) callback({ success: false, error: err.message || 'Failed to send message' });
      }
    });

    socket.on('mark_seen', async (payload) => {
      try {
        const { messageIds, senderId } = payload;
        if (!senderId || !Array.isArray(messageIds) || messageIds.length === 0) return;
        await Message.updateMany(
          {
            _id: { $in: messageIds.map((id) => new mongoose.Types.ObjectId(id)) },
            senderId: new mongoose.Types.ObjectId(senderId),
            receiverId: new mongoose.Types.ObjectId(socket.userId),
          },
          { $set: { status: 'seen' } }
        );
        const senderSocketId = userSocketMap.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit('messages_seen', { messageIds, seenBy: socket.userId });
        }
      } catch (err) {
        console.error('mark_seen error:', err);
      }
    });

    socket.on('disconnect', () => {
      userSocketMap.delete(userId);
      socket.broadcast.emit('user_offline', { userId });
    });
  });
};

export default setupSocket;
