import { useEffect, useState, useCallback } from 'react';
import socketService from '../services/socketService';

export const useSocket = (token) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState({});

  useEffect(() => {
    if (token) {
      // Connecter au socket
      socketService.connect(token);

      // Écouter les changements de connexion
      const handleConnect = () => setIsConnected(true);
      const handleDisconnect = () => setIsConnected(false);

      // Écouter les nouveaux messages
      const handleReceiveMessage = (messageData) => {
        console.log('🔔 Nouveau message reçu:', messageData);
        setMessages(prev => [...prev, messageData]);
      };

      // Écouter les messages envoyés
      const handleMessageSent = (data) => {
        console.log('✅ Message confirmé:', data);
        // Optionnel : ajouter le message à la liste locale
        setMessages(prev => [...prev, data.data]);
      };

      // Écouter les nouveaux messages (depuis la DB)
      const handleNewMessage = (messageData) => {
        console.log('📨 Nouveau message depuis DB:', messageData);
        setMessages(prev => [...prev, messageData]);
      };

      // Écouter les indications de frappe
      const handleUserTyping = (data) => {
        console.log('⌨️ Utilisateur en train de taper:', data);
        setTyping(prev => ({
          ...prev,
          [data.conversationId]: {
            userId: data.userId,
            userName: data.userName
          }
        }));
      };

      const handleUserStoppedTyping = (data) => {
        console.log('⌨️ Utilisateur a arrêté de taper:', data);
        setTyping(prev => {
          const updated = { ...prev };
          delete updated[data.conversationId];
          return updated;
        });
      };

      // Enregistrer les écouteurs
      socketService.on('connect', handleConnect);
      socketService.on('disconnect', handleDisconnect);
      socketService.on('receive_message', handleReceiveMessage);
      socketService.on('message_sent', handleMessageSent);
      socketService.on('new_message', handleNewMessage);
      socketService.on('user_typing', handleUserTyping);
      socketService.on('user_stopped_typing', handleUserStoppedTyping);

      // Nettoyage
      return () => {
        socketService.off('connect', handleConnect);
        socketService.off('disconnect', handleDisconnect);
        socketService.off('receive_message', handleReceiveMessage);
        socketService.off('message_sent', handleMessageSent);
        socketService.off('new_message', handleNewMessage);
        socketService.off('user_typing', handleUserTyping);
        socketService.off('user_stopped_typing', handleUserStoppedTyping);
        socketService.disconnect();
      };
    }
  }, [token]);

  // Fonction pour envoyer un message
  const sendMessage = useCallback((receiverId, content, messageType = 'text', conversationId = null) => {
    return socketService.sendMessage(receiverId, content, messageType, conversationId);
  }, []);

  // Fonction pour marquer comme lu
  const markAsRead = useCallback((conversationId, senderId) => {
    return socketService.markAsRead(conversationId, senderId);
  }, []);

  // Fonctions de frappe
  const startTyping = useCallback((receiverId, conversationId) => {
    return socketService.startTyping(receiverId, conversationId);
  }, []);

  const stopTyping = useCallback((receiverId, conversationId) => {
    return socketService.stopTyping(receiverId, conversationId);
  }, []);

  return {
    isConnected,
    messages,
    typing,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    socketService
  };
};