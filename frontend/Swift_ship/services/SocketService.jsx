import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logError, logInfo } from '../services/logger'; // Assure-toi que ce fichier existe

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
  }

  async connect() {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userInfo');

      if (!token || !userData) {
        logError('❌ Token ou données utilisateur manquants');
        throw new Error('Token ou données utilisateur manquants');
      }

      const user = JSON.parse(userData);

      logInfo('🔑 Connexion avec token:', token.substring(0, 20) + '...');
      logInfo('👤 Données utilisateur:', { id: user._id, email: user.email });

      this.socket = io('http://192.168.1.21:3001', {
        auth: {
          token: token,
          userId: user._id,
          userEmail: user.email
        },
        transports: ['websocket'],
        upgrade: false,
        timeout: 10000,
        forceNew: true
      });

      return new Promise((resolve, reject) => {
        this.socket.on('connect', () => {
          logInfo('✅ Socket connecté:', this.socket.id);
          this.connected = true;
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          logError('❌ Erreur de connexion Socket.IO:', error.message);
          this.connected = false;
          reject(error);
        });
      });
    } catch (error) {
      logError('Erreur lors de la connexion Socket.IO:', error);
      throw error;
    }
  }

  joinConversation(conversationId) {
    if (this.socket && this.connected) {
      this.socket.emit('join_conversation', { conversationId });
      logInfo('🚪 Rejoint la conversation:', conversationId);
    }
  }

  leaveConversation(conversationId) {
    if (this.socket && this.connected) {
      this.socket.emit('leave_conversation', { conversationId });
      logInfo('🚪 Quitté la conversation:', conversationId);
    }
  }

  async sendMessage(receiverId, content, messageType = 'text') {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.connected) {
        reject(new Error('Socket non connecté'));
        return;
      }

      const tempId = `temp_${Date.now()}_${Math.random()}`;

      this.socket.emit('send_message', {
        receiverId,
        content,
        messageType,
        tempId
      });

      const confirmationHandler = (data) => {
        if (data.tempId === tempId) {
          this.socket.off('message_sent', confirmationHandler);
          this.socket.off('message_error', errorHandler);
          resolve(data);
        }
      };

      const errorHandler = (error) => {
        if (error.tempId === tempId) {
          this.socket.off('message_sent', confirmationHandler);
          this.socket.off('message_error', errorHandler);
          reject(error);
        }
      };

      this.socket.on('message_sent', confirmationHandler);
      this.socket.on('message_error', errorHandler);
    });
  }

  startTyping(conversationId, receiverId) {
    if (this.socket && this.connected) {
      this.socket.emit('typing_start', { conversationId, receiverId });
    }
  }

  stopTyping(conversationId, receiverId) {
    if (this.socket && this.connected) {
      this.socket.emit('typing_stop', { conversationId, receiverId });
    }
  }

  markMessagesAsRead(conversationId) {
    if (this.socket && this.connected) {
      this.socket.emit('mark_messages_read', { conversationId });
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
        if (this.listeners.has(event)) {
          const callbacks = this.listeners.get(event);
          const index = callbacks.indexOf(callback);
          if (index > -1) {
            callbacks.splice(index, 1);
          }
        }
      } else {
        this.socket.off(event);
        this.listeners.delete(event);
      }
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.listeners.clear();
    }
  }

  isConnected() {
    return this.connected && this.socket && this.socket.connected;
  }
}

export default new SocketService();