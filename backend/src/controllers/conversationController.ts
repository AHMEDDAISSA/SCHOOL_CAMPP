import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Conversation, { ConversationType, IConversation } from '../models/Conversation';
import { AuthRequest } from '../middleware/authMiddleware';
import Message from '../models/Message';

interface ConversationResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  count?: number;
}

// Récupérer toutes les conversations d'un utilisateur
export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id?.toString();
    
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'Utilisateur non authentifié' 
      });
      return;
    }

    const conversations = await Conversation.find({
      participants: userId
    })
    .populate('participants', 'first_name last_name email phone profileImage profileImageUrl')
    .populate('advertId', 'title category price images')
    .populate('lastMessage.senderId', 'first_name last_name')
    .sort({ 'lastMessage.timestamp': -1 })
    .lean();

    const conversationsWithUnread = conversations.map((conversation: any) => {
      const unreadCount = conversation.unreadCount?.[userId] || 0;
      return {
        ...conversation,
        unreadCount: Number(unreadCount),
        conversationType: conversation.conversationType || ConversationType.Private
      };
    });

    res.status(200).json({
      success: true,
      data: conversationsWithUnread,
      count: conversationsWithUnread.length
    } as ConversationResponse);

  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des conversations',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    } as ConversationResponse);
  }
};

// Créer une nouvelle conversation
export const createConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id?.toString();
    const { participantId, advertId, initialMessage, conversationType } = req.body;

    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'Utilisateur non authentifié' 
      });
      return;
    }

    if (!participantId || !initialMessage) {
      res.status(400).json({
        success: false,
        message: 'participantId et initialMessage sont requis'
      });
      return;
    }

    // Validation du conversationType
    const validConversationType = conversationType && Object.values(ConversationType).includes(conversationType) 
      ? conversationType 
      : ConversationType.Private;

    // Vérifier si une conversation existe déjà entre ces participants
    const existingConversation = await Conversation.findOne({
      participants: { $all: [userId, participantId] },
      conversationType: validConversationType,
      ...(advertId && { advertId })
    });

    if (existingConversation) {
      res.status(409).json({
        success: false,
        message: 'Une conversation existe déjà entre ces participants',
        data: existingConversation
      });
      return;
    }

    // Créer la nouvelle conversation
    const newConversation = new Conversation({
      participants: [userId, participantId],
      advertId: advertId || undefined,
      lastMessage: {
        content: initialMessage,
        timestamp: new Date(),
        senderId: userId
      },
      unreadCount: {
        [userId]: 0,
        [participantId]: 1
      },
      conversationType: validConversationType
    });

    const savedConversation = await newConversation.save();

    // Populer les données avant de retourner
    const populatedConversation = await Conversation.findById(savedConversation._id)
      .populate('participants', 'first_name last_name email phone profileImage profileImageUrl')
      .populate('advertId', 'title category price images')
      .populate('lastMessage.senderId', 'first_name last_name')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Conversation créée avec succès',
      data: populatedConversation
    } as ConversationResponse);

  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de la conversation',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    } as ConversationResponse);
  }
};

// Récupérer une conversation par ID
export const getConversationById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id?.toString();
    const { conversationId } = req.params;

    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'Utilisateur non authentifié' 
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      res.status(400).json({
        success: false,
        message: 'ID de conversation invalide'
      });
      return;
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    })
    .populate('participants', 'first_name last_name email phone profileImage profileImageUrl')
    .populate('advertId', 'title category price images')
    .populate('lastMessage.senderId', 'first_name last_name')
    .lean();

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
      return;
    }

    // Ajouter le conversationType s'il n'existe pas
    const conversationWithType = {
      ...conversation,
      conversationType: conversation.conversationType || ConversationType.Private
    };

    res.status(200).json({
      success: true,
      data: conversationWithType
    } as ConversationResponse);

  } catch (error) {
    console.error('Erreur lors de la récupération de la conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de la conversation',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    } as ConversationResponse);
  }
};

// Marquer une conversation comme lue
export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id?.toString();
    const { conversationId } = req.params;

    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'Utilisateur non authentifié' 
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      res.status(400).json({
        success: false,
        message: 'ID de conversation invalide'
      });
      return;
    }

    const conversation = await Conversation.findOneAndUpdate(
      { 
        _id: conversationId, 
        participants: userId 
      },
      { 
        $set: { [`unreadCount.${userId}`]: 0 } 
      },
      { new: true }
    );

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Conversation marquée comme lue'
    } as ConversationResponse);

  } catch (error) {
    console.error('Erreur lors du marquage comme lu:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du marquage comme lu',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    } as ConversationResponse);
  }
};

// Ajouter un message à une conversation
export const addMessageToConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id?.toString();
    const { conversationId } = req.params;
    const { content, receiverId } = req.body; // ✅ récupérer receiverId

    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'Utilisateur non authentifié' 
      });
      return;
    }

    if (!content || !receiverId) {
      res.status(400).json({
        success: false,
        message: 'Le contenu et le receiverId sont requis'
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      res.status(400).json({
        success: false,
        message: 'ID de conversation invalide'
      });
      return;
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
      return;
    }

    // ✅ Créer le message avec receiverId
    const newMessage = new Message({
      content,
      senderId: userId,
      receiverId, // 🔥 important pour passer la validation
      conversationId,
      timestamp: new Date(),
      isRead: false
    });

    const savedMessage = await newMessage.save();

    // 🔄 Mettre à jour la conversation
    const updateData: any = {
      lastMessage: {
        content,
        timestamp: new Date(),
        senderId: userId
      }
    };

    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== userId) {
        updateData[`unreadCount.${participantId.toString()}`] = 
          (conversation.unreadCount[participantId.toString()] || 0) + 1;
      }
    });

    const updatedConversation = await Conversation.findByIdAndUpdate(
      conversationId,
      updateData,
      { new: true }
    )
    .populate('participants', 'first_name last_name email phone profileImage profileImageUrl')
    .populate('advertId', 'title category price images')
    .populate('lastMessage.senderId', 'first_name last_name');

    res.status(200).json({
      success: true,
      message: 'Message ajouté avec succès',
      data: {
        conversation: updatedConversation,
        message: savedMessage
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout du message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'ajout du message',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const createOrGetConversation = async (
  req: AuthRequest,           // AuthRequest étend Request et porte req.user
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // on récupère l'ID de l'expéditeur depuis le token
    const senderId = req.user!._id.toString();

    // receiverId et advertId doivent venir du body
    const { receiverId, advertId } = req.body as {
      receiverId: string;
      advertId?: string;
    };

    if (!receiverId) {
      res.status(400).json({
        success: false,
        message: 'receiverId manquant'
      });
      return;
    }

    // Cherche une conversation existante sur cette annonce (facultatif)
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
      ...(advertId && { advertId })
    });

    // Si aucune, on la crée
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        advertId: advertId || undefined,
        conversationType: ConversationType.Private,
        lastMessage: {
          content: '',
          timestamp: new Date(),
          senderId
        },
        unreadCount: {
          [receiverId]: 1
        }
      });
    }

    // On repopule pour renvoyer toutes les infos
    const fullConv = await Conversation.findById(conversation._id)
      .populate('participants', 'first_name last_name email profileImageUrl')
      .populate('advertId', 'title images')
      .populate('lastMessage.senderId', 'first_name last_name')
      .lean();

    res.status(200).json({
      success: true,
      data: fullConv
    });
  } catch (err) {
    next(err);
  }
};