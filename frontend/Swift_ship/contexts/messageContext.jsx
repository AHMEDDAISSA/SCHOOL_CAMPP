import React, { createContext, useState, useEffect, useContext } from 'react';
import { getConversations, markConversationAsRead } from '../services/api';
import ThemeContext from '../theme/ThemeContext';
import socketService from '../services/SocketService';

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const { profileData } = useContext(ThemeContext);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    const initSocket = async () => {
      if (profileData?.email) {
        try {
          await socketService.connect();
          loadConversations();
          setupSocketListeners();
        } catch (error) {
          console.error('Erreur d\'initialisation socket:', error);
        }
      }
    };

    initSocket();
  }, [profileData]);

  const setupSocketListeners = () => {
    // Écouter les changements de connexion
    socketService.on('connect', () => {
      setSocketConnected(true);
      console.log('Socket connecté dans MessageContext');
    });

    socketService.on('disconnect', () => {
      setSocketConnected(false);
      console.log('Socket déconnecté dans MessageContext');
    });

    // Écouter les nouveaux messages pour mettre à jour la liste
    socketService.on('receive_message', (data) => {
      console.log('Nouveau message reçu dans MessageContext:', data);
      loadConversations(); // Recharger les conversations
    });

    // Écouter les messages lus
    socketService.on('messages_read', () => {
      loadConversations(); // Recharger pour mettre à jour les compteurs
    });
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await getConversations();
      
      if (response.success) {
        const conversationsWithUserId = response.data.map(conv => ({
          ...conv,
          currentUserId: profileData?._id || profileData?.id
        }));
        
        setConversations(conversationsWithUserId);
        
        // Calculer le nombre total de messages non lus
        const totalUnread = conversationsWithUserId.reduce((total, conv) => {
          return total + (conv.unreadCount || 0);
        }, 0);
        setUnreadCount(totalUnread);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await markConversationAsRead(conversationId);
      
      // Mettre à jour localement
      setConversations(prev => prev.map(conv => {
        if (conv._id === conversationId) {
          return {
            ...conv,
            unreadCount: 0
          };
        }
        return conv;
      }));
      
      // Recharger pour être sûr
      loadConversations();
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  // Nettoyer les écouteurs à la déconnexion
  useEffect(() => {
    return () => {
      socketService.off('connect');
      socketService.off('disconnect');
      socketService.off('receive_message');
      socketService.off('messages_read');
    };
  }, []);

  return (
    <MessageContext.Provider value={{
      conversations,
      loading,
      unreadCount,
      socketConnected,
      loadConversations,
      markAsRead
    }}>
      {children}
    </MessageContext.Provider>
  );
};

export default MessageContext;