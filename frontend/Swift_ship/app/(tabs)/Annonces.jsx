import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, FlatList, ActivityIndicator, RefreshControl, SafeAreaView, Dimensions, Platform, Alert, TextInput } from 'react-native';
import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import Filter from '../../assets/images/filter.svg';
import Search from "../../assets/images/search2.svg";
import { router, useFocusEffect } from "expo-router";
import ThemeContext from '../../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import AnnonceContext from '../../contexts/AnnonceContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { debounce } from 'lodash'; 
import * as Linking from 'expo-linking';
import DynamicContactButton from '../../components/DynamicContactButton/DynamicContactButton';
import { createOrGetConversation } from '../../services/createOrGetConversation';


// Screen dimensions for responsive layouts
const { width } = Dimensions.get('window');

// Component for category buttons
const CategoryButton = ({ category, isActive, darkMode, onPress }) => (
  <TouchableOpacity 
    style={[
      styles.categoryButton, 
      isActive && styles.activeCategoryButton,
      { backgroundColor: darkMode ? '#363636' : '#F0F0F0' }
    ]}
    onPress={onPress}
    accessible={true}
    accessibilityLabel={`Catégorie ${category.name}`}
    accessibilityHint={`Filtrer les annonces par catégorie ${category.name}`}
    accessibilityRole="button"
    accessibilityState={{ selected: isActive }}
  >
    {category.icon && (
      <View style={[
        styles.categoryIconContainer,
        { backgroundColor: isActive 
          ? (darkMode ? '#ffffff' : '#39335E')
          : (darkMode ? '#5D5FEF' : '#E6E6FA') 
        }
      ]}>
        <Ionicons 
          name={category.icon} 
          size={20} 
          color={isActive 
            ? (darkMode ? '#363636' : '#ffffff')
            : (darkMode ? '#FFFFFF' : '#5D5FEF')
          } 
        />
      </View>
    )}
    <Text 
      style={[
        styles.categoryText, 
        isActive && styles.activeCategoryText,
        {color: isActive 
          ? '#FFFFFF' 
          : (darkMode ? '#FFFFFF' : '#39335E')
        }
      ]}
      numberOfLines={1}
    >
      {category.name}
    </Text>
  </TouchableOpacity>
);
 const getContactStyle = (contactMethod) => {
  switch(contactMethod) {
    case 'phone': 
      return { backgroundColor: '#2196F3', icon: 'call-outline', text: 'Appeler' };
    case 'email':
      return { backgroundColor: '#4CAF50', icon: 'mail-outline', text: 'Email' };
    default:
      return { backgroundColor: '#39335E', icon: 'chatbubble-outline', text: 'Message' };
  }
};
const getContactButtonStyle = (contactMethod) => {
  switch(contactMethod) {
    case 'email':
      return {
        backgroundColor: '#4285F4',
        icon: 'mail-outline',
        text: 'Email'
      };
    case 'phone':
      return {
        backgroundColor: '#34A853',
        icon: 'call-outline',
        text: 'Téléphoner'
      };
    case 'whatsapp':
      return {
        backgroundColor: '#25D366',
        icon: 'logo-whatsapp',
        text: 'WhatsApp'
      };
    case 'sms':
      return {
        backgroundColor: '#FF9800',
        icon: 'chatbox-outline',
        text: 'SMS'
      };
    default:
      return {
        backgroundColor: '#836EFE',
        icon: 'chatbubble-outline',
        text: 'Message'
      };
  }
};
const AnnonceCard = ({ item, darkMode, onPress, onDelete, userEmail, inDiscussion , onInitiateContact }) => {
  // Déterminer si l'utilisateur actuel est le propriétaire de l'annonce
  const isOwner = userEmail === item.email;
    const isInContact = item.contactStatus === 'in_contact';
const isUnavailable = item.contactStatus && ['reserved', 'sold'].includes(item.contactStatus);
   const cardStyle = {
    opacity: isInContact || isUnavailable ? 0.6 : 1.0,
    backgroundColor: darkMode ? '#363636' : '#F9F9F9'
  };
  const contactEmail = item.contactEmail || item.email || '';
  
    
    const getContactButtonInfo = () => {
    const method = item.preferredContact || 'email';
    switch(method) {
        case 'email':
            return {
                icon: 'mail-outline',
                text: 'Email',
                color: '#4285F4'
            };
        case 'phone':
            return {
                icon: 'call-outline', 
                text: 'Appeler',
                color: '#34A853'
            };
        case 'whatsapp':
            return {
                icon: 'logo-whatsapp',
                text: 'WhatsApp',
                color: '#25D366'
            };
        case 'sms':
            return {
                icon: 'chatbox-outline',
                text: 'SMS',
                color: '#FF9800'
            };
        case 'app':
        default:
            return {
                icon: 'chatbubble-outline',
                text: 'Message',
                color: '#836EFE'
            };
    }
};

    
   const handleContact = async () => {
    if (isOwner) return;
    
    const contactMethod = item.preferredContact || 'email';
    const contactInfo = contactMethod === 'email' 
        ? (item.contactEmail || item.email || '')
        : (item.contactPhone || '');
    
    if (!contactInfo) {
        Alert.alert('Erreur', 'Information de contact manquante');
        return;
    }
    
    try {
        // Exécuter l'action de contact selon la méthode
        switch(contactMethod) {
            case 'email':
                const emailSubject = `À propos de votre annonce: ${item.title}`;
                const emailBody = `Bonjour,\n\nJe suis intéressé(e) par votre annonce "${item.title}".\n\nCordialement.`;
                const emailUrl = `mailto:${contactInfo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
                
                const supported = await Linking.canOpenURL(emailUrl);
                if (supported) {
                    await Linking.openURL(emailUrl);
                    // Initier le contact en base de données après l'ouverture réussie
                    await onInitiateContact(item._id, userEmail, contactMethod);
                } else {
                    Alert.alert('Erreur', "Impossible d'ouvrir l'application email");
                }
                break;
                
            case 'phone':
                showPhoneOptions(item);
                break;
                
            case 'app':
            default:
                onPress();
                break;
        }
    } catch (error) {
        console.error('Erreur lors du contact:', error);
        Alert.alert('Erreur', 'Impossible d\'initier le contact');
    }
};

// Fonction pour afficher les options de contact téléphonique
const showPhoneOptions = (item) => {
    Alert.alert(
        'Contacter par téléphone',
        'Comment souhaitez-vous contacter cette personne?',
        [
            {
                text: 'Appeler',
                onPress: () => Linking.openURL(`tel:${item.contactPhone}`)
            },
            {
                text: 'SMS',
                onPress: () => {
                    const message = `Bonjour, je suis intéressé(e) par votre annonce "${item.title}".`;
                    Linking.openURL(`sms:${item.contactPhone}?body=${encodeURIComponent(message)}`);
                }
            },
            {
                text: 'WhatsApp',
                onPress: () => {
                    const message = `Bonjour, je suis intéressé(e) par votre annonce "${item.title}".`;
                    // Le numéro doit être au format international sans le + au début
                    const formattedNumber = item.contactPhone.startsWith('+') 
                        ? item.contactPhone.substring(1) 
                        : item.contactPhone;
                    Linking.openURL(`whatsapp://send?phone=${formattedNumber}&text=${encodeURIComponent(message)}`);
                }
            },
            { text: 'Annuler', style: 'cancel' }
        ]
    );
};
    
    const { icon, text, color } = getContactButtonInfo();
  
  return (
    
    <TouchableOpacity 
            style={[styles.announceCard, cardStyle]}
            onPress={onPress}
        >
            <View style={[styles.cardImageContainer, { backgroundColor: darkMode ? '#444444' : '#E0E0E0' }]}>
                {(item.imageUrl || (item.images && item.images.length > 0)) ? (
                    <Image 
                        source={{ uri: item.imageUrl || item.images[0] }} 
                        style={styles.cardImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.placeholderImageContainer}>
                        <Ionicons 
                            name="document-outline" 
                            size={30} 
                            color={darkMode ? '#666666' : '#CCCCCC'} 
                        />
                    </View>
                )}
                
                {/* Badge de statut */}
                <View style={[styles.statusBadge, getStatusBadgeStyle(item.contactStatus)]}>
                    <Text style={styles.statusBadgeText}>
                        {getStatusText(item.contactStatus)}
                    </Text>
                </View>
            </View>
            
            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: darkMode ? '#FFFFFF' : '#39335E' }]} numberOfLines={2}>
                    {item.title}
                </Text>
                <Text style={[styles.cardType, { color: darkMode ? '#AAAAAA' : '#666666' }]}>
                    {item.type}
                </Text>
                
                {/* Prix et durée */}
                {item.price && (
                    <Text style={[styles.cardPrice, { color: darkMode ? '#FFFFFF' : '#EB001B' }]}>
                        Prix: {item.price}€
                    </Text>
                )}
                
                {item.duration && (
                    <Text style={[styles.cardDuration, { color: darkMode ? '#AAAAAA' : '#666666' }]}>
                        Durée: {item.duration}
                    </Text>
                )}
                
                <View style={styles.cardFooter}>
                    <Text style={[styles.cardDate, { color: darkMode ? '#AAAAAA' : '#666666' }]}>
                        {formatDate(item.date)}
                    </Text>
                    
                    {/* Bouton de suppression pour le propriétaire */}
                    {isOwner && (
                        <TouchableOpacity 
                            style={styles.deleteButton} 
                            onPress={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                        >
                            <Ionicons name="trash-outline" size={14} color="white" />
                            <Text style={styles.deleteButtonText}>Effacer</Text>
                        </TouchableOpacity>
                    )}
                    
                    {/* Bouton de contact pour les non-propriétaires */}
                    {!isOwner && (
  <DynamicContactButton
    item={item}
    userEmail={userEmail}
    onInAppMessage={async () => {
      try {
        // Utiliser le service pour créer/récupérer la conversation
        const response = await createOrGetConversation(item.email, item._id || item.id);
        
        if (response.success) {
          // Rediriger directement vers la conversation dans Inbox
          router.push({
            pathname: '(tabs)/inbox',
            params: {
              openConversation: response.data._id,
              advertId: item._id || item.id,
              advertTitle: item.title
            }
          });
        }
      } catch (error) {
        console.error('Erreur:', error);
        // Fallback vers l'ancienne méthode
        router.push({
          pathname: '(screens)/chat_screen',
          params: {
            id: Date.now(),
            advertId: item.id,
            name: item.contactName || 'Propriétaire',
            receiverId: item.email
          }
        });
      }
    }}
    style={styles.contactButton}
  />
)}

                </View>
            </View>
        </TouchableOpacity>
    );
};
const getStatusBadgeStyle = (status) => {
  switch(status) {
    case 'in_contact':
      return { backgroundColor: '#FF9800' };
    case 'reserved':
      return { backgroundColor: '#9C27B0' };
    case 'sold':
      return { backgroundColor: '#F44336' };
    default:
      return { backgroundColor: '#4CAF50' };
  }
};

