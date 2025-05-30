import Message from '../models/Message';
import Conversation from '../models/Conversation';
import mongoose from 'mongoose';

export class MessageService {
  static async createMessage(
    senderId: mongoose.Types.ObjectId | string,
    receiverId: mongoose.Types.ObjectId | string,
    content: string,
    messageType: string = 'text'
  ) {
    try {
      console.log('MessageService.createMessage called with:', {
        senderId: senderId,
        receiverId: receiverId,
        content: content?.substring(0, 50),
        messageType
      });

      // Conversion en ObjectId si nécessaire
      const senderObjectId = typeof senderId === 'string' 
        ? new mongoose.Types.ObjectId(senderId) 
        : senderId;
      const receiverObjectId = typeof receiverId === 'string' 
        ? new mongoose.Types.ObjectId(receiverId) 
        : receiverId;

      // Création de l'ID de conversation
      const participantIds = [senderObjectId.toString(), receiverObjectId.toString()].sort();
      const conversationId = `${participantIds[0]}_${participantIds[1]}`;

      console.log('Generated conversationId:', conversationId);

      // Création du message
      const newMessage = new Message({
        conversationId,
        senderId: senderObjectId,
        receiverId: receiverObjectId,
        content,
        messageType,
        timestamp: new Date(),
        isRead: false,
        isDelivered: true
      });

      await newMessage.save();
      console.log('Message saved successfully:', newMessage._id);

      // CORRECTION : Vérifier si la conversation existe déjà
      const existingConversation = await Conversation.findOne({
        participants: { $all: [senderObjectId, receiverObjectId] }
      });

      if (existingConversation) {
        // Mettre à jour la conversation existante
        await Conversation.updateOne(
          { _id: existingConversation._id },
          {
            $set: {
              lastMessage: {
                content,
                timestamp: new Date(),
                senderId: senderObjectId
              }
            },
            $inc: { [`unreadCount.${receiverObjectId}`]: 1 }
          }
        );
        console.log('Conversation mise à jour:', existingConversation._id);
      } else {
        // Créer une nouvelle conversation
        const newConversation = new Conversation({
          participants: [senderObjectId, receiverObjectId],
          lastMessage: {
            content,
            timestamp: new Date(),
            senderId: senderObjectId
          },
          unreadCount: {
            [senderObjectId.toString()]: 0,
            [receiverObjectId.toString()]: 1
          }
        });
        
        await newConversation.save();
        console.log('Nouvelle conversation créée:', newConversation._id);
      }

      return newMessage;
    } catch (error) {
      console.error('Erreur dans MessageService.createMessage:', error);
      throw error;
    }
  }
}