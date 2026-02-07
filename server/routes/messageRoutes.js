import express from 'express';
import {
  getChats,
  getMessages,
  getUsers,
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';
import { validateSendMessage } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router.get('/chats', getChats);
router.get('/users', getUsers);
router.get('/:receiverId', getMessages);

export default router;
