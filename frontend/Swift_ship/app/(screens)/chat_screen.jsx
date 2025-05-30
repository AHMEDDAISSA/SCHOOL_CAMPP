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
  Image,
  Alert,
  Animated,
  ActivityIndicator
} from 'react-native';
import React, { useContext, useState, useEffect, useRef } from 'react';
import { useLocalSearchParams } from 'expo-router';
import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import { Montserrat_700Bold, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import { router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import ThemeContext from '../../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Composant de message individuel
const MessageBubble = ({ message, theme }) => {
  const isMe = message.sender === "me";
  
  return (
    <View style={[
      styles.messageWrapper,
      isMe ? styles.myMessageWrapper : styles.otherMessageWrapper
    ]}>
      <View style={[
        styles.messageBubble,
        isMe 
          ? [styles.myMessageBubble, {backgroundColor: '#836EFE'}] 
          : [styles.otherMessageBubble, {backgroundColor: theme.cardbg}]
      ]}>
        <Text style={[
          styles.messageText,
          {color: isMe ? 'white' : theme.color}
        ]}>
          {message.text}
        </Text>
        <Text style={[
          styles.messageTime,
          {color: isMe ? 'rgba(255,255,255,0.7)' : theme.secondaryColor}
        ]}>
          {message.time}
        </Text>
      </View>
    </View>
  );
};

// Fonction pour récupérer les données de l'annonce
const getAdvertData = (advertId) => {
  // En production, récupérez ces données de votre API
  return {
    id: advertId,
    title: "Gants de ski pour enfant",
    type: "Donner",
    status: "Disponible",
    image: require('../../assets/images/placeholder.png')
  };
};

const Chat_screen = () => {
  const { theme, darkMode } = useContext(ThemeContext);
  const params = useLocalSearchParams();
  const scrollViewRef = useRef();
  const animatedHeight = useRef(new Animated.Value(60)).current;
  
  // États
  const [advertData, setAdvertData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showAdvertDetails, setShowAdvertDetails] = useState(true);
  const [contactMethodsVisible, setContactMethodsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [typingStatus, setTypingStatus] = useState(false);
  const [typingTimeout, setTypingTimeoutRef] = useState(null);
  
  // Récupérer les données au chargement
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Récupérer les données de l'annonce
        if (params.advertId) {
          // Vérifier si c'est une annonce statique
          if (params.advertId.startsWith('static_advert_')) {
            // Définir des données statiques pour les annonces de démonstration
            let staticAdvertData;
            
            if (params.advertId === 'static_advert_1') {
              staticAdvertData = {
                id: 'static_advert_1',
                title: "Veste de ski pour enfant",
                type: "Prêter",
                status: "Disponible",
                item_image: require('../../assets/images/veste_enfant.jpeg'),
              };
            } else if (params.advertId === 'static_advert_2') {
              staticAdvertData = {
                id: 'static_advert_2',
                title: "Chaussures de randonnée taille 38",
                type: "Donner",
                status: "Disponible",
                image: { uri: 'https://images.unsplash.com/photo-1520219306100-ec4afeeefe58' }
              };
            }
            
            setAdvertData(staticAdvertData);
          } else {
            // Pour les annonces normales
            const data = getAdvertData(params.advertId);
            setAdvertData(data);
          }
        }
        
        // Récupérer les messages
        if (params.id) {
          // Vérifier si c'est un message statique
          if (params.id.startsWith('static_msg_')) {
            let staticChatMessages;
            
            if (params.id === 'static_msg_1') {
              staticChatMessages = [
                {
                  id: 1,
                  text: "Bonjour, je suis intéressée par votre veste de ski. Est-elle toujours disponible pour le camp de février?",
                  sender: "other",
                  time: "14:30",
                  date: "Aujourd'hui"
                },
                {
                  id: 2,
                  text: "Bonjour Marie, oui la veste est toujours disponible. Elle est en très bon état.",
                  sender: "me",
                  time: "14:45",
                  date: "Aujourd'hui"
                },
                {
                  id: 3,
                  text: "Super ! Est-ce qu'elle convient pour un enfant de 8 ans?",
                  sender: "other",
                  time: "14:50",
                  date: "Aujourd'hui"
                },
                {
                  id: 4,
                  text: "Oui tout à fait, elle est taille 8 ans. Elle a été portée seulement pour un camp l'année dernière.",
                  sender: "me",
                  time: "14:55",
                  date: "Aujourd'hui"
                }
              ];
            } else if (params.id === 'static_msg_2') {
              staticChatMessages = [
                {
                  id: 1,
                  text: "Bonjour, je suis intéressé par vos chaussures de randonnée. Sont-elles encore disponibles?",
                  sender: "other",
                  time: "10:15",
                  date: "Hier"
                },
                {
                  id: 2,
                  text: "Bonjour Aloulou, oui elles sont toujours disponibles. Elles sont comme neuves.",
                  sender: "me",
                  time: "11:30",
                  date: "Hier"
                },
                // {
                //   id: 3,
                //   text: "Parfait ! Quand pourrais-je venir les chercher?",
                //   sender: "other",
                //   time: "12:05",
                //   date: "Hier"
                // },
                // {
                //   id: 4,
                //   text: "Je suis disponible demain après-midi ou vendredi matin.",
                //   sender: "me",
                //   time: "13:20",
                //   date: "Hier"
                // },
                // {
                //   id: 5,
                //   text: "Merci pour votre réponse. Je pourrais passer les chercher demain après-midi si cela vous convient.",
                //   sender: "other",
                //   time: "09:45",
                //   date: "Aujourd'hui"
                // }
              ];
            }
            
            setMessages(staticChatMessages);
            
            // Sauvegarder ces messages statiques
            await AsyncStorage.setItem(`chat_${params.id}`, JSON.stringify(staticChatMessages));
          } else {
            // Pour les conversations normales
            const storedMessages = await AsyncStorage.getItem(`chat_${params.id}`);
            const initialMessages = storedMessages ? JSON.parse(storedMessages) : [
              {
                id: 1,
                text: "Bonjour, est-ce que les gants sont toujours disponibles?",
                sender: "other",
                time: "10:30",
                date: "Aujourd'hui"
              },
              {
                id: 2,
                text: "Oui, ils sont disponibles. Quand voulez-vous venir les chercher?",
                sender: "me",
                time: "10:35",
                date: "Aujourd'hui"
              },
              {
                id: 3,
                text: "Je pourrais passer demain après-midi vers 15h. Est-ce que ça vous convient?",
                sender: "other",
                time: "10:40",
                date: "Aujourd'hui"
              }
            ];
            
            setMessages(initialMessages);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [params.advertId, params.id]);
  
  // Enregistrer les messages lorsqu'ils sont modifiés
  useEffect(() => {
    if (params.id && messages.length > 0) {
      AsyncStorage.setItem(`chat_${params.id}`, JSON.stringify(messages));
      
      // Mettre à jour le dernier message dans la boîte de réception
      updateInboxLastMessage();
    }
  }, [messages]);
  
  // Mettre à jour le dernier message dans la boîte de réception
  const updateInboxLastMessage = async () => {
    try {
      const inboxMessagesJSON = await AsyncStorage.getItem('inbox_messages');
      if (inboxMessagesJSON) {
        const inboxMessages = JSON.parse(inboxMessagesJSON);
        const updatedInboxMessages = inboxMessages.map(msg => {
          if (msg.id === params.id) {
            const lastMsg = messages[messages.length - 1];
            return {
              ...msg,
              lastMessage: lastMsg.text,
              date: new Date().toLocaleDateString('fr-FR'),
              unread: lastMsg.sender === 'other' // Marquer comme non lu si c'est un message de l'autre personne
            };
          }
          return msg;
        });
        
        await AsyncStorage.setItem('inbox_messages', JSON.stringify(updatedInboxMessages));
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la boîte de réception:", error);
    }
  };
  
  // Simuler une réponse automatique
  const simulateResponse = () => {
    // Réponses possibles
    const possibleResponses = [
      "D'accord, c'est noté !",
      "Merci pour votre message.",
      "Parfait, à bientôt alors !",
      "Oui, c'est toujours disponible.",
      "Je suis disponible demain aussi si vous préférez.",
      "Pas de problème, on peut s'arranger."
    ];
    
    // Choisir une réponse aléatoire
    const randomResponse = possibleResponses[Math.floor(Math.random() * possibleResponses.length)];
    
    // Simuler un délai de frappe
    setTypingStatus(true);
    
    // Répondre après un délai aléatoire
    setTimeout(() => {
      const autoResponse = {
        id: Date.now(),
        text: randomResponse,
        sender: "other",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: "Aujourd'hui"
      };
      
      setMessages(prev => [...prev, autoResponse]);
      setTypingStatus(false);
    }, 2000 + Math.random() * 2000); // Entre 2 et 4 secondes
  };
  
  // Envoyer un nouveau message
  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    
    const newMsg = {
      id: Date.now(),
      text: newMessage,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: "Aujourd'hui"
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage("");
    
    // Faire défiler vers le bas après l'envoi
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    // 50% de chance d'obtenir une réponse automatique
    if (Math.random() > 0.5) {
      simulateResponse();
    }
  };
  
  // Gérer la frappe
  const handleTyping = (text) => {
    setNewMessage(text);
    
    // Animation de la hauteur du TextInput
    const numLines = text.split('\n').length;
    const targetHeight = Math.min(120, Math.max(60, numLines * 40)); // Limiter entre 60 et 120
    
    Animated.timing(animatedHeight, {
      toValue: targetHeight,
      duration: 100,
      useNativeDriver: false
    }).start();
  };
  
  // Basculer l'affichage des détails de l'annonce
  const toggleAdvertDetails = () => {
    setShowAdvertDetails(!showAdvertDetails);
  };
  
  // Basculer l'affichage des méthodes de contact
  const toggleContactMethods = () => {
    setContactMethodsVisible(!contactMethodsVisible);
  };
  
  // Marquer la conversation comme résolue
  const markAsResolved = () => {
    Alert.alert(
      "Marquer comme résolu",
      "Voulez-vous marquer cette conversation comme résolue? L'annonce sera désactivée.",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        { 
          text: "Confirmer", 
          onPress: () => {
            // En production, appel API
            Alert.alert(
              "Succès",
              "L'annonce a été marquée comme résolue et désactivée."
            );
            router.push('/inbox');
          }
        }
      ]
    );
  };
  
  // Regrouper les messages par date
  const groupedMessages = messages.reduce((acc, message) => {
    if (!acc[message.date]) {
      acc[message.date] = [];
    }
    acc[message.date].push(message);
    return acc;
  }, {});

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={darkMode? "light-content" : 'dark-content'}
      />
      
      {/* Header */}
      <View style={[styles.header, {borderBottomColor: darkMode ? '#333333' : '#EEEEEE'}]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {router.push('/inbox')}}
        >
          {darkMode ? <Dark_back /> : <Back />}
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={[styles.name, {color: theme.color}]}>
            {params.name || "Contact"}
          </Text>
          <TouchableOpacity onPress={toggleContactMethods}>
            <Text style={styles.contactMethodsText}>Méthodes de contact</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => {
            Alert.alert(
              "Options",
              "Choisissez une action",
              [
                {
                  text: "Bloquer",
                  style: "destructive",
                  onPress: () => Alert.alert("Utilisateur bloqué")
                },
                {
                  text: "Signaler",
                  onPress: () => Alert.alert("Signalement envoyé")
                },
                {
                  text: "Annuler",
                  style: "cancel"
                }
              ]
            );
          }}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={darkMode ? "#FFFFFF" : "#333333"} />
        </TouchableOpacity>
      </View>
      
      {/* Contact Methods Popup */}
      {contactMethodsVisible && (
        <View style={[styles.contactMethodsPopup, {backgroundColor: theme.cardbg}]}>
          <Text style={[styles.contactMethodTitle, {color: theme.color}]}>
            Méthodes de contact
          </Text>
          <View style={styles.contactMethod}>
            <Ionicons name="mail-outline" size={18} color="#836EFE" />
            <Text style={{color: theme.secondaryColor, marginLeft: 8}}>Email:</Text>
            <Text style={{color: theme.color, marginLeft: 5}}>alachaouech78@gmail.Com</Text>
          </View>
          <View style={styles.contactMethod}>
            <Ionicons name="call-outline" size={18} color="#836EFE" />
            <Text style={{color: theme.secondaryColor, marginLeft: 8}}>Téléphone:</Text>
            <Text style={{color: theme.color, marginLeft: 5}}>+216 52 896 488</Text>
          </View>
          <Text style={styles.contactPreference}>
            Préfère être contacté(e) via l'application
          </Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={toggleContactMethods}
          >
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Advert Card */}
      {showAdvertDetails && advertData && (
        <TouchableOpacity 
          style={[styles.advertCard, {backgroundColor: theme.cardbg}]}
          onPress={toggleAdvertDetails}
        >
          <View style={styles.advertContent}>
            <Image source={advertData.image} style={styles.advertImage} />
            <View style={styles.advertDetails}>
              <Text style={[styles.advertTitle, {color: theme.color}]}>
                {advertData.title}
              </Text>
              <View style={styles.advertMeta}>
                <View style={styles.advertTypeTag}>
                  <Text style={styles.advertTypeText}>{advertData.type}</Text>
                </View>
                <View style={[
                  styles.advertStatusTag,
                  {backgroundColor: advertData.status === "Disponible" ? "#4CAF5020" : "#FF595920"}
                ]}>
                  <Text style={[
                    styles.advertStatusText,
                    {color: advertData.status === "Disponible" ? "#4CAF50" : "#FF5959"}
                  ]}>
                    {advertData.status}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )}
      
      {/* Messages */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#836EFE" />
          <Text style={[styles.loadingText, {color: theme.secondaryColor}]}>
            Chargement des messages...
          </Text>
        </View>
      ) : (
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
        >
          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <View key={date} style={styles.dateSection}>
              <View style={styles.dateHeader}>
                <Text style={styles.dateHeaderText}>{date}</Text>
              </View>
              
              {dateMessages.map(message => (
                <MessageBubble key={message.id} message={message} theme={theme} />
              ))}
            </View>
          ))}
          
          {/* Indicateur de frappe */}
          {typingStatus && (
            <View style={[styles.typingIndicator, {backgroundColor: theme.cardbg}]}>
              <View style={styles.typingDots}>
                <View style={[styles.typingDot, styles.typingDot1]} />
                <View style={[styles.typingDot, styles.typingDot2]} />
                <View style={[styles.typingDot, styles.typingDot3]} />
              </View>
              <Text style={[styles.typingText, {color: theme.secondaryColor}]}>
                {params.name} est en train d'écrire...
              </Text>
            </View>
          )}
        </ScrollView>
      )}
      
      {/* Quick Actions */}
      <View style={[styles.quickActions, {backgroundColor: theme.cardbg}]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={markAsResolved}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#836EFE" />
            <Text style={styles.quickActionText}>Résoudre</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => {
              setNewMessage("Pouvons-nous fixer un rendez-vous?");
            }}
          >
            <Ionicons name="calendar-outline" size={18} color="#836EFE" />
            <Text style={styles.quickActionText}>RDV</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => {
              setNewMessage("Est-ce toujours disponible?");
            }}
          >
            <Ionicons name="help-outline" size={18} color="#836EFE" />
            <Text style={styles.quickActionText}>Disponible?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => {
              setNewMessage("Je suis intéressé(e)!");
            }}
          >
            <Ionicons name="thumbs-up-outline" size={18} color="#836EFE" />
            <Text style={styles.quickActionText}>Intéressé</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => {
              setNewMessage("Merci beaucoup!");
            }}
          >
            <Ionicons name="heart-outline" size={18} color="#836EFE" />
            <Text style={styles.quickActionText}>Merci</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {/* Message Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <Animated.View 
          style={[
            styles.inputWrapper, 
            {
              backgroundColor: theme.cardbg,
              height: animatedHeight
            }
          ]}
        >
          <TouchableOpacity style={styles.attachmentButton}>
            <Ionicons name="add-circle-outline" size={24} color="#836EFE" />
          </TouchableOpacity>
          
          <TextInput
            style={[styles.input, {color: theme.color}]}
            placeholder="Tapez votre message..."
            placeholderTextColor={theme.placeholderColor}
            value={newMessage}
            onChangeText={handleTyping}
            multiline
          />
          
          <TouchableOpacity 
            style={[
              styles.sendButton,
              {backgroundColor: newMessage.trim() ? '#836EFE' : '#836EFE80'}
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Ionicons name="send" size={24} color={newMessage.trim() ? '#FFFFFF' : '#836EFE'} />
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

export default Chat_screen;

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 5,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    lineHeight: 20,
    fontFamily: 'Montserrat_700Bold',
    color: '#39335E',
    marginBottom: 2,
  },
  contactMethodsText: {
    fontSize: 12,
    color: '#836EFE',
    fontFamily: 'Montserrat_500Medium',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    padding: 5,
  },
  moreButton: {
    padding: 5,
  },
  moreButtonText: {
    fontSize: 16,
    color: '#836EFE',
    fontWeight: 'bold',
  },
  contactMethodsPopup: {
    position: 'absolute',
    top: 100,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 200,
  },
  contactMethodTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 16,
    marginBottom: 10,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactPreference: {
    fontSize: 14,
    color: '#836EFE',
    fontFamily: 'Montserrat_500Medium',
    marginBottom: 15,
  },
  closeButton: {
    backgroundColor: '#836EFE',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  advertCard: {
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  advertContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  advertImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  advertDetails: {
    flex: 1,
  },
  advertTitle: {
    fontSize: 16,
    lineHeight: 18,
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 5,
  },
  advertMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  advertTypeTag: {
    padding: 5,
    borderRadius: 10,
    backgroundColor: '#4CAF5020',
  },
  advertTypeText: {
    fontSize: 12,
    color: '#4CAF50',
    fontFamily: 'Montserrat_500Medium',
  },
  advertStatusTag: {
    padding: 5,
    borderRadius: 10,
  },
  advertStatusText: {
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  dateHeader: {
    backgroundColor: '#F0F0F0',
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
  },
  dateHeaderText: {
    fontSize: 14,
    color: '#836EFE',
    fontFamily: 'Montserrat_700Bold',
  },
  messageWrapper: {
    marginVertical: 5,
  },
  myMessageWrapper: {
    alignItems: 'flex-end',
  },
  otherMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  myMessageBubble: {
    borderTopLeftRadius: 0,
  },
  otherMessageBubble: {
    borderTopRightRadius: 0,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 16,
    fontFamily: 'Montserrat_500Medium',
  },
  messageTime: {
    fontSize: 12,
    lineHeight: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  resolvedButton: {
    backgroundColor: '#836EFE',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  resolvedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  inputContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  attachmentButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  sendButton: {
    padding: 10,
    borderRadius: 10,
  },
  quickActions: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  quickActionButton: {
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#836EFE',
    fontFamily: 'Montserrat_500Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'Montserrat_500Medium',
  },
  typingIndicator: {
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingDot1: {
    backgroundColor: '#836EFE',
  },
  typingDot2: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite',
  },
  typingDot3: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite 0.2s',
  },
  typingText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  dateSection: {
    marginBottom: 20,
  },
  messagesContent: {
    paddingBottom: 100, // Espacement pour le clavier
  },
  menuButton: {
    padding: 5,
  },
  resolvedButton: {
    backgroundColor: '#836EFE',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  resolvedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  inputContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  attachmentButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  sendButton: {
    padding: 10,
    borderRadius: 10,
  },
  quickActions: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  quickActionButton: {
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#836EFE',
    fontFamily: 'Montserrat_500Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'Montserrat_500Medium',
  },
  typingIndicator: {
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingDot1: {
    backgroundColor: '#836EFE',
  },
  typingDot2: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite',
  },
  typingDot3: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite 0.2s',
  },
  typingText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  dateSection: {
    marginBottom: 20,
  },
  messagesContent: {
    paddingBottom: 100, // Espacement pour le clavier
  },
  menuButton: {
    padding: 5,
  },
  resolvedButton: {
    backgroundColor: '#836EFE',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  resolvedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  inputContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  attachmentButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  sendButton: {
    padding: 10,
    borderRadius: 10,
  },
  quickActions: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  quickActionButton: {
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#836EFE',
    fontFamily: 'Montserrat_500Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'Montserrat_500Medium',
  },
  typingIndicator: {
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingDot1: {
    backgroundColor: '#836EFE',
  },
  typingDot2: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite',
  },
  typingDot3: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite 0.2s',
  },
  typingText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  dateSection: {
    marginBottom: 20,
  },
  messagesContent: {
    paddingBottom: 100, // Espacement pour le clavier
  },
  menuButton: {
    padding: 5,
  },
  resolvedButton: {
    backgroundColor: '#836EFE',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  resolvedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  inputContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  attachmentButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  sendButton: {
    padding: 10,
    borderRadius: 10,
  },
  quickActions: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  quickActionButton: {
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#836EFE',
    fontFamily: 'Montserrat_500Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'Montserrat_500Medium',
  },
  typingIndicator: {
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingDot1: {
    backgroundColor: '#836EFE',
  },
  typingDot2: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite',
  },
  typingDot3: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite 0.2s',
  },
  typingText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  dateSection: {
    marginBottom: 20,
  },
  messagesContent: {
    paddingBottom: 100, // Espacement pour le clavier
  },
  menuButton: {
    padding: 5,
  },
  resolvedButton: {
    backgroundColor: '#836EFE',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  resolvedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  inputContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  attachmentButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  sendButton: {
    padding: 10,
    borderRadius: 10,
  },
  quickActions: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  quickActionButton: {
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#836EFE',
    fontFamily: 'Montserrat_500Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'Montserrat_500Medium',
  },
  typingIndicator: {
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingDot1: {
    backgroundColor: '#836EFE',
  },
  typingDot2: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite',
  },
  typingDot3: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite 0.2s',
  },
  typingText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  dateSection: {
    marginBottom: 20,
  },
  messagesContent: {
    paddingBottom: 100, // Espacement pour le clavier
  },
  menuButton: {
    padding: 5,
  },
  resolvedButton: {
    backgroundColor: '#836EFE',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  resolvedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  inputContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  attachmentButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  sendButton: {
    padding: 10,
    borderRadius: 10,
  },
  quickActions: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  quickActionButton: {
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#836EFE',
    fontFamily: 'Montserrat_500Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'Montserrat_500Medium',
  },
  typingIndicator: {
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingDot1: {
    backgroundColor: '#836EFE',
  },
  typingDot2: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite',
  },
  typingDot3: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite 0.2s',
  },
  typingText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  dateSection: {
    marginBottom: 20,
  },
  messagesContent: {
    paddingBottom: 100, // Espacement pour le clavier
  },
  menuButton: {
    padding: 5,
  },
  resolvedButton: {
    backgroundColor: '#836EFE',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  resolvedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  inputContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  attachmentButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  sendButton: {
    padding: 10,
    borderRadius: 10,
  },
  quickActions: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  quickActionButton: {
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#836EFE',
    fontFamily: 'Montserrat_500Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'Montserrat_500Medium',
  },
  typingIndicator: {
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingDot1: {
    backgroundColor: '#836EFE',
  },
  typingDot2: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite',
  },
  typingDot3: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite 0.2s',
  },
  typingText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  dateSection: {
    marginBottom: 20,
  },
  messagesContent: {
    paddingBottom: 100, // Espacement pour le clavier
  },
  menuButton: {
    padding: 5,
  },
  resolvedButton: {
    backgroundColor: '#836EFE',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  resolvedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  inputContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  attachmentButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  sendButton: {
    padding: 10,
    borderRadius: 10,
  },
  quickActions: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  quickActionButton: {
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#836EFE',
    fontFamily: 'Montserrat_500Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'Montserrat_500Medium',
  },
  typingIndicator: {
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingDot1: {
    backgroundColor: '#836EFE',
  },
  typingDot2: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite',
  },
  typingDot3: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite 0.2s',
  },
  typingText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  dateSection: {
    marginBottom: 20,
  },
  messagesContent: {
    paddingBottom: 100, // Espacement pour le clavier
  },
  menuButton: {
    padding: 5,
  },
  resolvedButton: {
    backgroundColor: '#836EFE',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  resolvedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  inputContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  attachmentButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  sendButton: {
    padding: 10,
    borderRadius: 10,
  },
  quickActions: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  quickActionButton: {
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#836EFE',
    fontFamily: 'Montserrat_500Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'Montserrat_500Medium',
  },
  typingIndicator: {
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingDot1: {
    backgroundColor: '#836EFE',
  },
  typingDot2: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite',
  },
  typingDot3: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite 0.2s',
  },
  typingText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  dateSection: {
    marginBottom: 20,
  },
  messagesContent: {
    paddingBottom: 100, // Espacement pour le clavier
  },
  menuButton: {
    padding: 5,
  },
  resolvedButton: {
    backgroundColor: '#836EFE',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  resolvedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  inputContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  attachmentButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  sendButton: {
    padding: 10,
    borderRadius: 10,
  },
  quickActions: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  quickActionButton: {
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#836EFE',
    fontFamily: 'Montserrat_500Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'Montserrat_500Medium',
  },
  typingIndicator: {
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingDot1: {
    backgroundColor: '#836EFE',
  },
  typingDot2: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite',
  },
  typingDot3: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite 0.2s',
  },
  typingText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  dateSection: {
    marginBottom: 20,
  },
  messagesContent: {
    paddingBottom: 100, // Espacement pour le clavier
  },
  menuButton: {
    padding: 5,
  },
  resolvedButton: {
    backgroundColor: '#836EFE',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  resolvedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  inputContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  attachmentButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  sendButton: {
    padding: 10,
    borderRadius: 10,
  },
  quickActions: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  quickActionButton: {
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#836EFE',
    fontFamily: 'Montserrat_500Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'Montserrat_500Medium',
  },
  typingIndicator: {
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingDot1: {
    backgroundColor: '#836EFE',
  },
  typingDot2: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite',
  },
  typingDot3: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite 0.2s',
  },
  typingText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  dateSection: {
    marginBottom: 20,
  },
  messagesContent: {
    paddingBottom: 100, // Espacement pour le clavier
  },
  menuButton: {
    padding: 5,
  },
  resolvedButton: {
    backgroundColor: '#836EFE',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  resolvedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  inputContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  attachmentButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  sendButton: {
    padding: 10,
    borderRadius: 10,
  },
  quickActions: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  quickActionButton: {
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#836EFE',
    fontFamily: 'Montserrat_500Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'Montserrat_500Medium',
  },
  typingIndicator: {
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingDot1: {
    backgroundColor: '#836EFE',
  },
  typingDot2: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite',
  },
  typingDot3: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite 0.2s',
  },
  typingText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  dateSection: {
    marginBottom: 20,
  },
  messagesContent: {
    paddingBottom: 100, // Espacement pour le clavier
  },
  menuButton: {
    padding: 5,
  },
  resolvedButton: {
    backgroundColor: '#836EFE',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  resolvedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  inputContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  attachmentButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  sendButton: {
    padding: 10,
    borderRadius: 10,
  },
  quickActions: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  quickActionButton: {
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#836EFE',
    fontFamily: 'Montserrat_500Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'Montserrat_500Medium',
  },
  typingIndicator: {
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingDot1: {
    backgroundColor: '#836EFE',
  },
  typingDot2: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite',
  },
  typingDot3: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite 0.2s',
  },
  typingText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  dateSection: {
    marginBottom: 20,
  },
  messagesContent: {
    paddingBottom: 100, // Espacement pour le clavier
  },
  menuButton: {
    padding: 5,
  },
  resolvedButton: {
    backgroundColor: '#836EFE',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  resolvedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  inputContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  attachmentButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  sendButton: {
    padding: 10,
    borderRadius: 10,
  },
  quickActions: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  quickActionButton: {
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#836EFE',
    fontFamily: 'Montserrat_500Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'Montserrat_500Medium',
  },
  typingIndicator: {
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingDot1: {
    backgroundColor: '#836EFE',
  },
  typingDot2: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite',
  },
  typingDot3: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite 0.2s',
  },
  typingText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  dateSection: {
    marginBottom: 20,
  },
  messagesContent: {
    paddingBottom: 100, // Espacement pour le clavier
  },
  menuButton: {
    padding: 5,
  },
  resolvedButton: {
    backgroundColor: '#836EFE',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  resolvedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  inputContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  attachmentButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  sendButton: {
    padding: 10,
    borderRadius: 10,
  },
  quickActions: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  quickActionButton: {
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#836EFE',
    fontFamily: 'Montserrat_500Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'Montserrat_500Medium',
  },
  typingIndicator: {
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingDot1: {
    backgroundColor: '#836EFE',
  },
  typingDot2: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite',
  },
  typingDot3: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite 0.2s',
  },
  typingText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  dateSection: {
    marginBottom: 20,
  },
  messagesContent: {
    paddingBottom: 100, // Espacement pour le clavier
  },
  menuButton: {
    padding: 5,
  },
  resolvedButton: {
    backgroundColor: '#836EFE',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  resolvedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  inputContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  attachmentButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  sendButton: {
    padding: 10,
    borderRadius: 10,
  },
  quickActions: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  quickActionButton: {
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#836EFE',
    fontFamily: 'Montserrat_500Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'Montserrat_500Medium',
  },
  typingIndicator: {
    padding: 10,
    borderRadius:2,
    marginTop: 10,
    fontFamily: 'Montserrat_500Medium',
  },
  typingIndicator: {
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingDot1: {
    backgroundColor: '#836EFE',
  },
  typingDot2: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite',
  },
  typingDot3: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite 0.2s',
  },
  typingText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  dateSection: {
    marginBottom: 20,
  },
  messagesContent: {
    paddingBottom: 100, // Espacement pour le clavier
  },
  menuButton: {
    padding: 5,
  },
  resolvedButton: {
    backgroundColor: '#836EFE',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  resolvedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  inputContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  attachmentButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  sendButton: {
    padding: 10,
    borderRadius: 10,
  },
  quickActions: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  quickActionButton: {
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#836EFE',
    fontFamily: 'Montserrat_500Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'Montserrat_500Medium',
  },
  typingIndicator: {
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingDot1: {
    backgroundColor: '#836EFE',
  },
  typingDot2: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite',
  },
  typingDot3: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite 0.2s',
  },
  typingText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  dateSection: {
    marginBottom: 20,
  },
  messagesContent: {
    paddingBottom: 100, // Espacement pour le clavier
  },
  menuButton: {
    padding: 5,
  },
  resolvedButton: {
    backgroundColor: '#836EFE',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  resolvedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  inputContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  attachmentButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  sendButton: {
    padding: 10,
    borderRadius: 10,
  },
  quickActions: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  quickActionButton: {
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#836EFE',
    fontFamily: 'Montserrat_500Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'Montserrat_500Medium',
  },
  typingIndicator: {
    padding: 10,
  },
  resolvedButton: {
    backgroundColor: '#836EFE',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  resolvedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  inputContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  attachmentButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  sendButton: {
    padding: 10,
    borderRadius: 10,
  },
  quickActions: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  quickActionButton: {
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#836EFE',
    fontFamily: 'Montserrat_500Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'Montserrat_500Medium',
  },
  typingIndicator: {
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingDot1: {
    backgroundColor: '#836EFE',
  },
  typingDot2: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite',
  },
  typingDot3: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite 0.2s',
  },
  typingText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  dateSection: {
    marginBottom: 20,
  },
  messagesContent: {
    paddingBottom: 100, // Espacement pour le clavier
  },
  menuButton: {
    padding: 5,
  },
  resolvedButton: {
    backgroundColor: '#836EFE',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  resolvedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  inputContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  attachmentButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  sendButton: {
    padding: 10,
    borderRadius: 10,
  },
  quickActions: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  quickActionButton: {
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#836EFE',
    fontFamily: 'Montserrat_500Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'Montserrat_500Medium',
  },
  typingIndicator: {
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingDot1: {
    backgroundColor: '#836EFE',
  },
  typingDot2: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite',
  },
  typingDot3: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite 0.2s',
  },
  typingText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  dateSection: {
    marginBottom: 20,
  },
  messagesContent: {
    paddingBottom: 100, // Espacement pour le clavier
  },
  menuButton: {
    padding: 5,
  },
  resolvedButton: {
    backgroundColor: '#836EFE',
    padding: 10,
    borderRadius: 5,
},
  resolvedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  inputContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  attachmentButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  sendButton: {
    padding: 10,
    borderRadius: 10,
  },
  quickActions: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  quickActionButton: {
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#836EFE',
    fontFamily: 'Montserrat_500Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'Montserrat_500Medium',
  },
  typingIndicator: {
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingDot1: {
    backgroundColor: '#836EFE',
  },
  typingDot2: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite',
  },
  typingDot3: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite 0.2s',
  },
  typingText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  dateSection: {
    marginBottom: 20,
  },
  messagesContent: {
    paddingBottom: 100, // Espacement pour le clavier
  },
  menuButton: {
    padding: 5,
  },
  resolvedButton: {
    backgroundColor: '#836EFE',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  resolvedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  inputContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  attachmentButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  sendButton: {
    padding: 10,
    borderRadius: 10,
  },
  quickActions: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  quickActionButton: {
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#836EFE',
    fontFamily: 'Montserrat_500Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'Montserrat_500Medium',
  },
  typingIndicator: {
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingDot1: {
    backgroundColor: '#836EFE',
  },
  typingDot2: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite',
  },
  typingDot3: {
    backgroundColor: '#836EFE',
    animation: 'typing 0.7s infinite 0.2s',
  },
  typingText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  dateSection: {
    marginBottom: 20,
  },
  messagesContent: {
    paddingBottom: 100, // Espacement pour le clavier
  },
  menuButton: {
    padding: 5,
  },
  resolvedButton: {
    backgroundColor: '#836EFE',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  resolvedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  inputContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  inputWrapper: {
    flexDirection: 'row', 
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  attachmentButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  }
  
})
