const getStatusText = (status) => {
  switch(status) {
    case 'in_contact':
      return 'En contact';
    case 'reserved':
      return 'Réservé';
    case 'sold':
      return 'Vendu';
    default:
      return 'Disponible';
  }
};






// Optimisations avec memo
const MemoizedAnnonceCard = React.memo(AnnonceCard);
const MemoizedCategoryButton = React.memo(CategoryButton);

// Helper functions
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

const getCategoryColor = (category) => {
  switch(category) {
    case 'Donner': return '#4CAF50';
    case 'Prêter': return '#2196F3';
    case 'Emprunter': return '#FF9800';
    case 'Louer': return '#9C27B0';
    case 'Acheter': return '#F44336';
    case 'Échanger': return '#009688';
    default: return '#39335E';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const today = new Date();
    // Gestion des différents formats de date possibles
    let date;
    
    if (dateString.includes('/')) {
      // Format "DD/MM/YYYY"
      const parts = dateString.split('/');
      if (parts.length === 3) {
        date = new Date(parts[2], parts[1] - 1, parts[0]);
      } else {
        return dateString; // Format non reconnu, retourner tel quel
      }
    } else {
      // Essayer comme ISO ou autre format standard
      date = new Date(dateString);
    }
    
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      return dateString; // Date invalide, retourner telle quelle
    }
    
    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    }
    
    // Check if it's yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Hier";
    }
    
    // Otherwise return the original format or a formatted date
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  } catch (error) {
    console.error('Erreur de formatage de la date:', error);
    return dateString; // En cas d'erreur, retourner la chaîne d'origine
  }
};

