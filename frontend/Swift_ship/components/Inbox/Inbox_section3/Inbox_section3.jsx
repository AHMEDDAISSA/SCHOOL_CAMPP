import { StyleSheet, Text, View, TouchableOpacity, Image, Alert } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { router } from "expo-router";
import { Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import ThemeContext from '../../../theme/ThemeContext';
import AnnonceContext from '../../../contexts/AnnonceContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking'; 

const Inbox_section3 = () => {
  const { theme, darkMode } = useContext(ThemeContext);
  const { annonces } = useContext(AnnonceContext);
  const [messageData, setMessageData] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const filteredAnnonces = annonces.filter(item => 
  item.preferredContact === 'app' || item.inDiscussion
);
  
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
        
        // Convertir TOUTES les annonces en messages
        const newMessages = annonces.map((annonce, index) => {
          // Vérifier si le message existe déjà
          const existingMessage = existingMessages.find(msg => msg.advertId === annonce.id);
          if (existingMessage) return existingMessage;
          
          // Choix aléatoire d'un expéditeur
          const randomNameIndex = Math.floor(Math.random() * randomNames.length);
          const senderName = randomNames[randomNameIndex];
          
          // Récupérer le moyen de communication préféré de l'annonce
          const preferredMethod = annonce.preferredContact || 'app';
          
          // Créer un nouveau message pour cette annonce
          return {
            id: Date.now() + index,
            advertId: annonce.id,
            advertTitle: annonce.title || 'Annonce sans titre',
            advertType: annonce.category || 'Offre',
            lastMessage: `Bonjour, je suis intéressé(e) par votre annonce "${annonce.title || 'Annonce'}". Est-ce toujours disponible?`,
            unread: true,
            date: 'Aujourd\'hui',
            sender: {
              name: senderName,
              preferred_contact: preferredMethod,
              contactInfo: {
                email: annonce.contactEmail || '',
                phone: annonce.contactPhone || ''
              }
            },
            item_image: annonce.imageUrl ? { uri: annonce.imageUrl } : 
                         (annonce.images && annonce.images.length > 0) ? 
                         { uri: annonce.images[0] } : null,
          };
        });
        
        // Mettre à jour tous les messages
        const allMessages = [...newMessages];
        await AsyncStorage.setItem('inbox_messages', JSON.stringify(allMessages));
        setMessageData(allMessages);
        
      } catch (error) {
        console.error('Erreur lors de la conversion des annonces en messages:', error);
      }
    };
    
    // Exécuter la conversion pour toutes les annonces
    convertAnnouncesToMessages();
  }, [annonces]);
  
  // Fonction pour ouvrir l'application correspondante au moyen de communication
  const openContactApp = (item) => {
    const contactMethod = item.sender.preferred_contact;
    const contactInfo = item.sender.contactInfo || {};
    
    switch(contactMethod) {
      case 'email':
        // Ouvrir l'application email
        const emailSubject = `À propos de votre annonce: ${item.advertTitle}`;
        const emailBody = `Bonjour,\n\nJe suis intéressé(e) par votre annonce "${item.advertTitle}".\nEst-ce toujours disponible?\n\nCordialement.`;
        const emailUrl = `mailto:${contactInfo.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        
        Linking.canOpenURL(emailUrl)
          .then(supported => {
            if (supported) {
              return Linking.openURL(emailUrl);
            } else {
              Alert.alert(
                'Erreur',
                "Impossible d'ouvrir l'application email",
                [{ text: 'OK' }]
              );
            }
          })
          .catch(err => {
            console.error('Erreur lors de l\'ouverture de l\'email:', err);
            Alert.alert(
              'Erreur',
              "Une erreur est survenue lors de l'ouverture de l'application email",
              [{ text: 'OK' }]
            );
          });
        break;
      
      case 'phone':
        // Afficher un dialogue pour choisir entre appeler ou WhatsApp
        Alert.alert(
          'Contacter par téléphone',
          'Comment souhaitez-vous contacter cette personne?',
          [
            {
              text: 'Appeler',
              onPress: () => {
                const phoneUrl = `tel:${contactInfo.phone}`;
                Linking.canOpenURL(phoneUrl)
                  .then(supported => {
                    if (supported) {
                      return Linking.openURL(phoneUrl);
                    } else {
                      Alert.alert(
                        'Erreur',
                        "Impossible d'ouvrir l'application téléphone",
                        [{ text: 'OK' }]
                      );
                    }
                  })
                  .catch(err => {
                    console.error('Erreur lors de l\'appel:', err);
                    Alert.alert(
                      'Erreur',
                      "Une erreur est survenue lors de l'ouverture de l'application téléphone",
                      [{ text: 'OK' }]
                    );
                  });
              }
            },
            {
              text: 'WhatsApp',
              onPress: () => {
                // Formater le numéro pour WhatsApp (enlever les espaces, etc.)
                let whatsappNumber = contactInfo.phone?.replace(/\s+/g, '') || '';
                
                // Ajouter le code pays si nécessaire
                if (whatsappNumber.startsWith('0')) {
                  whatsappNumber = `41${whatsappNumber.substring(1)}`;
                }
                
                const whatsappUrl = `whatsapp://send?phone=${whatsappNumber}&text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par votre annonce "${item.advertTitle}". Est-ce toujours disponible?`)}`;
                
                Linking.canOpenURL(whatsappUrl)
                  .then(supported => {
                    if (supported) {
                      return Linking.openURL(whatsappUrl);
                    } else {
                      Alert.alert(
                        'Erreur',
                        "WhatsApp n'est pas installé sur votre appareil",
                        [{ text: 'OK' }]
                      );
                    }
                  })
                  .catch(err => {
                    console.error('Erreur lors de l\'ouverture de WhatsApp:', err);
                    Alert.alert(
                      'Erreur',
                      "Une erreur est survenue lors de l'ouverture de WhatsApp",
                      [{ text: 'OK' }]
                    );
                  });
              }
            },
            {
              text: 'Annuler',
              style: 'cancel'
            }
          ]
        );
        break;
      
      case 'app':
      default:
        // Ouvrir la conversation dans l'application
        router.push({
          pathname: '(screens)/chat_screen',
          params: { 
            id: item.id,
            advertId: item.advertId,
            name: item.sender.name
          }
        });
        break;
    }
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
  
  // Fonction pour obtenir l'icône du moyen de communication
  const getContactIcon = (contactMethod) => {
    switch(contactMethod) {
      case 'email': return 'mail-outline';
      case 'phone': return 'call-outline';
      case 'app': 
      default: return 'chatbubble-outline';
    }
  };
  
  // Fonction pour obtenir le texte du moyen de communication
  const getContactText = (contactMethod) => {
    switch(contactMethod) {
      case 'email': return 'Préfère être contacté par email';
      case 'phone': return 'Préfère être contacté par téléphone';
      case 'app':
      default: return 'Via l\'application';
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
            onPress={() => openContactApp(item)}
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
              <View style={styles.contactPrefContainer}>
                <Ionicons 
                  name={getContactIcon(item.sender.preferred_contact)} 
                  size={12} 
                  color="#9E9E9E" 
                  style={styles.contactIcon} 
                />
                <Text style={styles.contactPref}>
                  {getContactText(item.sender.preferred_contact)}
                </Text>
              </View>
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

// Les styles restent identiques


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
    flex: 1,
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
    marginHorizontal: 5,
  },
  unreadText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Montserrat_500Medium',
  },
  contactButton: {
    backgroundColor: '#836EFE',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Montserrat_700Bold',
  },
});
