import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Dimensions, Alert } from 'react-native';
import React, { useContext, useState, useEffect, useMemo } from 'react';
import Notification from "../../assets/images/notification.svg";
import Dark_Notification from "../../assets/images/dark_notification.svg";
import { router } from "expo-router";
import ThemeContext from '../../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import AnnonceContext from '../../contexts/AnnonceContext';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import DynamicContactButton from '../../components/DynamicContactButton/DynamicContactButton';
import { createConversationFromAd, deleteAnnonceMeth } from '../../services/api';
import { findOrCreateConversation, createConversationFromAdApi } from '../../services/api';

const Home = () => {
    const { theme, darkMode, profileData, refreshUserData } = useContext(ThemeContext);
    const { annonces, loading, refreshAnnonces, updateNewStatus } = useContext(AnnonceContext);
    
    const [selectedCategory, setSelectedCategory] = useState('Tous');
    const [selectedType, setSelectedType] = useState('Tous');
    const [selectedCamp, setSelectedCamp] = useState('Tous');
    const [selectedSize, setSelectedSize] = useState('Tous');
    const [creatingConversation, setCreatingConversation] = useState(false);
    
    const profileImage = useMemo(() => {
        if (profileData && profileData.profileImage) {
            let imageUrl = profileData.profileImage;
            
            if (!imageUrl.startsWith('http')) {
                imageUrl = `http://192.168.1.21:3001/uploads/${imageUrl}`;
            }
            
            console.log('Profile image URL:', imageUrl);
            return { uri: imageUrl };
        }
        return require('../../assets/images/placeholder.png');
    }, [profileData]);

    const fullName = profileData && profileData.fullName 
        ? profileData.fullName 
        : '';
      
    const recentAnnounces = useMemo(() => {
        let filteredAnnonces = [...annonces];

        if (selectedCategory !== 'Tous') {
            filteredAnnonces = filteredAnnonces.filter(annonce => annonce.category === selectedCategory);
        }
        
        if (selectedType !== 'Tous') {
            filteredAnnonces = filteredAnnonces.filter(annonce => annonce.type === selectedType);
        }
        
        if (selectedCamp !== 'Tous') {
            filteredAnnonces = filteredAnnonces.filter(annonce => 
                annonce.campType === selectedCamp || annonce.camp === selectedCamp
            );
        }
        
        if (selectedSize !== 'Tous') {
            filteredAnnonces = filteredAnnonces.filter(annonce => annonce.size === selectedSize);
        }
        
        return filteredAnnonces;
    }, [annonces, selectedCategory, selectedType, selectedCamp, selectedSize]);

    const [subscribed, setSubscribed] = useState(false);

    useEffect(() => {
        refreshAnnonces();
        updateNewStatus();
        
        const refreshData = async () => {
            try {
                await refreshUserData();
            } catch (error) {
                console.error('Erreur lors du rafraîchissement des données utilisateur:', error);
            }
        };
        
        refreshData();
    }, []);

   const handleContactViaApp = async item => {
  try {
    setCreatingConversation(true);
    
    // Ajoutez ces logs pour diagnostiquer
    console.log('=== DIAGNOSTIC CONTACT ===');
    console.log('Item complet:', JSON.stringify(item, null, 2));
    console.log('publisherInfo:', item.publisherInfo);
    console.log('receiverId:', item.publisherInfo?._id);
    console.log('advertId:', item.id || item._id);
    console.log('profileData:', profileData);
    
    // Vérifiez que les données nécessaires existent
    if (!item.publisherInfo?._id) {
      throw new Error('Informations du propriétaire manquantes');
    }
    
    if (!item.id && !item._id) {
      throw new Error('ID de l\'annonce manquant');
    }
    
    const conv = await findOrCreateConversation(
      item.publisherInfo._id,
      item.id || item._id
    );
    
    router.push({
      pathname: '(screens)/chat_screen',
      params: {
        conversationId: conv._id,
        participantId: item.publisherInfo._id,
        participantName: item.publisherInfo.fullName,
      },
    });
  } catch (err) {
    console.error('findOrCreateConversation error:', err);
    Alert.alert('Erreur', err.message);
  } finally {
    setCreatingConversation(false);
  }
};

const handleNewConversation = async item => {
  try {
    const { conversation } = await createConversationFromAdApi(
      item.id || item._id,
      item.publisherInfo._id,
      `Bonjour, je suis intéressé(e) par votre annonce "${item.title}".`
    );
    // redirection identique…
  } catch (err) {
    console.error('createConversationFromAdApi error:', err);
    Alert.alert('Erreur', err.message);
  }
};
    const navigateToAnnonceDetail = (id) => {
        AsyncStorage.setItem('currentAnnonceId', id.toString())
            .then(() => {
                console.log("Navigating to annonce with ID:", id);
                router.push(`/annonce/${id}`);
            })
            .catch(err => console.error("Error storing ID:", err));
    };

    const getContactButtonInfo = (contactMethod) => {
        switch(contactMethod) {
            case 'email':
                return {
                    icon: 'mail-outline',
                    text: 'Email',
                    color: '#4285F4'
                };
            case 'phone':
                return {
                    icon: 'call-outline',
                    text: 'Téléphone',
                    color: '#34A853'
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

    const createConversationFromAdLocal = async (item, initialMessage) => {
        try {
            const response = await createConversationFromAd(
                item.id || item._id, 
                item.publisherInfo?._id, 
                initialMessage
            );
            
            if (response.success) {
                return response.conversation;
            }
            throw new Error('Échec de la création de la conversation');
        } catch (error) {
            console.error('Erreur lors de la création de la conversation:', error);
            throw error;
        }
    };

    const handleContact = async (item) => {
        const contactMethod = item.preferredContact || 'app';
        
        if (contactMethod === 'app') {
            try {
                const conversation = await createConversationFromAdLocal(
                    item, 
                    `Bonjour, je suis intéressé(e) par votre annonce "${item.title}".`
                );
                
                router.push({
                    pathname: '(screens)/chat_screen',
                    params: {
                        conversationId: conversation._id,
                        participantId: item.publisherInfo?._id,
                        participantName: item.publisherInfo?.fullName,
                        participantEmail: item.publisherInfo?.email,
                        participantPhone: item.publisherInfo?.phone
                    }
                });
            } catch (error) {
                console.error('Erreur lors de la création de la conversation:', error);
                Alert.alert('Erreur', 'Impossible de démarrer la conversation');
            }
        } else {
            switch(contactMethod) {
                case 'email':
                    const emailUrl = `mailto:${item.publisherInfo?.email}?subject=Intéressé par "${item.title}"`;
                    try {
                        await Linking.openURL(emailUrl);
                    } catch (error) {
                        Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application email');
                    }
                    break;
                case 'phone':
                    try {
                        await Linking.openURL(`tel:${item.publisherInfo?.phone}`);
                    } catch (error) {
                        Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application téléphone');
                    }
                    break;
            }
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
            let date;
            
            if (typeof dateString === 'string' && dateString.includes('/')) {
                const parts = dateString.split('/');
                if (parts.length === 3) {
                    date = new Date(parts[2], parts[1] - 1, parts[0]);
                } else {
                    return dateString;
                }
            } else {
                date = new Date(dateString);
            }
            
            if (isNaN(date.getTime())) {
                return dateString;
            }
            
            if (date.toDateString() === today.toDateString()) {
                return "Aujourd'hui";
            }
            
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            if (date.toDateString() === yesterday.toDateString()) {
                return "Hier";
            }
            
            return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        } catch (error) {
            console.error('Erreur de formatage de la date:', error);
            return dateString;
        }
    };

    const categories = [
        { id: '0', name: 'Tous', icon: 'list-outline' },
        { id: '1', name: 'Donner', icon: 'gift-outline' },
        { id: '2', name: 'Prêter', icon: 'swap-horizontal-outline' },
        { id: '3', name: 'Emprunter', icon: 'hand-left-outline' },
        { id: '4', name: 'Louer', icon: 'cash-outline' },
        { id: '5', name: 'Acheter', icon: 'cart-outline' },
        { id: '6', name: 'Échanger', icon: 'repeat-outline' }
    ];

    const types = ['Tous',"Vêtement hiver", "Équipement ski", "Équipement neige", "Chaussures", "Décoration", "Outil", "Tente", "Autre"];
    const campTypes = ['Tous', 'Camp De Ski', 'Camp Vert'];
    
    const getContactIcon = (contactMethod) => {
        switch(contactMethod) {
            case 'email': return 'mail';
            case 'phone': return 'call';
            case 'app': 
            default: return 'chatbubble';
        }
    };

    return (
        <View style={[styles.container, {backgroundColor: theme.background}]}> 
            <StatusBar translucent backgroundColor="transparent" barStyle={darkMode ? "light-content" : 'dark-content'} />

            <View style={styles.header}>
                <View style={styles.header_left}>
                    <Image source={profileImage} style={styles.profile} />
                    <View style={styles.content}>
                        <Text style={styles.heading_text}>Bienvenue à l'école de La Brillaz! 👋🏻</Text>
                        <Text style={[styles.heading, {color: theme.color}]}>{fullName}</Text>
                    </View>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.bourseHeader}>
                    <Text style={styles.bourseTitle}>Bourse au prêt</Text>
                    <Text style={styles.bourseSubtitle}>Échangez, prêtez, donnez pour les camps de ski et camps verts</Text>
                </View>

                <TouchableOpacity style={styles.publishButton} onPress={() => {router.push('(screens)/publier-annonce')}}>
                    <Ionicons name="add-circle" size={24} color="white" />
                    <Text style={styles.publishButtonText}>Publier une annonce</Text>
                </TouchableOpacity>

                <Text style={[styles.sectionTitle, {color: theme.color}]}>Catégories</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
                    {categories.map(category => (
                        <TouchableOpacity 
                            key={category.id}
                            style={[
                                styles.categoryButton, 
                                { 
                                    backgroundColor: selectedCategory === category.name 
                                        ? getCategoryColor(category.name) 
                                        : darkMode ? '#363636' : '#F0F0F0' 
                                }
                            ]}
                            onPress={() => setSelectedCategory(category.name)}
                        >
                            <View style={[
                                styles.categoryIconContainer, 
                                { 
                                    backgroundColor: selectedCategory === category.name 
                                        ? 'rgba(255, 255, 255, 0.2)' 
                                        : darkMode ? '#5D5FEF' : '#E6E6FA' 
                                }
                            ]}> 
                                <Ionicons 
                                    name={category.icon} 
                                    size={20} 
                                    color={selectedCategory === category.name 
                                        ? '#FFFFFF' 
                                        : darkMode ? '#FFFFFF' : '#5D5FEF'
                                    } 
                                />
                            </View>
                            <Text style={[
                                styles.categoryText, 
                                {
                                    color: selectedCategory === category.name 
                                        ? '#FFFFFF' 
                                        : darkMode ? '#FFFFFF' : '#39335E'
                                }
                            ]}>
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Text style={[styles.sectionTitle, {color: theme.color, marginTop: 15}]}>Filtres</Text>
                <View style={styles.filterSection}>
                    <Text style={styles.filterLabel}>Type d'objet:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.filterButtonsContainer}>
                            {types.map(type => (
                                <TouchableOpacity 
                                    key={type} 
                                    style={[
                                        styles.filterButton, 
                                        selectedType === type ? { backgroundColor: '#39335E' } : null
                                    ]}
                                    onPress={() => setSelectedType(type)}
                                >
                                    <Text style={[
                                        styles.filterButtonText, 
                                        selectedType === type ? { color: '#FFFFFF' } : null
                                    ]}>
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                    
                    <Text style={styles.filterLabel}>Type de camp:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.filterButtonsContainer}>
                            {campTypes.map(camp => (
                                <TouchableOpacity 
                                    key={camp} 
                                    style={[
                                        styles.filterButton, 
                                        selectedCamp === camp ? { backgroundColor: '#39335E' } : null
                                    ]}
                                    onPress={() => setSelectedCamp(camp)}
                                >
                                    <Text style={[
                                        styles.filterButtonText, 
                                        selectedCamp === camp ? { color: '#FFFFFF' } : null
                                    ]}>
                                        {camp}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                <View style={styles.recentSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, {color: theme.color}]}>
                            {selectedCategory === 'Tous' ? 'Annonces récentes' : `Annonces - ${selectedCategory}`}
                        </Text>
                        <TouchableOpacity onPress={() => {router.push('(tabs)/Annonces')}}>
                            <Text style={styles.seeAllText}>Voir tout</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#39335E" />
                        </View>
                    ) : recentAnnounces.length > 0 ? (
                        <>
                            {recentAnnounces.map(item => (
                                <TouchableOpacity 
                                    key={item.id} 
                                    style={[styles.announceCard, { backgroundColor: darkMode ? '#363636' : '#F9F9F9' }]}
                                    onPress={() => navigateToAnnonceDetail(item.id || item._id)}
                                >
                                    <View style={styles.cardImageWrapper}>
                                        <Image
                                            source={
                                                (item.imageUrl || (item.images && item.images.length > 0)) 
                                                    ? { uri: item.imageUrl || item.images[0] } 
                                                    : require('../../assets/images/placeholder.png') 
                                            }
                                            style={styles.cardImage}
                                            resizeMode="cover"
                                        />
                                        <View style={[
                                            styles.categoryBadgeWrapper, 
                                            {backgroundColor: getCategoryColor(item.category)}
                                        ]}>
                                            <Text style={styles.categoryBadge}>{item.category}</Text>
                                        </View>
                                        
                                        {item.size && (
                                            <View style={styles.sizeBadgeWrapper}>
                                                <Text style={styles.sizeBadge}>{item.size}</Text>
                                            </View>
                                        )}
                                        
                                        {item.campType && (
                                            <View style={[styles.campBadgeWrapper, {backgroundColor: item.campType.includes('ski') ? '#1565C0' : '#2E7D32'}]}>
                                                <Text style={styles.campBadge}>{item.campType}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.cardContent}>
                                        <Text style={[styles.cardTitle, { color: darkMode ? '#FFFFFF' : '#39335E' }]} numberOfLines={2}>{item.title}</Text>
                                        <Text style={[styles.cardType, { color: darkMode ? '#B0B0B0' : '#727272' }]}>{item.type}</Text>
                                        <Text style={[styles.cardDate, { color: darkMode ? '#808080' : '#9B9B9B' }]}>{formatDate(item.date)}</Text>
                                        
                                        {/* Section des boutons corrigée */}
                                        {profileData.email === item.publisherInfo?.email ? (
                                            // Bouton Supprimer
                                            <TouchableOpacity
                                                style={styles.deleteButton}
                                                onPress={() => {
                                                    Alert.alert(
                                                        "Supprimer cette annonce ?",
                                                        "Voulez-vous vraiment la supprimer ?",
                                                        [
                                                            { text: "Annuler", style: "cancel" },
                                                            {
                                                                text: "Supprimer",
                                                                style: "destructive",
                                                                onPress: async () => {
                                                                    setCreatingConversation(true);
                                                                    try {
                                                                        const result = await deleteAnnonceMeth(
                                                                            item._id || item.id,
                                                                            profileData.email
                                                                        );
                                                                        if (result.success) {
                                                                            Toast.show({ type: 'success', text1: 'Annonce supprimée' });
                                                                            refreshAnnonces();
                                                                        } else {
                                                                            Toast.show({ type: 'error', text1: result.message });
                                                                        }
                                                                    } catch {
                                                                        Toast.show({ type: 'error', text1: 'Erreur lors de la suppression' });
                                                                    } finally {
                                                                        setCreatingConversation(false);
                                                                    }
                                                                }
                                                            }
                                                        ]
                                                    );
                                                }}
                                            >
                                                <Ionicons name="trash-outline" size={16} color="white" />
                                                <Text style={styles.deleteButtonText}>Effacer</Text>
                                            </TouchableOpacity>
                                        ) : (
                                            // Bouton Contacter
                                            item.preferredContact === 'app' ? (
                                                <TouchableOpacity
                                                    style={styles.contactButton}
                                                    onPress={() => handleContactViaApp(item)}
                                                    disabled={creatingConversation}
                                                >
                                                    <Ionicons
                                                        name="chatbubble-outline"
                                                        size={14}
                                                        color="white"
                                                        style={{ marginRight: 4 }}
                                                    />
                                                    <Text style={styles.contactButtonText}>
                                                        {creatingConversation ? '…' : 'Message'}
                                                    </Text>
                                                </TouchableOpacity>
                                            ) : (
                                                <TouchableOpacity
                                                    style={styles.contactButton}
                                                    onPress={() => handleContact(item)}
                                                >
                                                    <Ionicons
                                                        name={getContactIcon(item.preferredContact)}
                                                        size={14}
                                                        color="white"
                                                        style={{ marginRight: 4 }}
                                                    />
                                                    <Text style={styles.contactButtonText}>
                                                        {item.preferredContact === 'phone' ? 'Appeler' : 'Email'}
                                                    </Text>
                                                </TouchableOpacity>
                                            )
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity 
                                style={styles.viewMoreButton}
                                onPress={() => {router.push('(tabs)/Annonces')}}
                            >
                                <Text style={styles.viewMoreButtonText}>Voir plus d'annonces</Text>
                                <Ionicons name="arrow-forward" size={18} color="white" />
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, {color: theme.color}]}>
                                {selectedCategory === 'Tous' 
                                    ? 'Aucune annonce disponible' 
                                    : `Aucune annonce disponible dans la catégorie ${selectedCategory}`
                                }
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.subscriptionSection}>
                    <View style={styles.subscriptionCard}>
                        <Ionicons name={subscribed ? "notifications" : "notifications-outline"} size={32} color={subscribed ? "#4CAF50" : "#39335E"} />
                        <Text style={styles.subscriptionTitle}>
                            {subscribed ? "Abonnement activé" : "Restez informé!"}
                        </Text>
                        <Text style={styles.subscriptionDesc}>
                            {subscribed 
                                ? "Vous recevrez un résumé quotidien des nouvelles annonces par email." 
                                : "Abonnez-vous pour recevoir un résumé quotidien des nouvelles annonces sans vous connecter."
                            }
                        </Text>
                        <TouchableOpacity
                            style={[styles.subscribeButton, subscribed ? {backgroundColor: '#4CAF50'} : null]}
                            onPress={() => {
                                setSubscribed(prev => !prev);
                                Toast.show({
                                    type: 'success',
                                    text1: subscribed ? 'Désabonnement réussi' : 'Abonnement activé',
                                    visibilityTime: 2000,
                                });
                            }}
                        >
                            <Ionicons name={subscribed ? "close-circle-outline" : "notifications-outline"} size={20} color="white" />
                            <Text style={styles.subscribeButtonText}>
                                {subscribed ? "Se désabonner" : "S'abonner aux nouvelles annonces"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>Comment ça marche?</Text>
                    <View style={styles.infoStep}>
                        <View style={styles.infoStepNumber}>
                            <Text style={styles.infoStepNumberText}>1</Text>
                        </View>
                        <View style={styles.infoStepContent}>
                            <Text style={styles.infoStepTitle}>Parcourez ou publiez</Text>
                            <Text style={styles.infoStepDesc}>Consultez les annonces disponibles ou publiez votre propre annonce en quelques clics</Text>
                        </View>
                    </View>
                    <View style={styles.infoStep}>
                        <View style={styles.infoStepNumber}>
                            <Text style={styles.infoStepNumberText}>2</Text>
                        </View>
                        <View style={styles.infoStepContent}>
                            <Text style={styles.infoStepTitle}>Contactez le propriétaire</Text>
                            <Text style={styles.infoStepDesc}>Utilisez le bouton "Contacter" pour discuter avec le propriétaire de l'article</Text>
                        </View>
                    </View>
                    <View style={styles.infoStep}>
                        <View style={styles.infoStepNumber}>
                            <Text style={styles.infoStepNumberText}>3</Text>
                        </View>
                        <View style={styles.infoStepContent}>
                            <Text style={styles.infoStepTitle}>Échangez à l'école</Text>
                            <Text style={styles.infoStepDesc}>Convenez d'un point de rencontre à l'école pour l'échange</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};
export default Home;

const styles = StyleSheet.create({
  container: {
      paddingTop: 50,
      paddingHorizontal: 20,
      flex: 1,
  },
  header: {
      flexDirection: 'row',
      alignItems:'center',
      justifyContent: 'space-between',
  },
  header_left:{
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
  },
  profile: {
      width: 80,
      height: 80,
      borderRadius: 45,
  },
  heading_text: {
      fontSize: 12,
      lineHeight: 14,
      fontFamily: 'Montserrat_500Medium',
      color: '#727272',
      textTransform: 'capitalize',
  },
  heading: {
      fontSize: 18,
      lineHeight: 22,
      fontFamily: 'Montserrat_700Bold',
      color: '#39335E',
      textTransform: 'capitalize',
  },
  notification_box: {

  },
  notification: {
      position:'relative',
  },
  circle: {
      position: 'absolute',
      width: 15,
      height: 15,
      alignItems:'center',
      justifyContent: 'center',
      backgroundColor: '#EB001B',
      borderRadius: 50,
      right: -3,
      top: -3,
  },
  notification_count: {
      fontSize: 8,
      lineHeight: 12,
      fontFamily: 'Montserrat_600SemiBold',
      color: '#FFFFFF',
  },
  bourseHeader: {
      marginTop: 20,
      backgroundColor: '#39335E',
      padding: 15,
      borderRadius: 12,
      marginBottom: 15,
  },
  bourseTitle: {
      fontSize: 22,
      fontFamily: 'Montserrat_700Bold',
      color: '#FFFFFF',
      marginBottom: 5,
  },
  bourseSubtitle: {
      fontSize: 14,
      fontFamily: 'Montserrat_500Medium',
      color: '#FFFFFF',
      opacity: 0.9,
  },
  publishButton: {
      backgroundColor: '#EB001B',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 8,
      marginBottom: 20,
  },
  publishButtonText: {
      color: '#FFFFFF',
      fontFamily: 'Montserrat_600SemiBold',
      fontSize: 16,
      marginLeft: 10,
  },
  sectionTitle: {
      fontSize: 18,
      fontFamily: 'Montserrat_700Bold',
      color: '#39335E',
      marginBottom: 10,
  },
  categoriesContainer: {
      flexDirection: 'row',
      marginBottom: 10,
  },
  categoryButton: {
      padding: 12,
      borderRadius: 8,
      backgroundColor: '#F0F0F0',
      marginRight: 10,
      alignItems: 'center',
      minWidth: 100,
      flexDirection: 'row',
      justifyContent: 'flex-start',
  },
  categoryIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#E6E6FA',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
  },
  categoryText: {
      fontFamily: 'Montserrat_600SemiBold',
      fontSize: 12,
  },
  filterSection: {
      marginBottom: 20,
  },
  filterLabel: {
      fontSize: 14,
      fontFamily: 'Montserrat_600SemiBold',
      color: '#39335E',
      marginBottom: 8,
      marginTop: 5,
  },
  filterButtonsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 10,
  },
  filterButton: {
      backgroundColor: '#EFEFEF',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      marginRight: 8,
      marginBottom: 8,
  },
  filterButtonText: {
      fontSize: 12,
      fontFamily: 'Montserrat_500Medium',
      color: '#39335E',
  },
  recentSection: {
      marginBottom: 20,
  },
  sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
  },
  seeAllText: {
      color: '#EB001B',
      fontFamily: 'Montserrat_600SemiBold',
      fontSize: 14,
  },
  announceCard: {
      backgroundColor: '#F9F9F9',
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
      width: 80,
      height: 80,
      backgroundColor: '#E0E0E0',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
  },
  categoryBadge: {
      color: 'white',
      fontSize: 10,
      fontFamily: 'Montserrat_600SemiBold',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
      margin: 5,
  },
  sizeBadge: {
      color: 'white',
      fontSize: 10,
      fontFamily: 'Montserrat_600SemiBold',
      paddingHorizontal: 8,
      paddingVertical: 3,
  },
  campBadge: {
      color: 'white',
      fontSize: 8,
      fontFamily: 'Montserrat_600SemiBold',
      paddingHorizontal: 6,
      paddingVertical: 2,
  },
  cardContent: {
      padding: 10,
      flex: 1,
  },
  cardTitle: {
      fontSize: 16,
      fontFamily: 'Montserrat_600SemiBold',
      color: '#39335E',
      marginBottom: 5,
  },
  cardType: {
      fontSize: 12,
      fontFamily: 'Montserrat_500Medium',
      color: '#727272',
  },
  cardDate: {
      fontSize: 11,
      fontFamily: 'Montserrat_500Medium',
      color: '#9B9B9B',
      marginTop: 5,
  },
  subscribeButton: {
      backgroundColor: '#39335E',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 8,
      marginTop: 10,
  },
  subscribeButtonText: {
      color: '#FFFFFF',
      fontFamily: 'Montserrat_600SemiBold',
      fontSize: 14,
      marginLeft: 10,
  },
  cardImageWrapper: {
      position: 'relative',
      width: 80,
      height: 80,
  },
  cardImage: {
      width: '100%',
       height: '100%',
      borderTopLeftRadius: 10,
      borderBottomLeftRadius: 10,
  },
  categoryBadgeWrapper: {
      position: 'absolute',
      top: 5,
      left: 5,
      borderRadius: 12,
      paddingHorizontal: 6,
      paddingVertical: 2,
  },
  sizeBadgeWrapper: {
      position: 'absolute',
      bottom: 5,
      left: 5,
      borderRadius: 12,
      paddingHorizontal: 6,
      paddingVertical: 2,
      backgroundColor: '#FF9800',
  },
  campBadgeWrapper: {
      position: 'absolute',
      top: 5,
      right: 5,
      borderRadius: 8,
      paddingHorizontal: 4,
      paddingVertical: 1,
  },
  contactButton: {
      marginTop: 8,
      backgroundColor: '#836EFE',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
  },
  contactButtonText: {
      color: '#FFF',
      fontFamily: 'Montserrat_600SemiBold',
      fontSize: 12,
  },
  loadingContainer: {
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
  },
  emptyContainer: {
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
  },
  emptyText: {
      fontSize: 14,
      fontFamily: 'Montserrat_500Medium',
      textAlign: 'center',
  },
  viewMoreButton: {
      backgroundColor: '#5D5FEF',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 8,
      marginVertical: 10,
  },
  viewMoreButtonText: {
      color: '#FFFFFF',
      fontFamily: 'Montserrat_600SemiBold',
      fontSize: 16,
      marginRight: 10,
  },
  subscriptionSection: {
      marginVertical: 15,
  },
  subscriptionCard: {
      backgroundColor: '#F5F5F5',
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 3,
  },
  subscriptionTitle: {
      fontSize: 18,
      fontFamily: 'Montserrat_700Bold',
      color: '#39335E',
      marginTop: 10,
      marginBottom: 5,
  },
  subscriptionDesc: {
      fontSize: 14,
      fontFamily: 'Montserrat_500Medium',
      color: '#727272',
      textAlign: 'center',
      marginBottom: 15,
  },
  infoSection: {
      marginVertical: 15,
      backgroundColor: '#F5F7FA',
      borderRadius: 12,
      padding: 15,
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
    color: '#39335E',
    marginBottom: 15,
  },
  infoStep: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  infoStepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#5D5FEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    marginTop: 3,
  },
  infoStepNumberText: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat_700Bold',
    fontSize: 16,
  },
  infoStepContent: {
    flex: 1,
  },
  infoStepTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#39335E',
    marginBottom: 3,
  },
  infoStepDesc: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    color: '#727272',
    lineHeight: 20,
  },
  contactMethodBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#EB001B',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start'      // pour ne pas étirer le bouton sur toute la largeur
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
    marginLeft: 4,
  },
});
