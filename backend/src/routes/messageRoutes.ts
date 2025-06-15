import express from 'express';
import { 
  sendMessage, 
  getMessages, 
  getConversations, 
  markAsRead,
  getConversationMessages ,
  getConversationMessagesForTable
} from '../controllers/messageController';
import { 
  createConversation,
  getConversationById,
  addMessageToConversation,
  markAsRead as markConversationAsRead,
  
} from '../controllers/conversationController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Routes des messages
router.post('/send', authenticateToken, sendMessage);
router.get('/conversations', authenticateToken, getConversations);
router.get('/conversation/:conversationId', authenticateToken, getConversationMessages);
router.post('/conversation/:conversationId/add', authenticateToken, addMessageToConversation); // ← ROUTE MANQUANTE
router.patch('/conversation/:conversationId/read', authenticateToken, markConversationAsRead);
router.put('/:conversationId/read', authenticateToken, markAsRead);

// Routes des conversations
router.post('/conversations', authenticateToken, createConversation);
router.get('/conversations/:conversationId', authenticateToken, getConversationById);
router.get('/conversation/:conversationId/table', authenticateToken, getConversationMessagesForTable);

export default router;