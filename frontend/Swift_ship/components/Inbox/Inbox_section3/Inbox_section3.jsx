import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { router } from "expo-router";
import { Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import ThemeContext from '../../../theme/ThemeContext';
import AnnonceContext from '../../../contexts/AnnonceContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const Inbox_section3 = () => {
  const { theme, darkMode } = useContext(ThemeContext);
  const { annonces } = useContext(AnnonceContext);
  const [messageData, setMessageData] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  
  // Récupérer les infos du profil utilisateur
  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const profileData = await AsyncStorage.getItem('user_profile');
        if (profileData) {
          setUserProfile(JSON.parse(profileData));
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du profil utilisateur:', error);
      }
    };
    
    getUserProfile();
  }, []);
  
  // Convertir les annonces en messages
  useEffect(() => {
    const convertAnnouncesToMessages = async () => {
      try {
        // Récupérer les messages existants
        const existingMessagesJSON = await AsyncStorage.getItem('inbox_messages');
        let existingMessages = existingMessagesJSON ? JSON.parse(existingMessagesJSON) : [];
        
        // Générer des noms aléatoires pour les expéditeurs
        const randomNames = [
          'Sophie Martin', 'Thomas Dubois', 'Emma Bernard', 
          'Lucas Petit', 'Léa Durand', 'Hugo Lefèvre',
          'Chloé Moreau', 'Louis Girard', 'Inès Robert'
        ];
        
        // Convertir les nouvelles annonces en messages
        const newMessages = annonces.map((annonce, index) => {
          // Vérifier si le message existe déjà
          const existingMessage = existingMessages.find(msg => msg.advertId === annonce.id);
          if (existingMessage) return existingMessage;
          
          // Choix aléatoire d'un expéditeur
          const randomNameIndex = Math.floor(Math.random() * randomNames.length);
          const senderName = randomNames[randomNameIndex];
          
          // Choix aléatoire d'un mode de contact préféré
          const contactModes = ['app', 'phone', 'email'];
          const randomContactMode = contactModes[Math.floor(Math.random() * contactModes.length)];
          
          // Créer un nouveau message pour cette annonce
          return {
            id: Date.now() + index,
            advertId: annonce.id,
            advertTitle: annonce.title,
            advertType: annonce.category || 'Offre',
            lastMessage: `Bonjour, je suis intéressé(e) par votre annonce "${annonce.title}". Est-ce toujours disponible?`,
            unread: true,
            date: 'Aujourd\'hui',
            sender: {
              name: senderName,
              preferred_contact: randomContactMode,
              // Pas d'image spécifique, nous utiliserons des avatars générés
            },
            item_image: annonce.imageUrl ? { uri: annonce.imageUrl } : 
                         (annonce.images && annonce.images.length > 0) ? 
                         { uri: annonce.images[0] } : null,
          };
        });
        
        // Combiner avec les messages existants en évitant les doublons
        const allMessages = [...existingMessages];
        
        // Ajouter uniquement les nouveaux messages
        newMessages.forEach(newMsg => {
          if (!existingMessages.some(msg => msg.advertId === newMsg.advertId)) {
            allMessages.push(newMsg);
          }
        });
        
        // Sauvegarder et mettre à jour l'état
        await AsyncStorage.setItem('inbox_messages', JSON.stringify(allMessages));
        setMessageData(allMessages);
        
      } catch (error) {
        console.error('Erreur lors de la conversion des annonces en messages:', error);
      }
    };
    
    // Exécuter la conversion
    convertAnnouncesToMessages();
  }, [annonces]);
  
  const openChat = (messageItem) => {
    router.push({
      pathname: '(screens)/chat_screen',
      params: { 
        id: messageItem.id,
        advertId: messageItem.advertId,
        name: messageItem.sender.name
      }
    });
  };
  
  // Fonction pour obtenir les initiales d'un nom
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };
  
  // Fonction pour générer une couleur basée sur une chaîne
  const getAvatarColor = (name) => {
    if (!name) return "#836EFE";
    
    // Liste de couleurs attrayantes
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFBE0B', 
      '#FB5607', '#8338EC', '#3A86FF', '#FF006E',
      '#6A7FDB', '#80DED9', '#AEBC21', '#ECB390'
    ];
    
    // Utiliser les caractères du nom pour générer un index
    const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
  };
  
  // Fonction pour obtenir l'icône de catégorie
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Donner': return 'gift-outline';
      case 'Prêter': return 'swap-horizontal-outline';
      case 'Emprunter': return 'hand-left-outline';
      case 'Louer': return 'cash-outline';
      case 'Acheter': return 'cart-outline';
      case 'Échanger': return 'repeat-outline';
      default: return 'document-outline';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, {color: theme.color}]}>Messages liés aux annonces</Text>
      
      {messageData.length === 0 ? (
        <View style={[styles.emptyState, {backgroundColor: theme.cardbg}]}>
          <Text style={[styles.emptyStateText, {color: theme.color}]}>
            Aucun message lié à vos annonces pour l'instant
          </Text>
        </View>
      ) : (
        messageData.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={[
              styles.messageCard, 
              {backgroundColor: theme.cardbg},
              item.unread && styles.unreadCard
            ]}
            onPress={() => openChat(item)}
          >
            <View style={styles.messageHeader}>
              <View style={styles.advertTypeTag}>
                <Text style={styles.advertTypeText}>{item.advertType}</Text>
              </View>
              <Text style={styles.dateText}>{item.date}</Text>
            </View>
            
            <View style={styles.messageContent}>
              {/* Avatar généré pour l'expéditeur */}
              <View 
                style={[
                  styles.profileImage, 
                  {backgroundColor: getAvatarColor(item.sender.name)}
                ]}
              >
                <Text style={styles.initialsText}>{getInitials(item.sender.name)}</Text>
              </View>
              
              <View style={styles.textContainer}>
                <Text style={[styles.advertTitle, {color: theme.color}]} numberOfLines={1}>
                  {item.advertTitle}
                </Text>
                <Text style={[styles.senderName, {color: theme.secondaryColor}]}>
                  {item.sender.name}
                </Text>
                <Text 
                  style={[
                    styles.messageText, 
                    {color: item.unread ? theme.color : theme.secondaryColor}
                  ]} 
                  numberOfLines={2}
                >
                  {item.lastMessage}
                </Text>
              </View>
              
              <View style={styles.itemImageContainer}>
                {item.item_image ? (
                  <Image 
                    source={item.item_image} 
                    style={styles.itemImage} 
                  />
                ) : (
                  <View style={[styles.itemImagePlaceholder, {backgroundColor: darkMode ? '#444444' : '#E0E0E0'}]}>
                    <Ionicons 
                      name={getCategoryIcon(item.advertType)} 
                      size={24} 
                      color={darkMode ? '#666666' : '#AAAAAA'} 
                    />
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.messageFooter}>
              {item.sender.preferred_contact === 'app' && (
                <View style={styles.contactPrefContainer}>
                  <Ionicons name="chatbubble-outline" size={12} color="#9E9E9E" style={styles.contactIcon} />
                  <Text style={styles.contactPref}>Via l'application</Text>
                </View>
              )}
              {item.sender.preferred_contact === 'phone' && (
                <View style={styles.contactPrefContainer}>
                  <Ionicons name="call-outline" size={12} color="#9E9E9E" style={styles.contactIcon} />
                  <Text style={styles.contactPref}>Préfère être contacté par téléphone</Text>
                </View>
              )}
              {item.sender.preferred_contact === 'email' && (
                <View style={styles.contactPrefContainer}>
                  <Ionicons name="mail-outline" size={12} color="#9E9E9E" style={styles.contactIcon} />
                  <Text style={styles.contactPref}>Préfère être contacté par email</Text>
                </View>
              )}
              {item.unread && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>Nouveau</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}

export default Inbox_section3;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 15,
  },
  emptyState: {
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'center',
  },
  messageCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#836EFE',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  advertTypeTag: {
    backgroundColor: '#836EFE20',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  advertTypeText: {
    color: '#836EFE',
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
  },
  dateText: {
    color: '#9E9E9E',
    fontSize: 12,
  },
  messageContent: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  advertTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14,
    marginBottom: 3,
  },
  senderName: {
    fontSize: 12,
    marginBottom: 5,
    fontFamily: 'Montserrat_500Medium',
  },
  messageText: {
    fontSize: 13,
    fontFamily: 'Montserrat_500Medium',
  },
  itemImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  contactPrefContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIcon: {
    marginRight: 4,
  },
  contactPref: {
    fontSize: 11,
    color: '#9E9E9E',
    fontFamily: 'Montserrat_500Medium',
    fontStyle: 'italic',
  },
  unreadBadge: {
    backgroundColor: '#836EFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  unreadText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Montserrat_500Medium',
  },
});