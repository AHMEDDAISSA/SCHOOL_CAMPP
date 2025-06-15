import React, { useContext, useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import ThemeContext from '../../theme/ThemeContext';
import MessageContext from '../../contexts/messageContext';
import socketService from '../../services/SocketService';
import MessagesTable from '../../components/MessagesTable';

import { 
  getConversationMessages,
  addMessageToConversation,
  markConversationAsRead,
  getConversationById  
} from '../../services/api';

const ChatScreen = () => {
  const { theme, darkMode, profileData } = useContext(ThemeContext);
  const { loadConversations } = useContext(MessageContext);
  const params = useLocalSearchParams();
  const scrollViewRef = useRef();
  
  // États
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [participant, setParticipant] = useState(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [showMessagesTable, setShowMessagesTable] = useState(false);
  
  
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialisation et gestion de Socket.IO
  useEffect(() => {
    const initSocket = async () => {
      try {
        await socketService.connect();
        setupSocketListeners();
        
        // Rejoindre la conversation
        if (params.conversationId) {
          socketService.joinConversation(params.conversationId);
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du socket:', error);
      }
    };

    initSocket();

    return () => {
      // Quitter la conversation et nettoyer
      if (params.conversationId) {
        socketService.leaveConversation(params.conversationId);
      }
      cleanupSocketListeners();
      clearTypingTimeout();
    };
  }, [params.conversationId]);

  const setupSocketListeners = () => {
  // Nettoyage préventif
  cleanupSocketListeners();
  
  socketService.on('receive_message', (data) => {
    console.log('📨 Message reçu via Socket.IO:', data);
      
    if (data.conversationId === params.conversationId) {
      const newMessage = {
        id: data.messageId,
        text: data.content,
        sender: data.senderId === profileData._id ? "me" : "other",
        time: formatTime(data.timestamp),
        timestamp: data.timestamp,
        senderInfo: data.senderInfo || { 
          first_name: data.senderName?.split(' ')[0] || '',
          last_name: data.senderName?.split(' ')[1] || ''
        },
        isRead: false
      };
      
      // Éviter les doublons
      setMessages(prev => {
        const exists = prev.find(msg => msg.id === newMessage.id);
        if (exists) return prev;
        
        const updated = [...prev, newMessage].sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
        
        setTimeout(() => scrollToBottom(), 100);
        return updated;
      });
    }
  });
        
       

    // Gestion des confirmations d'envoi
    socketService.on('message_sent', (data) => {
      console.log('✅ Message confirmé:', data);
      
      setMessages(prev => prev.map(msg => {
        if (msg.isTemporary && msg.tempId === data.tempId) {
          return {
            ...msg,
            id: data.messageId,
            isTemporary: false,
            timestamp: data.timestamp,
            time: formatTime(data.timestamp)
          };
        }
        return msg;
      }));
    });

    // Gestion des erreurs d'envoi
    socketService.on('message_error', (error) => {
      console.error('❌ Erreur d\'envoi:', error);
      
      // Supprimer les messages temporaires en erreur
      setMessages(prev => prev.filter(msg => 
        !(msg.isTemporary && msg.tempId === error.tempId)
      ));
      
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
      setIsSending(false);
    });

    // Gestion des messages lus
    socketService.on('messages_read', (data) => {
      if (data.conversationId === params.conversationId) {
        setMessages(prev => prev.map(msg => ({
          ...msg,
          isRead: true
        })));
      }
    });

    // Gestion de la frappe
    socketService.on('user_typing', (data) => {
      if (data.conversationId === params.conversationId && 
          data.userId !== profileData._id) {
        setTypingUsers(prev => {
          const exists = prev.find(user => user.userId === data.userId);
          if (!exists) {
            return [...prev, { userId: data.userId, userName: data.userName }];
          }
          return prev;
        });
      }
    });

    socketService.on('user_stopped_typing', (data) => {
      if (data.conversationId === params.conversationId) {
        setTypingUsers(prev => prev.filter(user => user.userId !== data.userId));
      }
    });
  };

  const cleanupSocketListeners = () => {
    socketService.off('connect');
    socketService.off('disconnect');
    socketService.off('connect_error');
    socketService.off('receive_message');
    socketService.off('message_sent');
    socketService.off('message_error');
    socketService.off('messages_read');
    socketService.off('user_typing');
    socketService.off('user_stopped_typing');
  };

  // Charger les données de conversation
  useEffect(() => {
    if (params.conversationId) {
      loadChatData();
      markAsRead();
    }
  }, [params.conversationId]);

 const loadChatData = async (page = 1, append = false) => {
  try {
    setIsLoading(!append);

    // Requêtes parallèles pour gagner du temps
    const [messagesResponse, conversationResponse] = await Promise.all([
      getConversationMessages(params.conversationId, page, 50),
      getConversationById(params.conversationId)
    ]);

    // 🟡 Gérer le format retourné de la conversation
    const conversation =
      conversationResponse?.data?.conversation ||
      conversationResponse?.data ||
      conversationResponse;

    // ✅ Vérifier et extraire l'autre participant
    if (
      conversation &&
      Array.isArray(conversation.participants) &&
      conversation.participants.length >= 2
    ) {
      const other = conversation.participants.find(
        (p) => p._id !== profileData._id
      );
      if (other && other._id) {
        setParticipant(other);
        console.log("🧑‍🤝‍🧑 Participant défini:", other._id, other.email || '');
      } else {
        console.warn("⚠️ Aucun autre participant valide trouvé.");
      }
    } else {
      console.warn("⚠️ Conversation sans participants valides.");
    }

    // ✅ Traiter les messages s'ils existent
    if (messagesResponse?.success && messagesResponse.messages) {
      const formattedMessages = messagesResponse.messages.map((msg) => ({
        id: msg._id,
        text: msg.content,
        sender: msg.senderId._id === profileData._id ? "me" : "other",
        time: formatTime(msg.timestamp),
        timestamp: msg.timestamp,
        senderInfo: msg.senderId,
        isRead: msg.isRead,
      }));

      const sortedMessages = formattedMessages.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      setMessages((prev) => (append ? [...sortedMessages, ...prev] : sortedMessages));
      setHasMoreMessages(messagesResponse.messages.length === 50);
      setCurrentPage(page);
    } else {
      console.warn("❗ Aucun message retourné.");
    }

  } catch (error) {
    console.error("❌ Erreur lors du chargement des messages:", error);
    setMessages([]);
  } finally {
    setIsLoading(false);
  }
};



  // Envoyer un message
// Fonction corrigée de `sendMessage` pour React Native

const sendMessage = async () => {
  if (!newMessage.trim() || isSending) return;

  if (!participant) {
    console.warn("Aucun participant trouvé. Impossible d'envoyer.");
    Alert.alert("Erreur", "Aucun destinataire défini.");
    return;
  }

  setIsSending(true);
  const content = newMessage.trim();
  const tempId = `temp_${Date.now()}_${Math.random()}`;

  // UI optimiste
  setNewMessage("");
  const tempMsg = {
    id: tempId,
    tempId,
    text: content,
    sender: "me",
    time: formatTime(new Date()),
    timestamp: new Date(),
    isTemporary: true,
    isRead: false
  };
  setMessages(prev => [...prev, tempMsg]);
  scrollToBottom();

  try {
    let response;

    if (socketConnected) {
      await socketService.sendMessage(participant._id, content, 'text');
      return; // socket gère l'affichage
    } else {
      response = await addMessageToConversation(params.conversationId, {
        content,
        receiverId: participant._id
      });
    }

    if (response?.message && response?.conversation) {
      const m = response.message;

setMessages(prev => prev.map(msg =>
  msg.tempId === tempId
    ? {
        ...msg,
        id: m._id,
        isTemporary: false,
        timestamp: m.timestamp,
        time: formatTime(m.timestamp)
      }
    : msg
));
    } else {
      console.error('Réponse inattendue (format mal formé)', response);
      throw new Error('Réponse inattendue');
    }
  } catch (err) {
    console.error("Erreur lors de l'envoi du message:", err);
    setMessages(prev => prev.filter(msg => msg.tempId !== tempId));
    setNewMessage(content);
    Alert.alert('Erreur', "Impossible d'envoyer le message. Veuillez réessayer.");
  } finally {
    setIsSending(false);
  }
};






  // Gestion de la frappe
  const handleTextChange = (text) => {
    setNewMessage(text);
    
    if (participant && socketConnected) {
      // Démarrer l'indication de frappe
      if (!isTyping && text.length > 0) {
        setIsTyping(true);
        socketService.startTyping(params.conversationId, participant._id);
      }
      
      // Arrêter l'indication de frappe si le texte est vide
      if (text.length === 0 && isTyping) {
        setIsTyping(false);
        socketService.stopTyping(params.conversationId, participant._id);
        clearTypingTimeout();
        return;
      }
      
      // Réinitialiser le timeout
      clearTypingTimeout();
      
      // Arrêter automatiquement après 2 secondes d'inactivité
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socketService.stopTyping(params.conversationId, participant._id);
      }, 2000);
    }
  };

  const clearTypingTimeout = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  // Marquer comme lu
  const markAsRead = async () => {
    try {
      await markConversationAsRead(params.conversationId);
      if (socketConnected) {
        socketService.markMessagesAsRead(params.conversationId);
      }
      loadConversations();
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  // Scroll vers le bas
  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  // Charger plus de messages (pagination)
  const loadMoreMessages = async () => {
    if (hasMoreMessages && !isLoading) {
      await loadChatData(currentPage + 1, true);
    }
  };

  // Utilitaires de formatage
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hier";
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long' 
      });
    }
  };

  // Regrouper les messages par date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    
    messages.forEach(message => {
      const date = new Date(message.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return Object.keys(groups).map(date => ({
      date: formatDate(date),
      messages: groups[date]
    }));
  };

  // Composant MessageBubble
  const MessageBubble = ({ message }) => {
    const isMe = message.sender === "me";
    
    return (
      <View style={[
        styles.messageWrapper,
        isMe ? styles.myMessageWrapper : styles.otherMessageWrapper
      ]}>
        <View style={[
          styles.messageBubble,
          isMe 
            ? [styles.myMessageBubble, { backgroundColor: '#836EFE' }] 
            : [styles.otherMessageBubble, { backgroundColor: theme.cardbg }]
        ]}>
          <Text style={[
            styles.messageText,
            { color: isMe ? 'white' : theme.color }
          ]}>
            {message.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={[
              styles.messageTime,
              { color: isMe ? 'rgba(255,255,255,0.7)' : theme.secondaryColor }
            ]}>
              {message.time}
            </Text>
            {isMe && (
              <Ionicons 
                name={
                  message.isTemporary 
                    ? "time-outline" 
                    : message.isRead 
                      ? "checkmark-done" 
                      : "checkmark"
                } 
                size={14} 
                color={
                  message.isTemporary 
                    ? "rgba(255,255,255,0.5)" 
                    : message.isRead 
                      ? "#4CAF50" 
                      : "rgba(255,255,255,0.7)"
                } 
                style={{ marginLeft: 5 }}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  // Obtenir le nom du participant
  const getParticipantName = () => {
    if (params.participantName) return params.participantName;
    if (participant) {
      return `${participant.first_name || ''} ${participant.last_name || ''}`.trim();
    }
    return "Contact";
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={darkMode ? "light-content" : 'dark-content'}
      />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: darkMode ? '#333333' : '#EEEEEE' }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.push('/inbox')}
        >
          {darkMode ? <Dark_back /> : <Back />}
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={[styles.name, { color: theme.color }]}>
            {getParticipantName()}
          </Text>
          {params.advertTitle && (
            <Text style={[styles.advertTitle, { color: theme.secondaryColor }]}>
              📦 {params.advertTitle}
            </Text>
          )}
        </View>
        
        <TouchableOpacity 
  style={styles.menuButton}
  onPress={() => {
    Alert.alert(
      "Options",
      "Choisissez une action",
      [
        {
          text: "Voir en tableau", // NOUVELLE OPTION
          onPress: () => setShowMessagesTable(true)
        },
        {
          text: "Actualiser",
          onPress: () => loadChatData(1, false)
        },
        {
          text: "Charger plus",
          onPress: loadMoreMessages,
          style: hasMoreMessages ? "default" : "cancel"
        },
        {
          text: "Marquer comme lu",
          onPress: markAsRead
        },
        {
          text: "Annuler",
          style: "cancel"
        }
      ]
    );
  }}
>
  <Ionicons 
    name="ellipsis-vertical" 
    size={20} 
    color={darkMode ? "#FFFFFF" : "#333333"} 
  />
</TouchableOpacity>
      </View>
      
      {/* Messages */}
      {isLoading && messages.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#836EFE" />
          <Text style={[styles.loadingText, { color: theme.secondaryColor }]}>
            Chargement des messages...
          </Text>
        </View>
      ) : (
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={scrollToBottom}
          onScroll={({ nativeEvent }) => {
            // Charger plus de messages quand on atteint le haut
            if (nativeEvent.contentOffset.y === 0 && hasMoreMessages && !isLoading) {
              loadMoreMessages();
            }
          }}
          scrollEventThrottle={400}
        >
          {hasMoreMessages && (
            <TouchableOpacity 
              style={styles.loadMoreButton}
              onPress={loadMoreMessages}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size={20} color="#836EFE" />
              ) : (
                <Text style={styles.loadMoreText}>Charger plus de messages</Text>
              )}
            </TouchableOpacity>
          )}
          
          {groupedMessages.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons 
                name="chatbubble-outline" 
                size={50} 
                color={theme.secondaryColor} 
              />
              <Text style={[styles.emptyStateText, { color: theme.secondaryColor }]}>
                Aucun message dans cette conversation
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: theme.secondaryColor }]}>
                Commencez la conversation en envoyant un message
              </Text>
            </View>
          ) : (
            groupedMessages.map((group, groupIndex) => (
              <View key={groupIndex} style={styles.dateSection}>
                <View style={styles.dateHeader}>
                  <Text style={styles.dateHeaderText}>{group.date}</Text>
                </View>
                
                {group.messages.map(message => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </View>
            ))
          )}
          
          {/* Indicateur de frappe */}
          {typingUsers.length > 0 && (
            <View style={styles.typingIndicator}>
              <View style={styles.typingBubble}>
                <View style={styles.typingDots}>
                  <View style={[styles.typingDot, styles.typingDot1]} />
                  <View style={[styles.typingDot, styles.typingDot2]} />
                  <View style={[styles.typingDot, styles.typingDot3]} />
                </View>
              </View>
              <Text style={[styles.typingText, { color: theme.secondaryColor }]}>
                {typingUsers.map(user => user.userName).join(', ')} {typingUsers.length === 1 ? 'tape' : 'tapent'}...
              </Text>
            </View>
          )}
          
          <View ref={messagesEndRef} style={{ height: 20 }} />
        </ScrollView>
      )}
      
      {/* Actions rapides */}
      <View style={[styles.quickActions, { backgroundColor: theme.cardbg }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setNewMessage("Est-ce toujours disponible ?")}
          >
            <Ionicons name="help-outline" size={18} color="#836EFE" />
            <Text style={styles.quickActionText}>Disponible ?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setNewMessage("Je suis intéressé(e) !")}
          >
            <Ionicons name="thumbs-up-outline" size={18} color="#836EFE" />
            <Text style={styles.quickActionText}>Intéressé</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setNewMessage("Pouvons-nous fixer un rendez-vous ?")}
          >
            <Ionicons name="calendar-outline" size={18} color="#836EFE" />
            <Text style={styles.quickActionText}>RDV</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setNewMessage("Merci beaucoup !")}
          >
            <Ionicons name="heart-outline" size={18} color="#836EFE" />
            <Text style={styles.quickActionText}>Merci</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {/* Input de message */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={[styles.inputWrapper, { backgroundColor: theme.cardbg }]}>
          <TouchableOpacity style={styles.attachmentButton}>
            <Ionicons name="add-circle-outline" size={24} color="#836EFE" />
          </TouchableOpacity>
          
          <TextInput
            style={[styles.input, { color: theme.color }]}
            placeholder="Tapez votre message..."
            placeholderTextColor={theme.placeholderColor}
            value={newMessage}
            onChangeText={handleTextChange}
            multiline
            maxLength={500}
            onSubmitEditing={() => {
              if (Platform.OS === 'android') {
                sendMessage();
              }
            }}
            blurOnSubmit={false}
          />
          
          <TouchableOpacity 
            style={[
              styles.sendButton,
              { 
                backgroundColor: newMessage.trim() && !isSending ? '#836EFE' : '#836EFE80'
              }
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size={20} color="#FFFFFF" />
            ) : (
              <Ionicons 
                name="send" 
                size={20} 
                color={newMessage.trim() ? '#FFFFFF' : '#FFFFFF80'} 
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      {showMessagesTable && (
  <View style={StyleSheet.absoluteFillObject}>
    <MessagesTable 
      conversationId={params.conversationId}
      onClose={() => setShowMessagesTable(false)}
    />
  </View>)}
    </View>
  );
};

// Styles complets
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  advertTitle: {
    fontSize: 14,
    marginTop: 2,
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connectionText: {
    fontSize: 12,
  },
  menuButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loadMoreButton: {
    alignItems: 'center',
    padding: 16,
  },
  loadMoreText: {
    color: '#836EFE',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  dateSection: {
    marginVertical: 8,
  },
  dateHeader: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateHeaderText: {
    backgroundColor: 'rgba(131, 110, 254, 0.1)',
    color: '#836EFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '500',
  },
  messageWrapper: {
    marginVertical: 4,
  },
  myMessageWrapper: {
    alignItems: 'flex-end',
  },
  otherMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  myMessageBubble: {
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    justifyContent: 'flex-end',
  },
  messageTime: {
    fontSize: 12,
  },
  typingIndicator: {
    alignItems: 'flex-start',
    marginVertical: 8,
  },
  typingBubble: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
    marginHorizontal: 2,
  },
  typingDot1: {
    animation: 'pulse 1.4s ease-in-out infinite',
  },
  typingDot2: {
    animation: 'pulse 1.4s ease-in-out 0.2s infinite',
  },
  typingDot3: {
    animation: 'pulse 1.4s ease-in-out 0.4s infinite',
  },
  typingText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
  quickActions: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(131, 110, 254, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  quickActionText: {
    color: '#836EFE',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  inputContainer: {
    backgroundColor: 'transparent',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  attachmentButton: {
    marginRight: 12,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(131, 110, 254, 0.05)',
    borderRadius: 20,
    marginRight: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;