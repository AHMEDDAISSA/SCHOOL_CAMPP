import { Response } from 'express';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import { AuthRequest } from '../middleware/authMiddleware';
import { MessageService } from '../services/messageService';


export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { receiverId, content, messageType = 'text' } = req.body;
    const senderId = req.user?._id;

    // Debug logs
    console.log('User from token:', req.user);
    console.log('Sender ID:', senderId);

    if (!senderId) {
      res.status(401).json({
        success: false,
        error: 'Utilisateur non authentifié - ID manquant'
      });
      return;
    }

    if (!receiverId || !content) {
      res.status(400).json({
        success: false,
        error: 'receiverId et content sont requis'
      });
      return;
    }

    const message = await MessageService.createMessage(
      senderId, 
      receiverId, 
      content,
      messageType
    );

    res.status(201).json({
      success: true,
      message
    });
  } catch (error: any) {
    console.error('Erreur sendMessage:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Une erreur est survenue lors de l\'envoi du message'
    });
  }
};
export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const pageNum = Number(page);
    const limitNum = Number(limit);
    
    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email')
      .sort({ timestamp: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .exec();

    res.json({
      success: true,
      messages: messages.reverse()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Une erreur est survenue lors de la récupération des messages'
    });
  }
};

export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Utiliser _id de manière cohérente
    const userId = req.user?._id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Utilisateur non authentifié'
      });
      return;
    }
    
    const conversations = await Conversation.find({
      participants: userId
    })
    .populate('participants', 'name email')
    .populate('lastMessage.senderId', 'name')
    .sort({ 'lastMessage.timestamp': -1 });

    res.json({
      success: true,
      conversations
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Une erreur est survenue lors de la récupération des conversations'
    });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    // Utiliser _id de manière cohérente
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Utilisateur non authentifié'
      });
    }

    await Message.updateMany(
      { 
        conversationId, 
        receiverId: userId, 
        isRead: false 
      },
      { isRead: true }
    );

    await Conversation.updateOne(
      { participants: userId },
      { $set: { [`unreadCount.${userId}`]: 0 } }
    );

    res.json({
      success: true,
      message: 'Messages marqués comme lus'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Une erreur est survenue lors du marquage des messages comme lus'
    });
  }
};