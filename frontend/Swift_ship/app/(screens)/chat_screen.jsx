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
  Alert
} from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import Profile from "../../assets/images/Chat1.svg";
import Call from "../../assets/images/phone2.svg";
import Video from "../../assets/images/Video.svg";
import Send from "../../assets/images/star.svg";
import Attachment from "../../assets/images/success.svg";
import { Montserrat_700Bold, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import { router } from "expo-router";
import ThemeContext from '../../theme/ThemeContext';

// Simulez les données de l'annonce associée
const getAdvertData = (advertId) => {
  // En production, récupérez ces données de votre API
  return {
    id: advertId,
    title: "Gants de ski taille 8 ans",
    type: "Prêt",
    status: "Disponible",
    image: require('../../assets/images/anny.jpg'),
  };
};

// Simulez les messages
const getInitialMessages = (chatId) => {
  // En production, récupérez ces données de votre API
  return [
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
};

const Chat_screen = () => {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  const params = useLocalSearchParams();
  
  const [advertData, setAdvertData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showAdvertDetails, setShowAdvertDetails] = useState(true);
  const [contactMethodsVisible, setContactMethodsVisible] = useState(false);
  
  // Récupérer les données au chargement
  useEffect(() => {
    if (params.advertId) {
      const data = getAdvertData(params.advertId);
      setAdvertData(data);
    }
    
    if (params.id) {
      const initialMessages = getInitialMessages(params.id);
      setMessages(initialMessages);
    }
  }, [params.advertId, params.id]);
  
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
  };
  
  const toggleAdvertDetails = () => {
    setShowAdvertDetails(!showAdvertDetails);
  };
  
  const toggleContactMethods = () => {
    setContactMethodsVisible(!contactMethodsVisible);
  };
  
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
            // En production, appelez votre API ici
            Alert.alert(
              "Succès",
              "L'annonce a été marquée comme résolue et désactivée."
            );
            router.push('inbox');
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={darkMode? "light-content" : 'dark-content'}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => {router.push('inbox')}}>
          {darkMode? <Dark_back /> : <Back />}
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={[styles.name, {color: theme.color}]}>
            {params.name || "Contact"}
          </Text>
          <TouchableOpacity onPress={toggleContactMethods}>
            <Text style={styles.contactMethodsText}>Méthodes de contact</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerActions}>
          {/* <TouchableOpacity style={styles.iconButton}>
            <Call />
          </TouchableOpacity> */}
          {/* <TouchableOpacity style={styles.moreButton} onPress={toggleAdvertDetails}>
            <Text style={styles.moreButtonText}>•••</Text>
          </TouchableOpacity> */}
        </View>
      </View>
      
      {/* Contact Methods Popup */}
      {contactMethodsVisible && (
        <View style={[styles.contactMethodsPopup, {backgroundColor: theme.cardbg}]}>
          <Text style={[styles.contactMethodTitle, {color: theme.color}]}>Méthodes de contact</Text>
          <View style={styles.contactMethod}>
            <Text style={{color: theme.secondaryColor}}>Email:</Text>
            <Text style={{color: theme.color}}>email@example.com</Text>
          </View>
          <View style={styles.contactMethod}>
            <Text style={{color: theme.secondaryColor}}>Téléphone:</Text>
            <Text style={{color: theme.color}}>+41 XX XXX XX XX</Text>
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
      
      {/* Advert Details */}
      {showAdvertDetails && advertData && (
        <TouchableOpacity 
          style={[styles.advertCard, {backgroundColor: theme.cardbg}]}
          onPress={() => {
            // Naviguer vers l'écran détaillé de l'annonce
            router.push(`/advert/${advertData.id}`);
          }}
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
      <ScrollView 
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message, index) => {
          // Groupe par date
          const showDateHeader = index === 0 || 
            messages[index - 1].date !== message.date;
            
          return (
            <React.Fragment key={message.id}>
              {showDateHeader && (
                <View style={styles.dateHeader}>
                  <Text style={styles.dateHeaderText}>{message.date}</Text>
                </View>
              )}
              
              <View style={[
                styles.messageWrapper,
                message.sender === "me" ? styles.myMessageWrapper : styles.otherMessageWrapper
              ]}>
                <View style={[
                  styles.messageBubble,
                  message.sender === "me" 
                    ? [styles.myMessageBubble, {backgroundColor: '#836EFE'}] 
                    : [styles.otherMessageBubble, {backgroundColor: theme.cardbg}]
                ]}>
                  <Text style={[
                    styles.messageText,
                    {color: message.sender === "me" ? 'white' : theme.color}
                  ]}>
                    {message.text}
                  </Text>
                  <Text style={[
                    styles.messageTime,
                    {color: message.sender === "me" ? 'rgba(255,255,255,0.7)' : theme.secondaryColor}
                  ]}>
                    {message.time}
                  </Text>
                </View>
              </View>
            </React.Fragment>
          );
        })}
      </ScrollView>
      
      {/* Actions Button */}
      <TouchableOpacity
        style={styles.resolvedButton}
        onPress={markAsResolved}
      >
        <Text style={styles.resolvedButtonText}>Marquer comme résolu</Text>
      </TouchableOpacity>
      
      {/* Message Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={[styles.inputWrapper, {backgroundColor: theme.cardbg}]}>
          <TouchableOpacity style={styles.attachmentButton}>
            <Attachment />
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
            <Send />
          </TouchableOpacity>
        </View>
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
  }
})