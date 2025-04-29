import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import React, { useContext, useState, useEffect, useMemo } from 'react';
import Profile_img from "../../assets/images/profil33.png"; // Image par défaut
import Notification from "../../assets/images/notification.svg";
import Dark_Notification from "../../assets/images/dark_notification.svg";
import { router } from "expo-router";
import ThemeContext from '../../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import AnnonceContext from '../../contexts/AnnonceContext';

const Home = () => {
    const { theme, darkMode, profileData } = useContext(ThemeContext);
    const { annonces, loading, refreshAnnonces, updateNewStatus } = useContext(AnnonceContext);
    
    // Ajouter un état pour suivre la catégorie sélectionnée
    const [selectedCategory, setSelectedCategory] = useState('Tous');
    
    // Utiliser l'image de profil du contexte si disponible, sinon utiliser l'image par défaut
    const profileImage = profileData && profileData.profileImage 
      ? { uri: profileData.profileImage } 
      : Profile_img;

    // Utiliser le nom complet du contexte si disponible, sinon utiliser un nom par défaut
    const fullName = profileData && profileData.fullName 
      ? profileData.fullName 
      : 'Ahmed Aissa';
      
    // Récupérer les annonces récentes filtrées par catégorie
    const recentAnnounces = useMemo(() => {
      // Filtrer d'abord par catégorie si une est sélectionnée (sauf 'Tous')
      const filteredAnnonces = selectedCategory === 'Tous' 
        ? [...annonces] 
        : [...annonces].filter(annonce => annonce.category === selectedCategory);
      
      // Puis trier par date
      return filteredAnnonces
        .sort((a, b) => {
          // Conversion des dates au format DD/MM/YYYY en objets Date
          const dateA = new Date(a.date.split('/').reverse().join('-'));
          const dateB = new Date(b.date.split('/').reverse().join('-'));
          return dateB - dateA;  // Du plus récent au plus ancien
        })
        .slice(0, 4);  // Ne prendre que les 4 premières annonces
    }, [annonces, selectedCategory]); // Ajouter selectedCategory comme dépendance

    const [subscribed, setSubscribed] = useState(false);

    // Charger les annonces au montage du composant
    useEffect(() => {
      refreshAnnonces();
      updateNewStatus();
    }, []);

    // Helper function pour obtenir la couleur en fonction de la catégorie
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

    // Helper function pour formater les dates
    const formatDate = (dateString) => {
      const today = new Date();
      const date = new Date(dateString.split('/').reverse().join('-'));
      
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
      
      // Otherwise return the original format
      return dateString;
    };

    // Ajouter 'Tous' en première position dans les catégories
    const categories = [
      { id: '0', name: 'Tous', icon: 'list-outline' },
      { id: '1', name: 'Donner', icon: 'gift-outline' },
      { id: '2', name: 'Prêter', icon: 'swap-horizontal-outline' },
      { id: '3', name: 'Emprunter', icon: 'hand-left-outline' },
      { id: '4', name: 'Louer', icon: 'cash-outline' },
      { id: '5', name: 'Acheter', icon: 'cart-outline' }
    ];

    const types = ['Tous', 'Vêtement', 'Équipement', 'Chaussures'];

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
          <TouchableOpacity style={styles.notification_box} onPress={() => {router.push('(screens)/notification')}}>
            {darkMode ? <Dark_Notification style={styles.notification} /> : <Notification style={styles.notification} />}
            <View style={styles.circle}>
              <Text style={styles.notification_count}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.bourseHeader}>
            <Text style={styles.bourseTitle}>Bourse au prêt</Text>
            <Text style={styles.bourseSubtitle}>Échangez, prêtez, donnez pour les camps de ski et camps verts</Text>
          </View>

          <TouchableOpacity style={styles.publishButton} onPress={() => {router.push('(tabs)/Annonces')}}>
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

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {types.map(type => (
              <TouchableOpacity key={type} style={{ backgroundColor: '#EFEFEF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 }}>
                <Text style={{ fontSize: 12 }}>{type}</Text>
              </TouchableOpacity>
            ))}
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
              recentAnnounces.map(item => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.announceCard, { backgroundColor: darkMode ? '#363636' : '#F9F9F9' }]}
                  onPress={() => {router.push(`(screens)/annonce/${item.id}`)}}
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
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, { color: darkMode ? '#FFFFFF' : '#39335E' }]} numberOfLines={2}>{item.title}</Text>
                    <Text style={[styles.cardType, { color: darkMode ? '#B0B0B0' : '#727272' }]}>{item.type}</Text>
                    <Text style={[styles.cardDate, { color: darkMode ? '#808080' : '#9B9B9B' }]}>{formatDate(item.date)}</Text>
                    <TouchableOpacity style={styles.contactButton} onPress={() => router.push('/inbox')}>
                      <Text style={styles.contactButtonText}>Contacter</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
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

          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={() => {
              setSubscribed(prev => !prev);
              Toast.show({
                type: 'success',
                text1: subscribed ? 'Désabonnement réussi' : 'Abonnement activé',
                visibilityTime: 2000,
              });
            }}
          >
            <Ionicons name="notifications-outline" size={20} color="white" />
            <Text style={styles.subscribeButtonText}>
              {subscribed ? "Se désabonner" : "S'abonner aux nouvelles annonces"}
            </Text>
          </TouchableOpacity>
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
      width: 65,
      height: 65,
      borderRadius: 32.5, // Pour rendre l'image circulaire
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
  
  // Styles de base
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
      marginBottom: 20,
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
      marginBottom: 20,
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
  contactButton: {
      marginTop: 8,
      backgroundColor: '#836EFE',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
      alignSelf: 'flex-start',
  },
  contactButtonText: {
      color: '#FFF',
      fontFamily: 'Montserrat_600SemiBold',
      fontSize: 12,
  },
  // Styles pour la gestion des états d'affichage
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
});
