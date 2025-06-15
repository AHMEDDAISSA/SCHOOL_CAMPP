import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import User from './models/User';
import Message from './models/Message';
import Conversation from './models/Conversation';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

interface JWTPayload {
  id: string;
  email?: string;
  iat?: number;
  exp?: number;
}

class SocketService {
  private io: SocketIOServer;
  private connectedUsers = new Map<string, string>();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: false
      }
    });

    this.setupAuthentication();
    this.io.on('connection', (socket: AuthenticatedSocket) => this.handleConnection(socket));
  }

  private setupAuthentication(): void {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        if (!token) return next(new Error('Authentication token required'));

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JWTPayload;
        const user = await User.findById(decoded.id);

        if (!user) return next(new Error('User not found'));

        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private handleConnection(socket: AuthenticatedSocket): void {
    console.log(`User connected: ${socket.user?.email} (ID: ${socket.userId})`);

    if (socket.userId) {
      socket.join(`user_${socket.userId}`);
      this.connectedUsers.set(socket.userId, socket.id);
      socket.broadcast.emit('user_online', {
        userId: socket.userId,
        userInfo: {
          id: socket.userId,
          name: `${socket.user?.first_name || ''} ${socket.user?.last_name || ''}`.trim()
        }
      });
    }

    socket.on('ping', () => socket.emit('pong'));

    socket.on('message_received_ack', (data) => {
      console.log(`Message ${data.messageId} reçu et accusé par le client`);
    });

    socket.on('send_message', (data) => this.handleSendMessage(socket, data));
    socket.on('mark_messages_read', (data) => this.handleMarkMessagesRead(socket, data));
    socket.on('typing_start', (data) => this.handleTyping(socket, data, true));
    socket.on('typing_stop', (data) => this.handleTyping(socket, data, false));

    socket.on('disconnect', (reason: string) => {
      console.log(`User disconnected: ${socket.user?.email} - Reason: ${reason}`);
      if (socket.userId) {
        this.connectedUsers.delete(socket.userId);
        setTimeout(() => {
          if (!this.connectedUsers.has(socket.userId!)) {
            socket.broadcast.emit('user_offline', { userId: socket.userId });
          }
        }, 5000);
      }
    });
  }

  private async handleSendMessage(socket: AuthenticatedSocket, data: any) {
    try {
      const { conversationId, receiverId, content, messageType = 'text' } = data;
      if (!socket.userId) return;

      const newMessage = new Message({
        conversationId,
        senderId: socket.userId,
        receiverId,
        content,
        messageType,
        timestamp: new Date(),
        isRead: false
      });

      const savedMessage = await newMessage.save();
      await savedMessage.populate('senderId', 'first_name last_name email');

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: {
          content,
          timestamp: new Date(),
          senderId: socket.userId
        },
        $inc: { [`unreadCount.${receiverId}`]: 1 }
      });

      this.io.to(`user_${receiverId}`).emit('receive_message', {
        messageId: savedMessage._id,
        conversationId,
        senderId: socket.userId,
        senderName: `${socket.user?.first_name || ''} ${socket.user?.last_name || ''}`.trim(),
        receiverId,
        content,
        messageType,
        timestamp: savedMessage.timestamp,
        isRead: false,
        senderInfo: savedMessage.senderId
      });

      socket.emit('message_sent', {
        success: true,
        messageId: savedMessage._id,
        timestamp: savedMessage.timestamp
      });
    } catch (error) {
      console.error('Error sending message via socket:', error);
      socket.emit('message_error', {
        success: false,
        error: 'Erreur lors de l\'envoi du message'
      });
    }
  }

  private async handleMarkMessagesRead(socket: AuthenticatedSocket, data: any) {
    try {
      const { conversationId } = data;
      if (!socket.userId) return;

      await Message.updateMany({
        conversationId,
        receiverId: socket.userId,
        isRead: false
      }, { isRead: true });

      await Conversation.updateOne(
        { _id: conversationId },
        { $set: { [`unreadCount.${socket.userId}`]: 0 } }
      );

      const conversation = await Conversation.findById(conversationId);
      if (conversation) {
        conversation.participants.forEach(participantId => {
          if (participantId.toString() !== socket.userId) {
            this.io.to(`user_${participantId}`).emit('messages_read', {
              conversationId,
              readBy: socket.userId,
              readByName: `${socket.user?.first_name || ''} ${socket.user?.last_name || ''}`.trim()
            });
          }
        });
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  private handleTyping(socket: AuthenticatedSocket, data: any, isTyping: boolean): void {
    const { conversationId, receiverId } = data;
    if (!socket.userId) return;

    const event = isTyping ? 'user_typing' : 'user_stopped_typing';
    this.io.to(`user_${receiverId}`).emit(event, {
      conversationId,
      userId: socket.userId,
      userName: `${socket.user?.first_name || ''} ${socket.user?.last_name || ''}`.trim()
    });
  }

  public emitToUser(userId: string, event: string, data: any): void {
    this.io.to(`user_${userId}`).emit(event, data);
  }

  public getIO(): SocketIOServer {
    return this.io;
  }

  public async isUserOnline(userId: string): Promise<boolean> {
    const sockets = await this.io.in(`user_${userId}`).fetchSockets();
    return sockets.length > 0;
  }
}

export default SocketService;
