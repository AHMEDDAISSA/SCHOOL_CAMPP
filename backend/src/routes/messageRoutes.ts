import express from 'express';
import {
  sendMessage,
  getMessages,
  getConversations,
  markAsRead
} from '../controllers/messageController';
// Importation correcte du middleware d'authentification
import { authenticateToken } from '../middleware/authMiddleware';

// Création du routeur
const router = express.Router();

// Application du middleware d'authentification à toutes les routes
router.use(authenticateToken);

// Route pour envoyer un message
// POST /api/messages/send
router.post('/send', sendMessage);

// Route pour récupérer les messages d'une conversation
// GET /api/messages/conversation/:conversationId
router.get('/conversation/:conversationId', getMessages);

// Route pour récupérer toutes les conversations de l'utilisateur
// GET /api/messages/conversations
router.get('/conversations', getConversations);

// Route pour marquer les messages comme lus
// PATCH /api/messages/conversation/:conversationId/read
router.patch('/conversation/:conversationId/read', markAsRead);

export default router;