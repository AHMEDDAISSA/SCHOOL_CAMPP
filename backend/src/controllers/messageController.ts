import { Response } from 'express';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import { AuthRequest } from '../middleware/authMiddleware';
import { MessageService } from '../services/messageService';
import { socketService } from '../server'; // Importer l'instance socket

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { receiverId, content, messageType = 'text' } = req.body;
    const senderId = req.user?._id;

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

    // Créer le message en base de données
    const message = await MessageService.createMessage(
      senderId, 
      receiverId, 
      content,
      messageType
    );

    // Émettre le message via Socket.IO au destinataire
    socketService.emitToUser(receiverId, 'new_message', {
      messageId: message._id,
      senderId: senderId,
      senderName: req.user?.first_name + ' ' + req.user?.last_name,
      receiverId: receiverId,
      content: content,
      messageType: messageType,
      timestamp: message.timestamp,
      conversationId: message.conversationId,
      isRead: false
    });

    // Émettre également à l'expéditeur pour confirmation
    socketService.emitToUser(senderId.toString(), 'message_delivered', {
      messageId: message._id,
      status: 'delivered'
    });

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

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Utilisateur non authentifié'
      });
      return;
    }

    // Mettre à jour les messages en base
    const updatedMessages = await Message.updateMany(
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

    // Notifier via Socket.IO que les messages ont été lus
    // Trouver les expéditeurs des messages pour les notifier
    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
      const otherParticipants = conversation.participants.filter(
        (participantId: any) => participantId.toString() !== userId.toString()
      );
      
      otherParticipants.forEach((participantId: any) => {
        socketService.emitToUser(participantId.toString(), 'messages_read', {
          conversationId,
          readBy: userId,
          readByName: req.user?.first_name + ' ' + req.user?.last_name
        });
      });
    }

    res.json({
      success: true,
      message: 'Messages marqués comme lus',
      updatedCount: updatedMessages.modifiedCount
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Une erreur est survenue lors du marquage des messages comme lus'
    });
  }
};

// ... autres fonctions inchangées
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

export const getConversationMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Utilisateur non authentifié'
      });
      return;
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      res.status(404).json({
        success: false,
        error: 'Conversation non trouvée'
      });
      return;
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    
    const messages = await Message.find({ conversationId })
      .populate('senderId', 'first_name last_name email')
      .populate('receiverId', 'first_name last_name email')
      .sort({ timestamp: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .exec();

    res.json({
      success: true,
      messages: messages.reverse(),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: await Message.countDocuments({ conversationId })
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Une erreur est survenue lors de la récupération des messages'
    });
  }
};
export const getConversationMessagesForTable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Utilisateur non authentifié'
      });
      return;
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      res.status(404).json({
        success: false,
        error: 'Conversation non trouvée'
      });
      return;
    }

    // Récupérer tous les messages triés par timestamp croissant (du plus ancien au plus récent)
    const messages = await Message.find({ conversationId })
      .populate('senderId', 'first_name last_name email') // Correction : peupler les champs nécessaires
      .sort({ timestamp: 1 }) // Tri croissant par timestamp
      .exec();

    // Formater les messages pour l'affichage en tableau
    const formattedMessages = messages.map(message => {
      // Correction : vérifier si senderId est peuplé
      const sender = message.senderId as any; // Type assertion nécessaire
      
      return {
        id: message._id,
        content: message.content,
        senderId: sender._id || sender, // Gérer le cas où ce serait juste un ObjectId
        senderName: sender.first_name && sender.last_name 
          ? `${sender.first_name} ${sender.last_name}` 
          : sender.email || 'Utilisateur inconnu', // Fallback au cas où les noms ne sont pas disponibles
        senderEmail: sender.email || '',
        timestamp: message.timestamp,
        isRead: message.isRead,
        // Formatage de la date pour affichage
        formattedDate: new Date(message.timestamp).toLocaleString('fr-FR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
    });

    res.json({
      success: true,
      messages: formattedMessages,
      totalCount: formattedMessages.length
    });
    
  } catch (error: any) {
    console.error('Erreur getConversationMessagesForTable:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Une erreur est survenue lors de la récupération des messages'
    });
  }
};