// Main component
const Annonces = () => {
  const { theme, darkMode } = useContext(ThemeContext);
  // Utiliser les fonctions du contexte
  const { 
    annonces, 
    loading: contextLoading, 
    refreshAnnonces, 
    cleanOldAnnonces,
    updateNewStatus,
    deleteAnnonceMeth
  } = useContext(AnnonceContext);

  
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [userEmail, setUserEmail] = useState('');
  
  // Load fonts
  const [fontsLoaded] = useFonts({
    Montserrat_700Bold,
    Montserrat_600SemiBold,
    Montserrat_500Medium,
  });

  useEffect(() => {
  const loadUserEmail = async () => {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      console.log("Email chargé depuis AsyncStorage:", email);
      if (email) {
        setUserEmail(email);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'email:', error);
    }
  };
  
  loadUserEmail();
}, []);
  
  // Récupérer l'historique de recherche depuis AsyncStorage au chargement
  useEffect(() => {
    const loadSearchHistory = async () => {
      try {
        const history = await AsyncStorage.getItem('searchHistory');
        if (history) {
          setSearchHistory(JSON.parse(history));
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'historique de recherche:', error);
      }
    };
    
    loadSearchHistory();
  }, []);

  const handleInitiateContact = useCallback(async (postId, buyerEmail, contactMethod) => {
  try {
    const response = await fetch('/api/contacts/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId,
        buyerEmail,
        contactMethod
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      // Rafraîchir la liste des annonces
      await refreshAnnonces();
      Toast.show({
        type: 'success',
        text1: 'Contact initié',
        text2: 'Vous pouvez maintenant contacter le vendeur'
      });
    }
    
    return result;
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
}, [refreshAnnonces]); 


  // Fonction pour sauvegarder une recherche dans l'historique
  const saveSearchToHistory = async (term) => {
    if (!term.trim()) return;
    
    try {
      // Limiter l'historique à 10 éléments et éviter les doublons
      const newHistory = [
        term, 
        ...searchHistory.filter(item => item !== term)
      ].slice(0, 10);
      
      setSearchHistory(newHistory);
      await AsyncStorage.setItem('searchHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'historique:', error);
    }
  };

  // Fonction de recherche debounce pour améliorer les performances
  const debouncedSearch = useCallback(
    debounce((term) => {
      setDebouncedSearchTerm(term);
      setIsSearching(false);
      if (term.trim()) {
        saveSearchToHistory(term);
      }
    }, 500),
    [searchHistory]
  );

  // Mettre à jour la recherche lorsque le terme change
  useEffect(() => {
    if (searchQuery !== debouncedSearchTerm) {
      setIsSearching(true);
      debouncedSearch(searchQuery);
    }
    
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  // Afficher un message toast quand aucun résultat n'est trouvé
  useEffect(() => {
    if (debouncedSearchTerm && filteredAnnonces.length === 0 && !loading) {
      Toast.show({
        type: 'info',
        text1: 'Aucune annonce trouvée',
        text2: 'Essayez avec d\'autres mots-clés',
        position: 'bottom',
        visibilityTime: 2000,
      });
    }
  }, [debouncedSearchTerm, filteredAnnonces, loading]);

  // Fonction pour effacer la recherche
  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedSearchTerm('');
    setShowSuggestions(false);
  };

  // Fonction pour sélectionner une suggestion
  const selectSuggestion = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setDebouncedSearchTerm(suggestion);
    saveSearchToHistory(suggestion);
  };

  // Fonction pour gérer le focus de la barre de recherche
  const handleSearchFocus = () => {
    if (searchHistory.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Fonction pour supprimer un élément de l'historique
  const removeFromHistory = async (term) => {
    const newHistory = searchHistory.filter(item => item !== term);
    setSearchHistory(newHistory);
    await AsyncStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  // Fonction pour effacer tout l'historique
  const clearHistory = async () => {
    setSearchHistory([]);
    await AsyncStorage.removeItem('searchHistory');
    setShowSuggestions(false);
  };
  
  // Catégories de filtrage
  const categories = [
    { id: '0', name: 'Tous' },
    { id: '1', name: 'Donner', icon: 'gift-outline' },
    { id: '2', name: 'Prêter', icon: 'swap-horizontal-outline' },
    { id: '3', name: 'Emprunter', icon: 'hand-left-outline' },
    { id: '4', name: 'Louer', icon: 'cash-outline' },
    { id: '5', name: 'Acheter', icon: 'cart-outline' },
    { id: '6', name: 'Échanger', icon: 'repeat-outline' }
  ];
  
  // États
  const [activeFilter, setActiveFilter] = useState('0');
  // const [page, setPage] = useState(1);
  // const [hasMore, setHasMore] = useState(true);
  
  // Initialisation et nettoyage
  useEffect(() => {
    // Nettoyer les anciennes annonces et mettre à jour le statut "nouveau"
    const initializeData = async () => {
      try {
        setLoading(true);
        // Mettre à jour le statut "nouveau" des annonces
        await updateNewStatus();
        
        // Nettoyer les anciennes annonces (plus de 30 jours)


        // const deletedCount = await cleanOldAnnonces(30);
        // if (deletedCount > 0) {
        //   console.log(`${deletedCount} anciennes annonces supprimées`);
        // }
        setLoading(false);
      } catch (error) {
        console.error('Erreur d\'initialisation:', error);
        setLoading(false);
      }
    };
    
    initializeData();
  }, []);
  
  // Fonction pour rafraîchir les données
   const fetchAnnonces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Utiliser la fonction de rafraîchissement du contexte
      const success = await refreshAnnonces();
      
      if (!success) {
        setError('Impossible de charger les annonces. Veuillez réessayer.');
      }
      
    } catch (err) {
      console.error('Erreur lors du chargement des annonces:', err);
      setError('Impossible de charger les annonces. Veuillez réessayer.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshAnnonces]);

  // Load data on component mount
  useEffect(() => {
    fetchAnnonces();
  }, []);
  
  // Reload data when focused (coming back to this screen)
  useFocusEffect(
    useCallback(() => {
      // Vérifier les mises à jour et statuts "nouveau"
      updateNewStatus();
      
      return () => {
        // Clean up if needed
      };
    }, [])
  );
  
  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAnnonces();
  }, [fetchAnnonces]);
  
  // Load more handler for pagination

  // const handleLoadMore = () => {
  //   if (!loading && hasMore) {
  //     fetchAnnonces();
  //   }
  // };

  
  // Fonction pour confirmer et gérer la suppression
  const handleDeleteAnnonce = useCallback((id) => {
  Alert.alert(
    "Confirmation de suppression",
    "Êtes-vous sûr de vouloir supprimer cette annonce ?",
    [
      {
        text: "Annuler",
        style: "cancel"
      },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            console.log("Frontend - Deleting ID:", id);
            
            const result = await deleteAnnonceMeth(id, userEmail);
            
            if (result.success) {
              Toast.show({
                type: 'success',
                text1: result.message || 'Annonce supprimée avec succès',
                visibilityTime: 3000,
              });
            } else {
              Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: result.message || 'Impossible de supprimer cette annonce',
                visibilityTime: 3000,
              });
            }
          } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            Toast.show({
              type: 'error',
              text1: 'Erreur',
              text2: 'Une erreur inattendue s\'est produite',
              visibilityTime: 3000,
            });
          } finally {
            setLoading(false);
          }
        }
      }
    ]
  );
}, [deleteAnnonceMeth, userEmail]);
  
  // Filter annonces based on category and search
  const filteredAnnonces = useMemo(() => {
  if (!annonces || !Array.isArray(annonces)) {
    console.log("Aucune annonce à filtrer ou format invalide");
    return [];
  }
    
    return annonces.filter(item => {
      // Vérifier que item est un objet valide
       if (!item) {
      console.log("Élément d'annonce invalide détecté");
      return false;
    }
    if (annonces.indexOf(item) < 3) {
      console.log("Exemple d'annonce:", JSON.stringify(item, null, 2));
    }
      
      const matchesCategory = activeFilter === '0' || 
        item.category === categories.find(cat => cat.id === activeFilter)?.name;
      
      // Recherche améliorée: recherche dans titre, type, description et catégorie
      const searchTerm = debouncedSearchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        (item.title && item.title.toLowerCase().includes(searchTerm)) || 
        (item.type && item.type.toLowerCase().includes(searchTerm)) ||
        (item.category && item.category.toLowerCase().includes(searchTerm)) ||
        (item.description && item.description.toLowerCase().includes(searchTerm));
      
      return matchesCategory && matchesSearch;
    });
  }, [annonces, activeFilter, debouncedSearchTerm, categories]);
  
  // Optimiser les fonctions de rendu pour la FlatList
  const keyExtractor = useCallback((item) => item.id?.toString() || Math.random().toString(), []);
  
 const renderItem = useCallback(({ item }) => {
  console.log("=== DEBUG ANNONCE ===");
  console.log("ID annonce:", item._id || item.id);
  console.log("Email annonce:", item.email);
  console.log("Email utilisateur:", userEmail);
  console.log("===================");
  return (
    <MemoizedAnnonceCard 
      item={item}
      darkMode={darkMode}
      userEmail={userEmail}
      inDiscussion={item.inDiscussion}
      onInitiateContact={handleInitiateContact}
      onPress={() => {
        const annonceId = item._id || item.id;
        console.log("Navigation vers annonce avec ID:", annonceId);
        AsyncStorage.setItem('currentAnnonceId', annonceId.toString())
          .then(() => router.push(`/annonce/${annonceId}`))
          .catch(err => console.error("Error storing ID:", err));
      }}
      onDelete={() => handleDeleteAnnonce(item._id || item.id)}
    />
  );
}, [darkMode, handleDeleteAnnonce, userEmail, handleInitiateContact]);
  
  // Navigation
  const back = () => {
    router.push('/home');  // Navigation vers la page d'accueil
  };
  
  // Show loading indicator when fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={[styles.loadingContainer, {backgroundColor: theme.background}]}>
        <ActivityIndicator size="large" color="#39335E" />
      </View>
    );
  }
  
  return (
    <SafeAreaView style={[styles.safeArea, {backgroundColor: theme.background}]}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <View style={[styles.container, {backgroundColor: theme.background}]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={back}
            accessible={true}
            accessibilityLabel="Retour"
            accessibilityHint="Retourner à l'écran précédent"
            accessibilityRole="button"
          >
            {darkMode ? <Dark_back /> : <Back />}
          </TouchableOpacity>
          <Text style={[styles.heading, {color:theme.color}]}>Annonces</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>
        
        {/* Barre de recherche améliorée */}
        <View style={styles.searchContainer}>
          <View style={[styles.input_container, {backgroundColor:theme.cardbg2}]}>
            <View style={styles.searchIconContainer}>
              <Search width={20} height={20} />
            </View>
            
            <TextInput
              style={[styles.searchInput, {color: theme.color}]}
              placeholder="Rechercher une annonce..."
              placeholderTextColor="#A8A8A8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={handleSearchFocus}
              accessible={true}
              accessibilityRole="search"
            />
            
            {isSearching ? (
              <ActivityIndicator size="small" color="#A8A8A8" style={styles.searchingIndicator} />
            ) : searchQuery ? (
              <TouchableOpacity 
                onPress={clearSearch}
                style={styles.clearButton}
                accessible={true}
                accessibilityLabel="Effacer la recherche"
              >
                <Ionicons name="close-circle" size={20} color="#A8A8A8" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                onPress={() => setActiveFilter('0')}
                style={styles.filterButton}
                accessible={true}
                accessibilityLabel="Filtrer les annonces"
              >
                <Filter width={20} height={20} />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Suggestions de recherche */}
          {showSuggestions && searchHistory.length > 0 && (
            <View style={[styles.suggestionsContainer, {backgroundColor: theme.cardbg2}]}>
              <View style={styles.suggestionsHeader}>
                <Text style={[styles.suggestionsTitle, {color: theme.color}]}>Recherches récentes</Text>
                <TouchableOpacity onPress={clearHistory}>
                  <Text style={styles.clearHistoryText}>Effacer tout</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.suggestionsList} nestedScrollEnabled={true}>
                {searchHistory.map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.suggestionItem}
                    onPress={() => selectSuggestion(item)}
                  >
                    <View style={styles.suggestionContent}>
                      <Ionicons name="time-outline" size={16} color="#A8A8A8" />
                      <Text style={[styles.suggestionText, {color: theme.color}]} numberOfLines={1}>
                        {item}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => removeFromHistory(item)}
                      style={styles.removeHistoryItem}
                    >
                      <Ionicons name="close" size={16} color="#A8A8A8" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
        
        {/* Bouton Publier une annonce */}
        <TouchableOpacity 
          style={styles.publishButton} 
          onPress={() => router.push('(screens)/publier-annonce')}
          accessible={true}
          accessibilityLabel="Publier une annonce"
          accessibilityHint="Appuyez pour créer une nouvelle annonce"
          accessibilityRole="button"
        >
          <Ionicons name="add-circle" size={24} color="white" />
          <Text style={styles.publishButtonText}>Publier une annonce</Text>
        </TouchableOpacity>
        
        {/* Filtres par catégorie */}
        <View style={styles.categoriesSection}>
          <Text style={[styles.sectionTitle, {color: theme.color}]}>Catégories</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContentContainer}
          >
            {categories.map(category => (
              <MemoizedCategoryButton 
                key={category.id}
                category={category}
                isActive={activeFilter === category.id}
                darkMode={darkMode}
                onPress={() => setActiveFilter(category.id)}
              />
            ))}
          </ScrollView>
        </View>
        
        {/* Liste des annonces */}
        <View style={styles.resultsContainer}>
          <Text style={[styles.resultsTitle, {color: theme.color}]}>
            {filteredAnnonces.length} annonce{filteredAnnonces.length !== 1 ? 's' : ''} trouvée{filteredAnnonces.length !== 1 ? 's' : ''}
          </Text>
          
          {/* Error message if any */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => fetchAnnonces(true)}
              >
                <Text style={styles.retryButtonText}>Réessayer</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Empty state */}
          {!error && filteredAnnonces.length === 0 && !loading && (
            <View style={styles.emptyContainer}>
              <Ionicons 
                name="search-outline" 
                size={50} 
                color={darkMode ? '#666666' : '#CCCCCC'} 
              />
              <Text style={[styles.emptyText, {color: theme.color}]}>
                Aucune annonce trouvée
              </Text>
              <Text style={styles.emptySubtext}>
                Essayez de modifier vos filtres ou publiez une annonce
              </Text>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={() => router.push('(screens)/publier-annonce')}
              >
                <Text style={styles.createButtonText}>Créer une annonce</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Annonces list */}
           <FlatList
  data={filteredAnnonces}
  keyExtractor={keyExtractor}
  renderItem={renderItem}
  showsVerticalScrollIndicator={false}
  contentContainerStyle={styles.announcesListContainer}
  
  // Optimisations de performance
  initialNumToRender={10}        // Nombre d'éléments à rendre initialement
  maxToRenderPerBatch={10}       // Nombre d'éléments à rendre par lot
  windowSize={21}                // Taille de la fenêtre de rendu (défaut: 21, soit 10 écrans au-dessus/en-dessous)
  removeClippedSubviews={true}   // Retire les éléments non visibles du DOM natif
  
  refreshControl={
    <RefreshControl 
      refreshing={refreshing} 
      onRefresh={onRefresh}
      colors={['#39335E', '#EB001B']}
      tintColor={darkMode ? '#FFFFFF' : '#39335E'}
    />
  }
  ListFooterComponent={
    loading && !refreshing ? (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#39335E" />
      </View>
    ) : null
  }
/>
        </View>
        
        {/* Bouton s'abonner aux notifications - Fixed at bottom */}
        {/* {filteredAnnonces.length > 0 && (
          <View style={styles.subscribeButtonContainer}>
            <TouchableOpacity 
              style={styles.subscribeButton}
              onPress={() => router.push('(screens)/#')} 
              accessible={true}
              accessibilityLabel="S'abonner aux nouvelles annonces"
              accessibilityHint="Appuyez pour vous abonner aux notifications"
              accessibilityRole="button"
            >
              <Ionicons name="notifications-outline" size={20} color="white" />
              <Text style={styles.subscribeButtonText}>S'abonner aux nouvelles annonces</Text>
            </TouchableOpacity>
          </View>
        )} */}
      </View>
    </SafeAreaView>
  );
};

