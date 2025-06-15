import React, { useContext, useState, useEffect, useRef } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import ThemeContext from '../../theme/ThemeContext';
import MessageContext from '../../contexts/messageContext';
import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import socketService from '../../services/SocketService';

const Inbox = () => {
  const { theme, darkMode } = useContext(ThemeContext);
  const { 
    conversations, 
    loading, 
    unreadCount, 
    loadConversations 
  } = useContext(MessageContext);
  
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const searchHeight = useRef(new Animated.Value(0)).current;

   useEffect(() => {
    const initSocket = async () => {
      await socketService.connect();
      
      // Écouter les nouveaux messages pour mettre à jour la liste
      socketService.on('receive_message', (data) => {
        // Recharger les conversations pour afficher le nouveau message
        loadConversations();
      });

      // Écouter les messages lus
      socketService.on('messages_read', (data) => {
        loadConversations();
      });
    };

    initSocket();
    loadConversations();

    return () => {
      socketService.off('receive_message');
      socketService.off('messages_read');
    };
  }, []);

  // Charger les conversations au montage du composant
  useEffect(() => {
    loadConversations();
  }, []);

  // Filtrer les conversations en fonction de la recherche et du filtre actif
  useEffect(() => {
    if (!conversations.length) {
      setFilteredConversations([]);
      return;
    }
    
    let filtered = [...conversations];
    
    // Trier par date du dernier message (plus récent en premier)
    filtered.sort((a, b) => {
      const dateA = new Date(a.lastMessage?.timestamp || a.updatedAt);
      const dateB = new Date(b.lastMessage?.timestamp || b.updatedAt);
      return dateB - dateA;
    });
    
    // Appliquer le filtre de catégorie
    if (activeFilter === 'unread') {
      filtered = filtered.filter(conv => conv.unreadCount > 0);
    }
    
    // Appliquer la recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(conv => {
        const otherParticipant = getOtherParticipant(conv);
        return (
          otherParticipant?.first_name?.toLowerCase().includes(query) ||
          otherParticipant?.last_name?.toLowerCase().includes(query) ||
          conv.lastMessage?.content?.toLowerCase().includes(query) ||
          conv.advertId?.title?.toLowerCase().includes(query)
        );
      });
    }
    
    setFilteredConversations(filtered);
  }, [conversations, searchQuery, activeFilter]);

