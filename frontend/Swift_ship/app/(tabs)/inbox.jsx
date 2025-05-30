import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  TextInput,
  ActivityIndicator,
  Animated,
  RefreshControl
} from 'react-native';
import React, { useContext, useState, useEffect, useRef } from 'react';
import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import { Montserrat_700Bold, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import ThemeContext from '../../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnnonceContext from '../../contexts/AnnonceContext';
import * as Linking from 'expo-linking';

const Inbox = () => {
  const { theme, darkMode } = useContext(ThemeContext);
  const { annonces } = useContext(AnnonceContext);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageData, setMessageData] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const searchHeight = useRef(new Animated.Value(0)).current;
  
  // Messages statiques pour le rapport
  const staticMessages = [
    {
      id: 'static_msg_1',
      advertId: 'static_advert_1',
      advertTitle: "Veste de ski pour enfant taille 8 ans",
      advertType: "Prêter",
      lastMessage: "Bonjour, je suis intéressée par votre veste de ski. Est-elle toujours disponible pour le camp de février?",
      unread: true,
      date: 'Aujourd\'hui',
      sender: {
        name: 'Takwa Aissa',
        preferred_contact: 'app',
        contactInfo: {
          email: 'Takwa.aissa@gmail.com',
          phone: '+41 79 123 45 67'
        }
      },
      item_image: require('../../assets/images/veste_enfant.jpeg'),
    },
    {
      id: 'static_msg_2',
      advertId: 'static_advert_2',
      advertTitle: "Chaussures de randonnée taille 38",
      advertType: "Donner",
      lastMessage: "Merci pour votre réponse. Je pourrais passer les chercher demain après-midi si cela vous convient.",
      unread: false,
      date: 'Hier',
      sender: {
        name: 'Ala Chouech',
        preferred_contact: 'app',
        contactInfo: {
          email: 'alachaouech78@gmail.Com',
          phone: '+41 78 987 65 43'
        }
      },
      item_image: { uri: 'https://images.unsplash.com/photo-1520219306100-ec4afeeefe58?w=400&h=300&fit=crop' },
    },
    {
      id: 'static_msg_3',
      advertId: 'static_advert_3',
      advertTitle: "Equipement de ski ",
      advertType: "Échanger",
      lastMessage: "Parfait ! J'ai aussi des livres de pâtisserie si ça vous intéresse pour l'échange.",
      unread: true,
      date: 'Aujourd\'hui',
      sender: {
        name: 'Ala Eddin Chouch',
        preferred_contact: 'app',
        contactInfo: {
          email: 'alachaouech78@gmail.Com',
          phone: '+41 55 322 665'
        }
      },
      item_image: require('../../assets/images/equipement de ski.jpeg'),
    }
  ];
  
  // Récupérer les messages
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        // Combiner les messages statiques avec les messages dynamiques
        const storedMessages = await AsyncStorage.getItem('inbox_messages');
        let dynamicMessages = [];
        
        if (storedMessages) {
          dynamicMessages = JSON.parse(storedMessages);
        } else {
          // Convertir les annonces en messages si pas de messages stockés
          dynamicMessages = await convertAnnouncesToMessages();
        }
        
        // Combiner messages statiques et dynamiques
        const allMessages = [...staticMessages, ...dynamicMessages];
        setMessageData(allMessages);
        setFilteredMessages(allMessages);
        
      } catch (error) {
        console.error('Erreur lors de la récupération des messages:', error);
        // En cas d'erreur, utiliser seulement les messages statiques
        setMessageData(staticMessages);
        setFilteredMessages(staticMessages);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessages();
  }, [annonces]);
  
  // Filtrer les messages en fonction de la recherche
  useEffect(() => {
    if (!messageData.length) return;
    
    let filtered = [...messageData];
    
    // Appliquer le filtre de catégorie
    if (activeFilter === 'unread') {
      filtered = filtered.filter(msg => msg.unread);
    } else if (activeFilter === 'app') {
      filtered = filtered.filter(msg => msg.sender.preferred_contact === 'app');
    } else if (activeFilter === 'external') {
      filtered = filtered.filter(msg => msg.sender.preferred_contact !== 'app');
    }
    
    // Appliquer la recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        msg => 
          msg.advertTitle?.toLowerCase().includes(query) ||
          msg.sender.name?.toLowerCase().includes(query) ||
          msg.lastMessage?.toLowerCase().includes(query)
      );
    }
    
    setFilteredMessages(filtered);
  }, [messageData, searchQuery, activeFilter]);
  
  // Convertir les annonces en messages (pour les messages dynamiques)
  const convertAnnouncesToMessages = async () => {
    try {
      const randomNames = [
        'Lucas Petit', 'Léa Durand', 'Hugo Lefèvre',
        'Chloé Moreau', 'Louis Girard', 'Inès Robert'
      ];
      
      const newMessages = annonces.map((annonce, index) => {
        const randomNameIndex = Math.floor(Math.random() * randomNames.length);
        const senderName = randomNames[randomNameIndex];
        const preferredMethod = annonce.preferredContact || 'app';
        
        return {
          id: Date.now() + index + 1000, // S'assurer que les IDs ne se chevauchent pas
          advertId: annonce.id,
          advertTitle: annonce.title || 'Annonce sans titre',
          advertType: annonce.category || 'Offre',
          lastMessage: `Bonjour, je suis intéressé(e) par votre annonce "${annonce.title || 'Annonce'}". Est-ce toujours disponible?`,
          unread: Math.random() > 0.5, // Aléatoirement lu/non lu
          date: Math.random() > 0.5 ? 'Aujourd\'hui' : 'Hier',
          sender: {
            name: senderName,
            preferred_contact: preferredMethod,
            contactInfo: {
              email: annonce.contactEmail || `${senderName.toLowerCase().replace(' ', '.')}@email.com`,
              phone: annonce.contactPhone || `+41 ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)}`
            }
          },
          item_image: annonce.imageUrl ? { uri: annonce.imageUrl } : 
                     (annonce.images && annonce.images.length > 0) ? 
                     { uri: annonce.images[0] } : null,
        };
      });
      
      return newMessages;
      
    } catch (error) {
      console.error('Erreur lors de la conversion des annonces en messages:', error);
      return [];
    }
  };
  
  // Rafraîchir les messages
  const onRefresh = async () => {
    setRefreshing(true);
    const dynamicMessages = await convertAnnouncesToMessages();
    const allMessages = [...staticMessages, ...dynamicMessages];
    setMessageData(allMessages);
    setFilteredMessages(allMessages);
    setRefreshing(false);
  };
  
  // Basculer l'affichage de la recherche
  const toggleSearch = () => {
    Animated.timing(searchHeight, {
      toValue: searchVisible ? 0 : 60,
      duration: 300,
      useNativeDriver: false
    }).start();
    
    setSearchVisible(!searchVisible);
    if (searchVisible) {
      setSearchQuery('');
    }
  };
  
  // Fonction pour ouvrir l'application correspondante au moyen de communication
  const openContactApp = (item) => {
    // Marquer le message comme lu
    const updatedMessages = messageData.map(msg => {
      if (msg.id === item.id) {
        return { ...msg, unread: false };
      }
      return msg;
    });
    
    setMessageData(updatedMessages);
    setFilteredMessages(updatedMessages);
    
    // Naviguer vers l'écran de chat
    router.push({
      pathname: '(screens)/chat_screen',
      params: { 
        id: item.id,
        advertId: item.advertId,
        advertTitle: item.advertTitle,
        name: item.sender.name
      }
    });
  };
  
  // Fonctions utilitaires
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };
  
  const getAvatarColor = (name) => {
    if (!name) return "#836EFE";
    
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFBE0B', 
      '#FB5607', '#8338EC', '#3A86FF', '#FF006E',
      '#6A7FDB', '#80DED9', '#AEBC21', '#ECB390'
    ];
    
    const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
  };
  
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
  
  const getContactIcon = (contactMethod) => {
    switch(contactMethod) {
      case 'email': return 'mail-outline';
      case 'phone': return 'call-outline';
      case 'app': 
      default: return 'chatbubble-outline';
    }
  };
  
  const getContactText = (contactMethod) => {
    switch(contactMethod) {
      case 'email': return 'Préfère être contacté par email';
      case 'phone': return 'Préfère être contacté par téléphone';
      case 'app':
      default: return 'Via l\'application';
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      {/* Header */}
      <View style={[styles.header]}>
        <TouchableOpacity onPress={() => router.push('/home')}>
          {darkMode ? <Dark_back /> : <Back />}
        </TouchableOpacity>
        <Text style={[styles.heading, {color: theme.color}]}>Messages</Text>
        {/* Supprimer le bouton de recherche ci-dessous */}
        {/* 
        <TouchableOpacity onPress={toggleSearch}>
          <Ionicons 
            name={searchVisible ? "close-outline" : "search-outline"} 
            size={24} 
            color={darkMode ? "#FFFFFF" : "#333333"} 
          />
        </TouchableOpacity>
        */}
        {/* Laisser un espace vide pour maintenir l'alignement */}
        <View style={{width: 24}} />
      </View>
      
      {/* Search Bar */}
      <Animated.View style={[styles.searchContainer, { height: searchHeight }]}>
        <TextInput 
          style={[styles.searchInput, {backgroundColor: theme.cardbg, color: theme.color}]}
          placeholder="Rechercher un message..." 
          placeholderTextColor={theme.placeholderColor}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.filterButton} onPress={() => {
          alert("Options de filtrage avancées");
        }}>
          <Ionicons name="options-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
      
      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity 
          style={[
            styles.filterTab, 
            activeFilter === 'all' && styles.activeFilterTab
          ]}
          onPress={() => setActiveFilter('all')}
        >
          <Text 
            style={[
              styles.filterTabText, 
              activeFilter === 'all' && styles.activeFilterTabText
            ]}
          >
            Tous
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterTab, 
            activeFilter === 'unread' && styles.activeFilterTab
          ]}
          onPress={() => setActiveFilter('unread')}
        >
          <Text 
            style={[
              styles.filterTabText, 
              activeFilter === 'unread' && styles.activeFilterTabText
            ]}
          >
            Non lus
          </Text>
          {messageData.filter(m => m.unread).length > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>
                {messageData.filter(m => m.unread).length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterTab, 
            activeFilter === 'app' && styles.activeFilterTab
          ]}
          onPress={() => setActiveFilter('app')}
        >
          <Text 
            style={[
              styles.filterTabText, 
              activeFilter === 'app' && styles.activeFilterTabText
            ]}
          >
            In-App
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterTab, 
            activeFilter === 'external' && styles.activeFilterTab
          ]}
          onPress={() => setActiveFilter('external')}
        >
          <Text 
            style={[
              styles.filterTabText, 
              activeFilter === 'external' && styles.activeFilterTabText
            ]}
          >
            Externes
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Messages List */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#836EFE" />
          <Text style={[styles.loaderText, {color: theme.secondaryColor}]}>
            Chargement des messages...
          </Text>
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#836EFE"]}
              tintColor={darkMode ? "#FFFFFF" : "#836EFE"}
            />
          }
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          {filteredMessages.length === 0 ? (
            <View style={[styles.emptyState, {backgroundColor: theme.cardbg}]}>
              <Ionicons 
                name="chatbubble-ellipses-outline" 
                size={50} 
                color={theme.secondaryColor} 
              />
              <Text style={[styles.emptyStateTitle, {color: theme.color}]}>
                Aucun message
              </Text>
              <Text style={[styles.emptyStateText, {color: theme.secondaryColor}]}>
                {searchQuery 
                  ? "Aucun message ne correspond à votre recherche" 
                  : "Aucun message lié à vos annonces pour l'instant"}
              </Text>
              {searchQuery && (
                <TouchableOpacity 
                  style={styles.clearSearchButton}
                  onPress={() => setSearchQuery('')}
                >
                  <Text style={styles.clearSearchText}>Effacer la recherche</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredMessages.map((item) => (
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
                        defaultSource={require('../../assets/images/placeholder.png')}
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
          
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color="#836EFE" style={{marginRight: 5}} />
            <Text style={styles.infoText}>
              Les messages sont visibles pendant 30 jours après la dernière activité de l'annonce
            </Text>
          </View>
        </ScrollView>
      )}
      
      {/* Supprimer ce bouton flottant */}
      {/* 
      <TouchableOpacity 
        style={styles.newMessageButton}
        onPress={() => router.push('(screens)/new_message')}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
      */}
    </View>
  );
}

export default Inbox;


const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 0,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  heading: {
    fontSize: 20,
    fontFamily: 'Montserrat_700Bold',
    color: '#39335E',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    fontSize: 14,
  },
  filterButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#836EFE',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(131, 110, 254, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeFilterTab: {
    backgroundColor: '#836EFE',
  },
  filterTabText: {
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
    color: '#836EFE',
  },
  activeFilterTabText: {
    color: 'white',
  },
  badgeContainer: {
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Montserrat_500Medium',
    paddingHorizontal: 5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  emptyState: {
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
    marginTop: 15,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'center',
    marginBottom: 15,
  },
  clearSearchButton: {
    backgroundColor: '#836EFE',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  clearSearchText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
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
  },
  unreadText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Montserrat_500Medium',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(131, 110, 254, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  infoText: {
    fontSize: 12,
    color: '#836EFE',
    fontFamily: 'Montserrat_500Medium',
    flex: 1,
  },
  newMessageButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#836EFE',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