export default Annonces;
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 50 : 10,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  headerRightPlaceholder: {
    width: 24, // Balances the back button on the left
  },
  heading: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: 'Montserrat_700Bold',
  },
  // Nouvelle section pour la barre de recherche améliorée
  searchContainer: {
    position: 'relative',
    zIndex: 10,
    marginBottom: 15,
  },
  input_container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  searchIconContainer: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
    includeFontPadding: false,
  },
  clearButton: {
    marginLeft: 10,
    padding: 4,
  },
  filterButton: {
    marginLeft: 10,
    padding: 4,
  },
  searchingIndicator: {
    marginHorizontal: 10,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    borderRadius: 10,
    padding: 10,
    maxHeight: 200,
    zIndex: 100,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  suggestionsTitle: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14,
  },
  clearHistoryText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 12,
    color: '#5D5FEF',
  },
  suggestionsList: {
    maxHeight: 150,
  },
   suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  suggestionText: {
    marginLeft: 10,
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
    flex: 1,
  },
  removeHistoryItem: {
    padding: 5,
  },
  search: {
    position: 'absolute',
    left: 15,
    bottom: 20,
  },
  filter: {
    position: 'absolute',
    bottom: 20,
    right: 10,
  },
  placeholder: {
    marginLeft: 40,
    color: '#A8A8A8',
  },
  publishButton: {
    backgroundColor: '#EB001B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  publishButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 16,
    marginLeft: 10,
  },
  categoriesSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 10,
  },
  categoriesContainer: {
    flexDirection: 'row',
  },
  categoriesContentContainer: {
    paddingRight: 20, // Extra space at the end of the scroll
  },
  categoryButton: {
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    minWidth: width < 380 ? 90 : 100,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeCategoryButton: {
    backgroundColor: '#39335E',
  },
  categoryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14,
    flex: 1,
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 15,
  },
  announcesListContainer: {
    paddingBottom: 80, // Space for the fixed subscribe button
  },
  announceCard: {
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardImageContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadgeContainer: {
    position: 'absolute',
    top: 5,
    left: 5,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryBadge: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Montserrat_600SemiBold',
  },
  cardContent: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 5,
  },
  cardType: {
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  cardDate: {
    fontSize: 11,
    fontFamily: 'Montserrat_500Medium',
  },
  newBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Montserrat_600SemiBold',
  },
  subscribeButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  subscribeButton: {
    backgroundColor: '#39335E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14,
    marginLeft: 10,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#EB001B',
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'Montserrat_500Medium',
  },
  retryButton: {
    backgroundColor: '#39335E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontFamily: 'Montserrat_600SemiBold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtext: {
    color: '#A8A8A8',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Montserrat_500Medium',
  },
  createButton: {
    backgroundColor: '#EB001B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontFamily: 'Montserrat_600SemiBold',
  },
  cardActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  contactButton: {
    backgroundColor: '#836EFE',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  contactButtonText: {
    color: '#FFF',
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: '#EB001B',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
    marginLeft: 4,
  },
cardPrice: {
  fontFamily: 'Montserrat_600SemiBold',
  fontSize: 14,
  marginTop: 5,
  marginBottom: 2,
},
cardDuration: {
  fontFamily: 'Montserrat_500Medium',
  fontSize: 13,
  marginBottom: 5,
},
statusBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Montserrat_600SemiBold',
  },
  contactButtonDisabled: {
    opacity: 0.7,
  },
  contactSection: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
  },
  
  contactText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  
  mainContactButton: {
    marginTop: 15,
    paddingVertical: 12,
  },
});