const getProfileImageUri = (participant) => {
  if (!participant) return null;
  
  if (participant.profileImageUrl) {
    let imageUrl = participant.profileImageUrl;
    if (!imageUrl.startsWith('http')) {
      imageUrl = `http://192.168.1.21:3001/uploads/${imageUrl}`;
    }
    return { uri: imageUrl };
  }
  
  if (participant.profileImage) {
    let imageUrl = participant.profileImage;
    if (!imageUrl.startsWith('http')) {
      imageUrl = `http://192.168.1.21:3001/uploads/${imageUrl}`;
    }
    return { uri: imageUrl };
  }
  
  return null;
};

  // Obtenir l'autre participant de la conversation
  const getOtherParticipant = (conversation) => {
    return conversation.participants?.find(p => p._id !== conversation.currentUserId);
  };

  // Formatage de la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return "Aujourd'hui";
    } else if (diffDays === 2) {
      return "Hier";
    } else if (diffDays <= 7) {
      return `Il y a ${diffDays - 1} jours`;
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  // Formatage du nom complet
  const getFullName = (participant) => {
    if (!participant) return "Utilisateur inconnu";
    return `${participant.first_name || ''} ${participant.last_name || ''}`.trim();
  };

  // Générer les initiales pour l'avatar
  const getInitials = (participant) => {
    if (!participant) return "?";
    const firstName = participant.first_name || '';
    const lastName = participant.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Couleur d'avatar basée sur le nom
  const getAvatarColor = (participant) => {
    if (!participant) return "#836EFE";
    
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFBE0B', 
      '#FB5607', '#8338EC', '#3A86FF', '#FF006E',
      '#6A7FDB', '#80DED9', '#AEBC21', '#ECB390'
    ];
    
    const name = getFullName(participant);
    const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
  };

  // Rafraîchir les conversations
  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
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

  // Naviguer vers le chat
  const openConversation = (conversation) => {
    const otherParticipant = getOtherParticipant(conversation);
    router.push({
      pathname: '(screens)/chat_screen',
      params: { 
        conversationId: conversation._id,
        participantName: getFullName(otherParticipant),
        advertTitle: conversation.advertId?.title || ''
      }
    });
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/home')}>
          {darkMode ? <Dark_back /> : <Back />}
        </TouchableOpacity>
        <Text style={[styles.heading, {color: theme.color}]}>
          Messages {unreadCount > 0 && `(${unreadCount})`}
        </Text>
        <TouchableOpacity onPress={toggleSearch}>
          <Ionicons 
            name={searchVisible ? "close-outline" : "search-outline"} 
            size={24} 
            color={darkMode ? "#FFFFFF" : "#333333"} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Search Bar */}
      <Animated.View style={[styles.searchContainer, { height: searchHeight }]}>
        <TextInput 
          style={[styles.searchInput, {backgroundColor: theme.cardbg, color: theme.color}]}
          placeholder="Rechercher une conversation..." 
          placeholderTextColor={theme.placeholderColor}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
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
            Toutes
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
            Non lues
          </Text>
          {conversations.filter(c => c.unreadCount > 0).length > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>
                {conversations.filter(c => c.unreadCount > 0).length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Conversations List */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#836EFE" />
          <Text style={[styles.loaderText, {color: theme.secondaryColor}]}>
            Chargement des conversations...
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
          {filteredConversations.length === 0 ? (
            <View style={[styles.emptyState, {backgroundColor: theme.cardbg}]}>
              <Ionicons 
                name="chatbubble-ellipses-outline" 
                size={50} 
                color={theme.secondaryColor} 
              />
              <Text style={[styles.emptyStateTitle, {color: theme.color}]}>
                Aucune conversation
              </Text>
              <Text style={[styles.emptyStateText, {color: theme.secondaryColor}]}>
                {searchQuery 
                  ? "Aucune conversation ne correspond à votre recherche" 
                  : "Vous n'avez pas encore de conversations"}
              </Text>
            </View>
          ) : (
            filteredConversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              const isUnread = conversation.unreadCount > 0;
              
              return (
                <TouchableOpacity 
                  key={conversation._id} 
                  style={[
                    styles.conversationCard, 
                    {backgroundColor: theme.cardbg},
                    isUnread && styles.unreadCard
                  ]}
                  onPress={() => openConversation(conversation)}
                >
                  <View style={styles.conversationContent}>
                    {/* Photo de profil */}
                   <View style={styles.profileSection}>
  {(() => {
    const profileImageUri = getProfileImageUri(otherParticipant);
    return profileImageUri ? (
      <Image 
        source={profileImageUri} 
        style={styles.profileImage}
      />
    ) : (
      <View 
        style={[
          styles.profileImagePlaceholder, 
          {backgroundColor: getAvatarColor(otherParticipant)}
        ]}
      >
        <Text style={styles.initialsText}>
          {getInitials(otherParticipant)}
        </Text>
      </View>
    );
  })()}
  
  {/* Indicateur de message non lu */}
  {isUnread && (
    <View style={styles.unreadDot} />
  )}
</View>

                    
                    {/* Contenu de la conversation */}
                    <View style={styles.conversationInfo}>
                      <View style={styles.conversationHeader}>
                        <Text 
                          style={[
                            styles.participantName, 
                            {color: theme.color},
                            isUnread && styles.unreadText
                          ]} 
                          numberOfLines={1}
                        >
                          {getFullName(otherParticipant)}
                        </Text>
                        
                        <Text style={styles.dateText}>
                          {formatDate(conversation.lastMessage?.timestamp || conversation.updatedAt)}
                        </Text>
                      </View>
                      
                      {/* Titre de l'annonce si disponible */}
                      {conversation.advertId?.title && (
                        <Text 
                          style={[styles.advertTitle, {color: theme.secondaryColor}]} 
                          numberOfLines={1}
                        >
                          📦 {conversation.advertId.title}
                        </Text>
                      )}
                      
                      {/* Dernier message */}
                      <Text 
                        style={[
                          styles.lastMessage, 
                          {color: isUnread ? theme.color : theme.secondaryColor},
                          isUnread && styles.unreadText
                        ]} 
                        numberOfLines={2}
                      >
                        {conversation.lastMessage?.content || "Nouveau message"}
                      </Text>
                    </View>
                    
                    {/* Indicateur de messages non lus */}
                    {isUnread && conversation.unreadCount > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>
                          {conversation.unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
};

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
    fontSize: 14,
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
  conversationCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
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
  conversationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileSection: {
    position: 'relative',
    marginRight: 12,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  profileImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#836EFE',
    borderWidth: 2,
    borderColor: 'white',
  },
  conversationInfo: {
    flex: 1,
    marginRight: 10,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
    flex: 1,
    marginRight: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#9E9E9E',
    fontFamily: 'Montserrat_500Medium',
  },
  advertTitle: {
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  lastMessage: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    lineHeight: 18,
  },
  unreadText: {
    fontFamily: 'Montserrat_700Bold',
  },
  unreadBadge: {
    backgroundColor: '#836EFE',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Montserrat_700Bold',
  },
});
