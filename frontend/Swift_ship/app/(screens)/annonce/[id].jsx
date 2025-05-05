import React, { useContext, useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, ActivityIndicator, SafeAreaView, Platform, Alert, Share, Dimensions } from 'react-native';
import Back from "../../../assets/images/back.svg";
import Dark_back from "../../../assets/images/dark_back.svg";
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import ThemeContext from '../../../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import AnnonceContext from '../../../contexts/AnnonceContext';
import { router, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';

// Get screen width for responsive designs
const { width } = Dimensions.get('window');

export default function AnnonceDetail() {
  const { theme, darkMode, profileData } = useContext(ThemeContext);
  const { annonces, deleteAnnonce } = useContext(AnnonceContext);
  const { id } = useLocalSearchParams();
  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [fontsLoaded] = useFonts({
    Montserrat_700Bold,
    Montserrat_600SemiBold,
    Montserrat_500Medium,
  });

  // Debugger logs to help troubleshoot
  useEffect(() => {
    console.log("ID received:", id);
    console.log("Annonces count:", annonces?.length || 0);
  }, [id, annonces]);

  useEffect(() => {
    if (annonces && id) {
      // Log exact match attempt
      console.log("Looking for annonce with ID:", id);
      
      const foundAnnonce = annonces.find(item => {
        // Log each ID comparison
        console.log("Comparing with:", item.id, "Match:", item.id === id);
        return item.id === id;
      });
      
      if (foundAnnonce) {
        console.log("Annonce found:", foundAnnonce.title);
        setAnnonce(foundAnnonce);
        setLoading(false);
      } else {
        console.log("Annonce not found");
        setError('Annonce non trouvée');
        setLoading(false);
      }
    }
  }, [annonces, id]);

  const goBack = () => {
    router.back();
  };

  const handleDeleteAnnonce = useCallback(() => {
    Alert.alert(
      "Confirmation de suppression",
      "Êtes-vous sûr de vouloir supprimer cette annonce ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            const success = await deleteAnnonce(id);
            setIsDeleting(false);
            if (success) {
              Toast.show({
                type: 'success',
                text1: 'Annonce supprimée avec succès',
                visibilityTime: 2000,
              });
              router.back();
            } else {
              Toast.show({
                type: 'error',
                text1: 'Erreur lors de la suppression',
                visibilityTime: 2000,
              });
            }
          }
        }
      ]
    );
  }, [deleteAnnonce, id]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Découvrez cette annonce : ${annonce.title}\nType: ${annonce.type}\n${annonce.description || ''}`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erreur lors du partage',
        visibilityTime: 2000,
      });
    }
  }, [annonce]);

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
    const today = new Date();
    const date = new Date(dateString.split('/').reverse().join('-'));
    if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "Hier";
    return dateString;
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#39335E" />
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <StatusBar style={darkMode ? 'light' : 'dark'} />
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={goBack} accessibilityLabel="Retour" accessibilityRole="button">
              {darkMode ? <Dark_back /> : <Back />}
            </TouchableOpacity>
            <Text style={[styles.heading, { color: theme.color }]}>Annonce</Text>
            <View style={styles.headerRightPlaceholder} />
          </View>
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.color }]}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={goBack}>
              <Text style={styles.retryButtonText}>Retourner</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Get images array or create from single image url
  const images = (annonce.images && annonce.images.length > 0) ? 
                 annonce.images : 
                 (annonce.imageUrl ? [annonce.imageUrl] : []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={goBack} 
            accessible={true} 
            accessibilityLabel="Retour" 
            accessibilityRole="button"
          >
            {darkMode ? <Dark_back /> : <Back />}
          </TouchableOpacity>
          <Text style={[styles.heading, { color: theme.color }]}>Détails de l'annonce</Text>
          <TouchableOpacity 
            onPress={handleShare}
            accessible={true}
            accessibilityLabel="Partager l'annonce"
            accessibilityRole="button"
          >
            <Ionicons name="share-outline" size={24} color={theme.color} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Image display */}
          <View style={[styles.imageContainer, { backgroundColor: darkMode ? '#444444' : '#E0E0E0' }]}>
            {images.length > 0 ? (
              <Image
                source={{ uri: images[activeImageIndex] }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons 
                  name={getCategoryIcon(annonce.category)} 
                  size={60} 
                  color={darkMode ? '#666666' : '#CCCCCC'} 
                />
              </View>
            )}
            
            {/* Category badge */}
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(annonce.category) }]}>
              <Text style={styles.categoryBadgeText}>{annonce.category}</Text>
            </View>
          </View>
          
          {/* Image pagination dots if multiple images */}
          {images.length > 1 && (
            <View style={styles.paginationContainer}>
              {images.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.paginationDot,
                    { backgroundColor: index === activeImageIndex ? '#39335E' : '#D0D0D0' }
                  ]}
                  onPress={() => setActiveImageIndex(index)}
                />
              ))}
            </View>
          )}

          <View style={styles.contentContainer}>
            <Text style={[styles.title, { color: darkMode ? '#FFFFFF' : '#39335E' }]}>
              {annonce.title}
            </Text>
            
            <View style={[styles.userContainer, { backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
              <Image 
                source={profileData?.profileImage ? { uri: profileData.profileImage } : require('../../../assets/images/placeholder.png')}
                style={styles.userAvatar}
              />
              <View>
                <Text style={[styles.userName, { color: darkMode ? '#FFFFFF' : '#39335E' }]}>
                  {profileData?.fullName || 'Utilisateur inconnu'}
                </Text>
                <Text style={[styles.userRole, { color: darkMode ? '#AAAAAA' : '#666666' }]}>
                  Membre depuis {new Date().getFullYear()}
                </Text>
              </View>
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Ionicons name="pricetag-outline" size={18} color={darkMode ? '#AAAAAA' : '#666666'} />
                <Text style={[styles.infoText, { color: darkMode ? '#AAAAAA' : '#666666' }]}>
                  Type: {annonce.type}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={18} color={darkMode ? '#AAAAAA' : '#666666'} />
                <Text style={[styles.infoText, { color: darkMode ? '#AAAAAA' : '#666666' }]}>
                  Publié: {formatDate(annonce.date)}
                </Text>
              </View>
            </View>

            <Text style={[styles.descriptionTitle, { color: darkMode ? '#FFFFFF' : '#39335E' }]}>
              Description
            </Text>
            <Text style={[styles.description, { color: darkMode ? '#CCCCCC' : '#333333' }]}>
              {annonce.description || "Aucune description fournie."}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.contactButton, { opacity: isDeleting ? 0.5 : 1 }]}
              onPress={() => router.push('/inbox')}
              disabled={isDeleting}
              accessible={true}
              accessibilityLabel="Contacter l'annonceur"
              accessibilityRole="button"
            >
              <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
              <Text style={styles.contactButtonText}>Contacter</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.deleteButton, { opacity: isDeleting ? 0.5 : 1 }]}
              onPress={handleDeleteAnnonce}
              disabled={isDeleting}
              accessible={true}
              accessibilityLabel="Supprimer l'annonce"
              accessibilityRole="button"
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.deleteButtonText}>Supprimer</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

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
    marginBottom: 20,
  },
  headerRightPlaceholder: {
    width: 24,
  },
  heading: {
    fontSize: 20,
    fontFamily: 'Montserrat_700Bold',
    flex: 1,
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
  },
  contentContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 15,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  userRole: {
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
  },
  infoContainer: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
    marginLeft: 8,
  },
  descriptionTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#836EFE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    marginLeft: 10,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#EB001B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    marginLeft: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#39335E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
});
