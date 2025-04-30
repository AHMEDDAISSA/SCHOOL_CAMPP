import React, { useContext, useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, ActivityIndicator, SafeAreaView, Platform, Alert } from 'react-native';
import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import ThemeContext from '../../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import AnnonceContext from '../../contexts/AnnonceContext';
import { router, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';

const AnnonceDetail = () => {
  const { theme, darkMode } = useContext(ThemeContext);
  const { annonces, deleteAnnonce } = useContext(AnnonceContext);
  const { id } = useLocalSearchParams(); // Récupérer l'ID de l'annonce depuis les paramètres de navigation
  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les polices
  const [fontsLoaded] = useFonts({
    Montserrat_700Bold,
    Montserrat_600SemiBold,
    Montserrat_500Medium,
  });

  // Trouver l'annonce correspondant à l'ID
  useEffect(() => {
    if (annonces && id) {
      const foundAnnonce = annonces.find(item => item.id === id);
      if (foundAnnonce) {
        setAnnonce(foundAnnonce);
        setLoading(false);
      } else {
        setError('Annonce non trouvée');
        setLoading(false);
      }
    }
  }, [annonces, id]);

  // Fonction pour retourner à l'écran précédent
  const goBack = () => {
    router.back();
  };

  // Fonction pour gérer la suppression
  const handleDeleteAnnonce = useCallback(() => {
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
            setLoading(true);
            const success = await deleteAnnonce(id);
            setLoading(false);
            if (success) {
              Toast.show({
                type: 'success',
                text1: 'Annonce supprimée avec succès',
                visibilityTime: 2000,
              });
              router.back(); // Revenir à l'écran précédent après suppression
            } else {
              Toast.show({
                type: 'error',
                text1: 'Erreur lors de la suppression',
                text2: 'Veuillez réessayer',
                visibilityTime: 2000,
              });
            }
          }
        }
      ]
    );
  }, [deleteAnnonce, id]);

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

  // Fonction pour obtenir la couleur de catégorie
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

  // Formatter la date
  const formatDate = (dateString) => {
    const today = new Date();
    const date = new Date(dateString.split('/').reverse().join('-'));
    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    }
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Hier";
    }
    return dateString;
  };

  // Afficher un indicateur de chargement si les polices ou les données sont en cours de chargement
  if (!fontsLoaded || loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#39335E" />
      </View>
    );
  }

  // Afficher un message d'erreur si l'annonce n'est pas trouvée
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
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={goBack}>
              <Text style={styles.retryButtonText}>Retourner</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* En-tête */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={goBack} 
            accessible={true} 
            accessibilityLabel="Retour" 
            accessibilityHint="Retourner à l'écran précédent" 
            accessibilityRole="button"
          >
            {darkMode ? <Dark_back /> : <Back />}
          </TouchableOpacity>
          <Text style={[styles.heading, { color: theme.color }]}>Détails de l'annonce</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Image de l'annonce */}
          <View style={[styles.imageContainer, { backgroundColor: darkMode ? '#444444' : '#E0E0E0' }]}>
            {(annonce.imageUrl || (annonce.images && annonce.images.length > 0)) ? (
              <Image 
                source={{ uri: annonce.imageUrl || annonce.images[0] }} 
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
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(annonce.category) }]}>
              <Text style={styles.categoryBadgeText}>{annonce.category}</Text>
            </View>
          </View>

          {/* Contenu de l'annonce */}
          <View style={styles.contentContainer}>
            <Text style={[styles.title, { color: darkMode ? '#FFFFFF' : '#39335E' }]}>
              {annonce.title}
            </Text>
            <Text style={[styles.type, { color: darkMode ? '#AAAAAA' : '#666666' }]}>
              Type: {annonce.type}
            </Text>
            <Text style={[styles.date, { color: darkMode ? '#AAAAAA' : '#666666' }]}>
              Publié: {formatDate(annonce.date)}
            </Text>
            <Text style={[styles.descriptionTitle, { color: darkMode ? '#FFFFFF' : '#39335E' }]}>
              Description
            </Text>
            <Text style={[styles.description, { color: darkMode ? '#CCCCCC' : '#333333' }]}>
              {annonce.description || "Aucune description fournie."}
            </Text>
          </View>

          {/* Boutons d'action */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => Alert.alert('Contacter', 'Cette fonctionnalité sera implémentée bientôt.')}
              accessible={true}
              accessibilityLabel="Contacter l'annonceur"
              accessibilityRole="button"
            >
              <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
              <Text style={styles.contactButtonText}>Contacter</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={handleDeleteAnnonce}
              accessible={true}
              accessibilityLabel="Supprimer l'annonce"
              accessibilityRole="button"
            >
              <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
              <Text style={styles.deleteButtonText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default AnnonceDetail;

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
  },
  imageContainer: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
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
    marginBottom: 10,
  },
  type: {
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    marginBottom: 15,
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
    color: '#EB001B',
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