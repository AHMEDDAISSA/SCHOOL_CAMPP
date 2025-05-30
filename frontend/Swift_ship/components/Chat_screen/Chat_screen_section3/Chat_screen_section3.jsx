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
  Animated
} from 'react-native';
import React, { useContext, useState, useEffect, useRef } from 'react';
import { useLocalSearchParams } from 'expo-router';
import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import Send from "../../assets/images/star.svg"; // Icône d'envoi
import Attachment from "../../assets/images/success.svg"; // Icône de pièce jointe
import { Montserrat_700Bold, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import ThemeContext from '../../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Composant pour le badge de statut de l'annonce
const StatusBadge = ({ status }) => {
  // Déterminer le style et le texte du badge en fonction du statut
  const getBadgeStyle = (status) => {
    switch(status?.toLowerCase()) {
      case 'réservé':
        return { backgroundColor: '#9C27B0', text: 'Réservé' };
      case 'vendu':
      case 'indisponible':
        return { backgroundColor: '#F44336', text: 'Indisponible' };
      case 'en discussion':
        return { backgroundColor: '#FF9800', text: 'En discussion' };
      default:
        return { backgroundColor: '#4CAF50', text: 'Disponible' };
    }
  };
  
  const { backgroundColor, text } = getBadgeStyle(status);
  
  return (
    <View style={[styles.statusBadge, { backgroundColor }]}>
      <Text style={styles.statusBadgeText}>{text}</Text>
    </View>
  );
};

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

// Écran de conversation principal
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Récupérer les données au chargement
  useEffect(() => {
    const loadData = async () => {
      try {
        // Récupérer les données de l'annonce
        if (params.advertId) {
          // En production, appel API
          const data = {
            id: params.advertId,
            title: params.advertTitle || "Gants de ski taille 8 ans",
            type: "Prêt",
            status: "Disponible",
            // Utiliser une URL d'image plutôt qu'un require
            imageUrl: "https://example.com/image.jpg" 
          };
          setAdvertData(data);
        }
        
        // Récupérer les messages
        if (params.id) {
          // En production, appel API ou AsyncStorage
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
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    };
    
    loadData();
  }, [params.advertId, params.id]);
  
  // Enregistrer les messages lorsqu'ils sont modifiés
  useEffect(() => {
    if (params.id && messages.length > 0) {
      AsyncStorage.setItem(`chat_${params.id}`, JSON.stringify(messages));
    }
  }, [messages]);
  
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
  };
  
  // Animation de la hauteur du TextInput
  useEffect(() => {
    const numLines = newMessage.split('\n').length;
    const targetHeight = Math.min(120, Math.max(60, numLines * 40)); // Limiter entre 60 et 120
    
    Animated.timing(animatedHeight, {
      toValue: targetHeight,
      duration: 100,
      useNativeDriver: false
    }).start();
  }, [newMessage]);
  
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
  
  // Proposer un rendez-vous
  const suggestMeeting = () => {
    setShowDatePicker(true);
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
            <Text style={{color: theme.color, marginLeft: 5}}>email@example.com</Text>
          </View>
          <View style={styles.contactMethod}>
            <Ionicons name="call-outline" size={18} color="#836EFE" />
            <Text style={{color: theme.secondaryColor, marginLeft: 8}}>Téléphone:</Text>
            <Text style={{color: theme.color, marginLeft: 5}}>+41 XX XXX XX XX</Text>
          </View>
          <Text style={styles.contactPreference}>
            <Ionicons name="chatbubble-outline" size={16} color="#836EFE" />
            {' '}Préfère être contacté(e) via l'application
          </Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={toggleContactMethods}
          >
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Advert Details */}
      {showAdvertDetails && advertData && (
        <TouchableOpacity 
          style={[styles.advertCard, {backgroundColor: theme.cardbg}]}
          onPress={toggleAdvertDetails}
        >
          <View style={styles.advertContent}>
            {advertData.imageUrl ? (
              <Image 
                source={{ uri: advertData.imageUrl }} 
                style={styles.advertImage}
                defaultSource={require('../../assets/images/placeholder.png')}
              />
            ) : (
              <View style={[styles.advertImagePlaceholder, {backgroundColor: darkMode ? '#333333' : '#E5E5E5'}]}>
                <Ionicons name="image-outline" size={24} color={darkMode ? '#666666' : '#AAAAAA'} />
              </View>
            )}
            
            <View style={styles.advertDetails}>
              <Text style={[styles.advertTitle, {color: theme.color}]} numberOfLines={1}>
                {advertData.title}
              </Text>
              <View style={styles.advertMeta}>
                <View style={styles.advertTypeTag}>
                  <Text style={styles.advertTypeText}>{advertData.type}</Text>
                </View>
                <StatusBadge status={advertData.status} />
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.advertDetailsButton}
              onPress={() => {
                // Navigation vers l'écran détaillé de l'annonce
                router.push(`/advert/${advertData.id}`);
              }}
            >
              <Ionicons name="chevron-forward" size={18} color="#836EFE" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
      
      {/* Messages */}
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
      </ScrollView>
      
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
            onPress={suggestMeeting}
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
            onChangeText={setNewMessage}
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
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

export default Chat_screen;

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
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
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 2,
  },
  contactMethodsText: {
    fontSize: 12,
    color: '#836EFE',
    fontFamily: 'Montserrat_500Medium',
  },
  menuButton: {
    padding: 5,
  },
  contactMethodsPopup: {
    position: 'absolute',
    top: 100,
    right: 20,
    zIndex: 1000,
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
    marginBottom: 8,
  },
  contactPreference: {
    fontSize: 12,
    color: '#836EFE',
    marginTop: 8,
    fontStyle: 'italic',
  },
  closeButton: {
    backgroundColor: '#836EFE',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  closeButtonText: {
    color: 'white',
    fontFamily: 'Montserrat_500Medium',
  },
  advertCard: {
    margin: 10,
    borderRadius: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  advertContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  advertImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  advertImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  advertDetails: {
    flex: 1,
    marginLeft: 10,
  },
  advertTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14,
    marginBottom: 5,
  },
  advertMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  advertTypeTag: {
    backgroundColor: '#836EFE20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 8,
  },
  advertTypeText: {
    color: '#836EFE',
    fontSize: 10,
    fontFamily: 'Montserrat_500Medium',
  },
  advertDetailsButton: {
    padding: 5,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  dateSection: {
    marginBottom: 15,
  },
  dateHeader: {
    alignItems: 'center',
    marginVertical: 10,
  },
  dateHeaderText: {
    backgroundColor: 'rgba(131, 110, 254, 0.2)',
    color: '#836EFE',
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  messageWrapper: {
    marginVertical: 5,
    maxWidth: '80%',
  },
  myMessageWrapper: {
    alignSelf: 'flex-end',
  },
  otherMessageWrapper: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 15,
    padding: 12,
    minWidth: 80,
  },
  myMessageBubble: {
    borderTopRightRadius: 2,
  },
  otherMessageBubble: {
    borderTopLeftRadius: 2,
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    marginBottom: 5,
  },
  messageTime: {
    fontSize: 10,
    fontFamily: 'Montserrat_500Medium',
    alignSelf: 'flex-end',
  },
  quickActions: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  quickActionButton: {
    backgroundColor: 'rgba(131, 110, 254, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    color: '#836EFE',
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
    marginLeft: 4,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  attachmentButton: {
    padding: 5,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 10,
    fontFamily: 'Montserrat_500Medium',
    maxHeight: 120,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Montserrat_500Medium',
  },
});