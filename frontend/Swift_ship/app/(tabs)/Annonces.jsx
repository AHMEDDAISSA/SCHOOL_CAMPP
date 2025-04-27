import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, FlatList, ActivityIndicator, RefreshControl, SafeAreaView, Dimensions, Platform } from 'react-native';
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

// Component for annonce cards
const AnnonceCard = ({ item, darkMode, onPress }) => (
  <TouchableOpacity 
    style={[
      styles.announceCard,
      { backgroundColor: darkMode ? '#363636' : '#F9F9F9' }
    ]}
    onPress={onPress}
    accessible={true}
    accessibilityLabel={`Annonce: ${item.title}`}
    accessibilityHint="Appuyez pour voir les détails de l'annonce"
    accessibilityRole="button"
  >
    <View style={[
      styles.cardImageContainer,
      { backgroundColor: darkMode ? '#444444' : '#E0E0E0' }
    ]}>
      {(item.imageUrl || (item.images && item.images.length > 0)) ? (
        <Image 
          source={{ uri: item.imageUrl || item.images[0] }} 
          style={styles.cardImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholderImageContainer}>
          <Ionicons 
            name={getCategoryIcon(item.category)} 
            size={30} 
            color={darkMode ? '#666666' : '#CCCCCC'} 
          />
        </View>
      )}
      <View style={[
        styles.categoryBadgeContainer, 
        {backgroundColor: getCategoryColor(item.category)}
      ]}>
        <Text style={styles.categoryBadge}>{item.category}</Text>
      </View>
    </View>
    <View style={styles.cardContent}>
      <Text style={[
        styles.cardTitle, 
        { color: darkMode ? '#FFFFFF' : '#39335E' }
      ]} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={[
        styles.cardType, 
        { color: darkMode ? '#AAAAAA' : '#666666' }
      ]}>
        {item.type}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={[
          styles.cardDate, 
          { color: darkMode ? '#AAAAAA' : '#666666' }
        ]}>
          {formatDate(item.date)}
        </Text>
        {item.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>Nouveau</Text>
          </View>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

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
  // You can improve this with a date library like date-fns
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

// Main component
const Annonces = () => {
  const { theme, darkMode } = useContext(ThemeContext);
  // Utiliser les fonctions du contexte
  const { 
    annonces, 
    loading: contextLoading, 
    refreshAnnonces, 
    cleanOldAnnonces,
    updateNewStatus
  } = useContext(AnnonceContext);
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Load fonts
  const [fontsLoaded] = useFonts({
    Montserrat_700Bold,
    Montserrat_600SemiBold,
    Montserrat_500Medium,
  });
  
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
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Initialisation et nettoyage
  useEffect(() => {
    // Nettoyer les anciennes annonces et mettre à jour le statut "nouveau"
    const initializeData = async () => {
      try {
        // Mettre à jour le statut "nouveau" des annonces
        await updateNewStatus();
        
        // Nettoyer les anciennes annonces (plus de 30 jours)
        const deletedCount = await cleanOldAnnonces(30);
        if (deletedCount > 0) {
          console.log(`${deletedCount} anciennes annonces supprimées`);
        }
      } catch (error) {
        console.error('Erreur d\'initialisation:', error);
      }
    };
    
    initializeData();
  }, []);
  
  // Fonction pour rafraîchir les données
  const fetchAnnonces = useCallback(async (isRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Utiliser la fonction de rafraîchissement du contexte
      await refreshAnnonces();
      
      setPage(prev => isRefresh ? 1 : prev + 1);
      setHasMore(page < 3); // Simuler la limite de pagination
      
    } catch (err) {
      console.error('Erreur lors du chargement des annonces:', err);
      setError('Impossible de charger les annonces. Veuillez réessayer.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, refreshAnnonces]);
  
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
    fetchAnnonces(true);
  }, [fetchAnnonces]);
  
  // Load more handler for pagination
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchAnnonces();
    }
  };
  
  // Filter annonces based on category and search
  const filteredAnnonces = useMemo(() => {
    return annonces.filter(item => {
      const matchesCategory = activeFilter === '0' || 
        item.category === categories.find(cat => cat.id === activeFilter)?.name;
      
      const matchesSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.type.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [annonces, activeFilter, searchQuery, categories]);
  
  // Optimiser les fonctions de rendu pour la FlatList
  const keyExtractor = useCallback((item) => item.id, []);
  
  const renderItem = useCallback(({ item }) => (
    <MemoizedAnnonceCard 
      item={item}
      darkMode={darkMode}
      onPress={() => router.push(`(screens)/annonce/${item.id}`)}
    />
  ), [darkMode]);
  
  // Navigation
  const back = () => {
    router.push('home');
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
        
        {/* Barre de recherche */}
        <TouchableOpacity 
          style={[styles.input_container, {backgroundColor:theme.cardbg2}]} 
          onPress={() => router.push('(screens)/recherche_annonce')}
          accessible={true}
          accessibilityLabel="Rechercher une annonce"
          accessibilityHint="Appuyez pour ouvrir l'écran de recherche"
          accessibilityRole="search"
        >
          <Search style={styles.search} />
          <Text style={styles.placeholder}>Rechercher une annonce...</Text>
          <Filter style={styles.filter} />
        </TouchableOpacity>
        
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
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh}
                colors={['#39335E', '#EB001B']}
                tintColor={darkMode ? '#FFFFFF' : '#39335E'}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
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
        {filteredAnnonces.length > 0 && (
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
        )}
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
  input_container: {
    position: 'relative',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 36,
    minHeight: 60,
    justifyContent: 'center',
    marginBottom: 15,
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
});
