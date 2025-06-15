import express from 'express';
import {
  getConversations,
  getConversationById,
  createConversation,
  markAsRead,
  addMessageToConversation,
  createOrGetConversation
} from '../controllers/conversationController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticateToken);

// **** Nouvel endpoint ****
router.post('/find-or-create', createOrGetConversation);

router.get('/', getConversations);
router.post('/', createConversation);
router.get('/:conversationId', getConversationById);
router.patch('/:conversationId/read', markAsRead);
router.post('/:conversationId/messages', addMessageToConversation);

export default router;