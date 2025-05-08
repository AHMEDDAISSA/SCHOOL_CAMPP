import React, { useState, useEffect, useContext, useCallback, useReducer, memo } from 'react';
import {StyleSheet,Text,View,ScrollView,TouchableOpacity,Modal,ActivityIndicator,Image,Alert,FlatList,RefreshControl,Platform,StatusBar} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import ThemeContext from '../../theme/ThemeContext';
import Button from '../../components/Button/Button';
import { Feather, MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

// Mock API functions - replace with your actual API calls
import { 
  fetchStatistics, 
  fetchListings, 
  moderateListing, 
  resetSystem,
  fetchUsers,
  blockUser
} from '../../services/api';

// Custom hooks
const useAuth = () => {
  const handleLogout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userRole');
      Toast.show({
        type: 'success',
        text1: 'Déconnexion réussie',
        visibilityTime: 2000,
        topOffset: 50
      });
      setTimeout(() => router.push('/login'), 500);
    } catch (error) {
      console.error('Error during logout:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Problème lors de la déconnexion',
        visibilityTime: 3000
      });
    }
  }, []);

  return { handleLogout };
};

// State reducer for dashboard
const dashboardReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        statistics: action.payload.statistics || state.statistics,
        listings: action.payload.listings || state.listings,
        users: action.payload.users || state.users,
        error: null,
        refreshing: false
      };
    case 'FETCH_ERROR':
      return { 
        ...state, 
        loading: false, 
        error: action.payload, 
        refreshing: false 
      };
    case 'SET_REFRESHING':
      return { ...state, refreshing: true };
    case 'SET_FILTER_STATUS':
      return { ...state, filterStatus: action.payload };
    case 'UPDATE_LISTING_STATUS':
      return {
        ...state,
        listings: state.listings.map(listing => 
          listing.id === action.payload.id 
            ? { ...listing, status: action.payload.status } 
            : listing
        )
      };
    case 'UPDATE_USER_STATUS':
      return {
        ...state,
        users: state.users.map(user => 
          user.id === action.payload.id 
            ? { ...user, isBlocked: action.payload.isBlocked } 
            : user
        )
      };
    default:
      return state;
  }
};

// Memoized components
const StatCard = memo(({ value, label, backgroundColor, valueColor, labelColor }) => (
  <View style={[styles.statCard, { backgroundColor }]}>
    <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: labelColor }]}>{label}</Text>
  </View>
));

const ActionButton = memo(({ icon, text, color, onPress }) => (
  <TouchableOpacity 
    style={[styles.actionButton, { backgroundColor: color }]}
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityLabel={text}
  >
    {icon}
    <Text style={styles.actionButtonText}>{text}</Text>
  </TouchableOpacity>
));

const ActivityItem = memo(({ item, onView, theme }) => (
  <View style={[styles.activityItem, { backgroundColor: theme.cardBackground }]}>
    <View style={styles.activityContent}>
      <Text style={[styles.activityTitle, { color: theme.textColor }]} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={[styles.activityMeta, { color: theme.textSecondary }]}>
        {item.userName} • {new Date(item.createdAt).toLocaleDateString()}
      </Text>
      <Text 
        style={[
          styles.activityStatus, 
          { 
            color: item.status === 'pending' ? '#FFA500' : 
                  item.status === 'approved' ? '#4CAF50' : '#FF6347' 
          }
        ]}
      >
        {item.status === 'pending' ? 'En attente' : 
         item.status === 'approved' ? 'Approuvé' : 'Rejeté'}
      </Text>
    </View>
    <TouchableOpacity 
      style={styles.viewButton}
      onPress={() => onView(item)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Voir détails"
    >
      <Text style={styles.viewButtonText}>Voir</Text>
    </TouchableOpacity>
  </View>
));

const ListingItem = memo(({ 
  item, 
  onView, 
  onModerate, 
  theme 
}) => (
  <View style={[styles.listingItem, { backgroundColor: theme.cardBackground }]}>
    <View style={styles.listingItemHeader}>
      <Text style={[styles.listingTitle, { color: theme.textColor }]} numberOfLines={1}>
        {item.title}
      </Text>
      <Text 
        style={[
          styles.listingStatus, 
          { 
            color: item.status === 'pending' ? '#FFA500' : 
                  item.status === 'approved' ? '#4CAF50' : '#FF6347' 
          }
        ]}
      >
        {item.status === 'pending' ? 'En attente' : 
         item.status === 'approved' ? 'Approuvé' : 'Rejeté'}
      </Text>
    </View>
    
    <Text style={[styles.listingMeta, { color: theme.textSecondary }]}>
      Par: {item.userName} • {new Date(item.createdAt).toLocaleDateString()}
    </Text>
    
    <Text 
      numberOfLines={2} 
      style={[styles.listingDescription, { color: theme.textColor }]}
    >
      {item.description}
    </Text>
    
    <View style={styles.listingCategory}>
      <Text style={[styles.categoryLabel, { color: theme.textSecondary }]}>
        Catégorie: 
      </Text>
      <Text style={[styles.categoryValue, { color: theme.textColor }]}>
        {item.category}
      </Text>
      <Text style={[styles.categoryLabel, { color: theme.textSecondary, marginLeft: 10 }]}>
        Type: 
      </Text>
      <Text style={[styles.categoryValue, { color: theme.textColor }]}>
        {item.type}
      </Text>
    </View>
    
    <View style={styles.listingActions}>
      <TouchableOpacity 
        style={[styles.actionButtonSmall, styles.viewActionButton]}
        onPress={() => onView(item)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Voir détails"
      >
        <Feather name="eye" size={16} color="#FFFFFF" />
        <Text style={styles.actionButtonSmallText}>Voir</Text>
      </TouchableOpacity>
      
      {item.status === 'pending' && (
        <>
          <TouchableOpacity 
            style={[styles.actionButtonSmall, styles.approveActionButton]}
            onPress={() => onModerate(item.id, 'approve')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Approuver"
          >
            <Feather name="check" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonSmallText}>Approuver</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButtonSmall, styles.rejectActionButton]}
            onPress={() => onModerate(item.id, 'reject')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Rejeter"
          >
            <Feather name="x" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonSmallText}>Rejeter</Text>
          </TouchableOpacity>
        </>
      )}
      
      {item.status !== 'pending' && (
        <TouchableOpacity 
          style={[styles.actionButtonSmall, styles.resetActionButton]}
          onPress={() => onModerate(item.id, 'reset')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Réinitialiser"
        >
          <Feather name="refresh-cw" size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonSmallText}>Réinitialiser</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
));

const UserItem = memo(({ 
  item, 
  onBlockToggle, 
  onRoleChange, 
  theme 
}) => (
  <View style={[styles.userItem, { backgroundColor: theme.cardBackground }]}>
    <View style={styles.userItemContent}>
      <View style={styles.userAvatar}>
        <Text style={styles.userInitials}>
          {item.name.substring(0, 2).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: theme.textColor }]}>
          {item.name}
        </Text>
        <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
          {item.email}
        </Text>
        <View style={styles.userDetailRow}>
          <Text style={[styles.userDetailLabel, { color: theme.textSecondary }]}>
            Rôle:
          </Text>
          <Text style={[styles.userDetailValue, { color: theme.textColor }]}>
            {item.role === 'admin' ? 'Administrateur' : 
             item.role === 'parent' ? 'Parent' : 'Exploitant'}
          </Text>
        </View>
        <View style={styles.userDetailRow}>
          <Text style={[styles.userDetailLabel, { color: theme.textSecondary }]}>
            Statut:
          </Text>
          <Text 
            style={[
              styles.userDetailValue, 
              { color: item.isBlocked ? '#FF6347' : '#4CAF50' }
            ]}
          >
            {item.isBlocked ? 'Bloqué' : 'Actif'}
          </Text>
        </View>
      </View>
    </View>
    
    <View style={styles.userActions}>
      <TouchableOpacity 
        style={[
          styles.userActionButton,
          { backgroundColor: item.isBlocked ? '#4CAF50' : '#FF6347' }
        ]}
        onPress={() => onBlockToggle(item.id, item.isBlocked)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={item.isBlocked ? "Débloquer" : "Bloquer"}
      >
        <Feather 
          name={item.isBlocked ? 'unlock' : 'lock'} 
          size={16} 
          color="#FFFFFF" 
        />
        <Text style={styles.userActionButtonText}>
          {item.isBlocked ? 'Débloquer' : 'Bloquer'}
        </Text>
      </TouchableOpacity>
      
      {item.role !== 'admin' && (
        <TouchableOpacity 
          style={[styles.userActionButton, { backgroundColor: '#53C1DE' }]}
          onPress={() => onRoleChange(item)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Modifier rôle"
        >
          <Feather name="edit-2" size={16} color="#FFFFFF" />
          <Text style={styles.userActionButtonText}>
            Modifier rôle
          </Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
));

const NavItem = memo(({ 
  icon, 
  label, 
  isActive, 
  onPress, 
  activeColor, 
  inactiveColor 
}) => (
  <TouchableOpacity 
    style={styles.navItem} 
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="tab"
    accessibilityLabel={label}
    accessibilityState={{ selected: isActive }}
  >
    {icon(isActive ? activeColor : inactiveColor)}
    <Text 
      style={[
        styles.navLabel, 
        { color: isActive ? activeColor : inactiveColor }
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
));

const FilterButton = memo(({ 
  label, 
  isActive, 
  onPress 
}) => (
  <TouchableOpacity 
    style={[
      styles.filterButton, 
      isActive && styles.filterButtonActive
    ]}
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel={`Filtrer par ${label}`}
    accessibilityState={{ selected: isActive }}
  >
    <Text style={[
      styles.filterText,
      isActive && styles.filterTextActive
    ]}>
      {label}
    </Text>
  </TouchableOpacity>
));

// Main component
const AdminDashboard = () => {
  const { theme, darkMode } = useContext(ThemeContext);
  const { handleLogout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedListing, setSelectedListing] = useState(null);
  const [listingModalVisible, setListingModalVisible] = useState(false);
  const [resetConfirmModalVisible, setResetConfirmModalVisible] = useState(false);

  const [adminInfo, setAdminInfo] = useState({
    name: 'Ahmed Aissa',
    email: 'aahmedaissa@isima.u-monastir.tn',
    role: 'Administrateur système',
    lastLogin: new Date().toLocaleDateString(),
    avatar: null
  });

  // Use reducer for complex state management
  const [state, dispatch] = useReducer(dashboardReducer, {
    loading: true,
    refreshing: false,
    statistics: null,
    listings: [],
    users: [],
    filterStatus: 'all',
    error: null
  });

  // Extract variables from state for cleaner code
  const { 
    loading, 
    refreshing, 
    statistics, 
    listings, 
    users, 
    filterStatus, 
    error 
  } = state;

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Load data function
  const loadData = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      // Load dashboard data in parallel for better performance
      const [stats, listingsData, usersData] = await Promise.all([
        fetchStatistics(),
        fetchListings(),
        fetchUsers()
      ]);
      
      dispatch({ 
        type: 'FETCH_SUCCESS', 
        payload: { 
          statistics: stats, 
          listings: listingsData, 
          users: usersData 
        } 
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
      dispatch({ type: 'FETCH_ERROR', payload: error.message });
      
      Toast.show({
        type: 'error',
        text1: 'Erreur de chargement',
        text2: 'Impossible de charger les données',
        visibilityTime: 3000,
        topOffset: 50
      });
    }
  }, []);

  // Refresh function
  const onRefresh = useCallback(() => {
    dispatch({ type: 'SET_REFRESHING' });
    loadData();
  }, [loadData]);

  // Filter listings handler
  const handleFilterChange = useCallback((status) => {
    dispatch({ type: 'SET_FILTER_STATUS', payload: status });
  }, []);

  // View listing details
  const handleViewListing = useCallback((listing) => {
    setSelectedListing(listing);
    setListingModalVisible(true);
  }, []);

  // Moderate listing
  const handleModerateListing = useCallback(async (id, action) => {
    dispatch({ type: 'FETCH_START' });
    try {
      await moderateListing(id, action);
      
      // Update listing status
      dispatch({ 
        type: 'UPDATE_LISTING_STATUS', 
        payload: { 
          id,
          status: action === 'approve' ? 'approved' : 
                 action === 'reject' ? 'rejected' : 'pending'
        } 
      });
      
      setListingModalVisible(false);
      
      Toast.show({
        type: 'success',
        text1: 'Action effectuée',
        text2: action === 'approve' ? 'Annonce approuvée' : 
               action === 'reject' ? 'Annonce rejetée' : 'Annonce réinitialisée',
        visibilityTime: 2000,
        topOffset: 50
      });
    } catch (error) {
      console.error('Error moderating listing:', error);
      dispatch({ type: 'FETCH_ERROR', payload: error.message });
      
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Une erreur est survenue lors de la modération',
        visibilityTime: 3000,
        topOffset: 50
      });
    }
  }, []);

  // Block/unblock user
  const handleBlockUser = useCallback(async (userId, isBlocked) => {
    try {
      await blockUser(userId, !isBlocked);
      
      // Update user status
      dispatch({ 
        type: 'UPDATE_USER_STATUS', 
        payload: { 
          id: userId,
          isBlocked: !isBlocked
        } 
      });
      
      Toast.show({
        type: 'success',
        text1: 'Action effectuée',
        text2: isBlocked ? 'Utilisateur débloqué' : 'Utilisateur bloqué',
        visibilityTime: 2000,
        topOffset: 50
      });
    } catch (error) {
      console.error('Error toggling user block status:', error);
      
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Une erreur est survenue',
        visibilityTime: 3000,
        topOffset: 50
      });
    }
  }, []);

  // Handle user role change
  const handleRoleChange = useCallback((user) => {
    Alert.alert(
      'Confirmation',
      `Voulez-vous modifier le rôle de ${user.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer',
          onPress: () => {
            // Implementation for role change
            Toast.show({
              type: 'success',
              text1: 'Rôle modifié',
              visibilityTime: 2000,
              topOffset: 50
            });
          }
        }
      ]
    );
  }, []);

  // System reset
  const handleSystemReset = useCallback(async () => {
    setResetConfirmModalVisible(false);
    dispatch({ type: 'FETCH_START' });
    
    try {
      await resetSystem();
      
      Toast.show({
        type: 'success',
        text1: 'Système réinitialisé',
        text2: 'Les données ont été effacées pour la nouvelle année',
        visibilityTime: 3000,
        topOffset: 50
      });
      
      // Reload data after reset
      await loadData();
    } catch (error) {
      console.error('Error resetting system:', error);
      dispatch({ type: 'FETCH_ERROR', payload: error.message });
      
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible de réinitialiser le système',
        visibilityTime: 3000,
        topOffset: 50
      });
    }
  }, [loadData]);

  // Filter listings based on selected status
  const filteredListings = useCallback(() => {
    return filterStatus === 'all' 
      ? listings 
      : listings.filter(listing => listing.status === filterStatus);
  }, [listings, filterStatus]);

  // Moved renderSettings inside AdminDashboard
  const renderSettings = useCallback(() => {
    return (
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setActiveTab('dashboard')}
            accessibilityRole="button"
            accessibilityLabel="Retour"
          >
            <Ionicons name="arrow-back" size={24} color={theme.textColor} />
          </TouchableOpacity>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            Paramètres
          </Text>
        </View>

        {/* Profil Administrateur */}
        <View style={[styles.settingsSection, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.settingsSectionTitle, { color: theme.textColor }]}>
            Profil Administrateur
          </Text>
          <View style={styles.adminProfileContainer}>
            <View style={styles.adminAvatarContainer}>
              <View style={styles.adminAvatar}>
                <Text style={styles.adminAvatarText}>
                  {adminInfo.name.substring(0, 2).toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.adminInfoContainer}>
              <Text style={[styles.adminName, { color: theme.textColor }]}>
                {adminInfo.name}
              </Text>
              <Text style={[styles.adminEmail, { color: theme.textSecondary }]}>
                {adminInfo.email}
              </Text>
              <View style={styles.adminDetailRow}>
                <Text style={[styles.adminDetailLabel, { color: theme.textSecondary }]}>
                  Rôle:
                </Text>
                <Text style={[styles.adminDetailValue, { color: theme.textColor }]}>
                  {adminInfo.role}
                </Text>
              </View>
              <View style={styles.adminDetailRow}>
                <Text style={[styles.adminDetailLabel, { color: theme.textSecondary }]}>
                  Dernière connexion:
                </Text>
                <Text style={[styles.adminDetailValue, { color: theme.textColor }]}>
                  {adminInfo.lastLogin}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Autres options de paramètres */}
        <View style={[styles.settingsSection, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.settingsSectionTitle, { color: theme.textColor }]}>
            Options générales
          </Text>
          
          <TouchableOpacity style={styles.settingsOption}>
            <View style={styles.settingsOptionContent}>
              <Feather name="shield" size={20} color={theme.textColor} />
              <Text style={[styles.settingsOptionText, { color: theme.textColor }]}>
                Sécurité et confidentialité
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingsOption}>
            <View style={styles.settingsOptionContent}>
              <Feather name="bell" size={20} color={theme.textColor} />
              <Text style={[styles.settingsOptionText, { color: theme.textColor }]}>
                Notifications
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingsOption}>
            <View style={styles.settingsOptionContent}>
              <Feather name="moon" size={20} color={theme.textColor} />
              <Text style={[styles.settingsOptionText, { color: theme.textColor }]}>
                Mode sombre
              </Text>
            </View>
            <View style={styles.switchContainer}>
              <Text style={{ color: theme.textSecondary, marginRight: 10 }}>
                {darkMode ? 'Activé' : 'Désactivé'}
              </Text>
              {/* Ici vous pouvez ajouter un Switch pour le thème sombre */}
            </View>
          </TouchableOpacity>
        </View>

        {/* Bouton de déconnexion */}
        <View style={styles.logoutButtonContainer}>
          <TouchableOpacity 
            style={styles.logoutFullButton}
            onPress={handleLogout}
            accessibilityRole="button"
            accessibilityLabel="Se déconnecter"
          >
            <Feather name="log-out" size={20} color="#FFFFFF" />
            <Text style={styles.logoutFullButtonText}>
              Se déconnecter
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [adminInfo, theme, darkMode, handleLogout]);

  // Dashboard view
  const renderDashboard = useCallback(() => (
    <View style={styles.contentContainer}>
      <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
        Tableau de bord administrateur
      </Text>
      
      {statistics ? (
        <View style={styles.statsContainer}>
          <StatCard 
            value={statistics.totalUsers} 
            label="Utilisateurs"
            backgroundColor={theme.cardBackground}
            valueColor={theme.primaryColor}
            labelColor={theme.textSecondary}
          />
          
          <StatCard 
            value={statistics.activeListings} 
            label="Annonces actives"
            backgroundColor={theme.cardBackground}
            valueColor={theme.primaryColor}
            labelColor={theme.textSecondary}
          />
          
          <StatCard 
            value={statistics.pendingModeration} 
            label="En attente de modération"
            backgroundColor={theme.cardBackground}
            valueColor={theme.primaryColor}
            labelColor={theme.textSecondary}
          />
          
          <StatCard 
            value={statistics.exchangesCompleted} 
            label="Échanges complétés"
            backgroundColor={theme.cardBackground}
            valueColor={theme.primaryColor}
            labelColor={theme.textSecondary}
          />
        </View>
      ) : (
        <Text style={[styles.noDataText, { color: theme.textSecondary }]}>
          Chargement des statistiques...
        </Text>
      )}

      <View style={styles.actionButtonsContainer}>
        <ActionButton 
          icon={<MaterialIcons name="list-alt" size={24} color="#FFFFFF" />}
          text="Gérer les annonces"
          color="#836EFE"
          onPress={() => setActiveTab('listings')}
        />
        
        <ActionButton 
          icon={<Feather name="users" size={24} color="#FFFFFF" />}
          text="Gérer les utilisateurs"
          color="#53C1DE"
          onPress={() => setActiveTab('users')}
        />
        
        <ActionButton 
          icon={<Ionicons name="refresh-circle" size={24} color="#FFFFFF" />}
          text="Réinitialiser le système"
          color="#FF6347"
          onPress={() => setResetConfirmModalVisible(true)}
        />
      </View>

      <View style={styles.recentActivityContainer}>
        <Text style={[styles.sectionSubtitle, { color: theme.textColor }]}>
          Activité récente
        </Text>
        
        {listings && listings.length > 0 ? (
          <FlatList
            data={listings.slice(0, 3)}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <ActivityItem 
                item={item} 
                onView={handleViewListing}
                theme={theme}
              />
            )}
          />
        ) : (
          <Text style={[styles.noDataText, { color: theme.textSecondary }]}>
            Aucune activité récente
          </Text>
        )}
      </View>
    </View>
  ), [statistics, listings, theme, handleViewListing]);

  // Listings view
  const renderListings = useCallback(() => {
    const listingsToDisplay = filteredListings();
      
    return (
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setActiveTab('dashboard')}
            accessibilityRole="button"
            accessibilityLabel="Retour"
          >
            <Ionicons name="arrow-back" size={24} color={theme.textColor} />
          </TouchableOpacity>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            Gestion des annonces
          </Text>
        </View>

        <View style={styles.filterContainer}>
          <FilterButton 
            label="Toutes"
            isActive={filterStatus === 'all'}
            onPress={() => handleFilterChange('all')}
          />
          
          <FilterButton 
            label="En attente"
            isActive={filterStatus === 'pending'}
            onPress={() => handleFilterChange('pending')}
          />
          
          <FilterButton 
            label="Approuvées"
            isActive={filterStatus === 'approved'}
            onPress={() => handleFilterChange('approved')}
          />
          
          <FilterButton 
            label="Rejetées"
            isActive={filterStatus === 'rejected'}
            onPress={() => handleFilterChange('rejected')}
          />
        </View>

        {listingsToDisplay && listingsToDisplay.length > 0 ? (
          <FlatList
            data={listingsToDisplay}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <ListingItem 
                item={item}
                onView={handleViewListing}
                onModerate={handleModerateListing}
                theme={theme}
              />
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#836EFE']}
                tintColor={theme.primaryColor}
              />
            }
            contentContainerStyle={
              listingsToDisplay.length === 0 ? { flex: 1 } : null
            }
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <MaterialIcons name="inbox" size={48} color={theme.textSecondary} />
            <Text style={[styles.noDataText, { color: theme.textSecondary }]}>
              Aucune annonce trouvée
            </Text>
          </View>
        )}
      </View>
    );
  }, [
    filteredListings, 
    filterStatus, 
    refreshing, 
    theme, 
    handleFilterChange, 
    handleViewListing, 
    handleModerateListing, 
    onRefresh
  ]);

  // Users view
  const renderUsers = useCallback(() => {
    return (
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setActiveTab('dashboard')}
            accessibilityRole="button"
            accessibilityLabel="Retour"
          >
            <Ionicons name="arrow-back" size={24} color={theme.textColor} />
          </TouchableOpacity>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            Gestion des utilisateurs
          </Text>
        </View>

        {users && users.length > 0 ? (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <UserItem 
                item={item}
                onBlockToggle={handleBlockUser}
                onRoleChange={handleRoleChange}
                theme={theme}
              />
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#836EFE']}
                tintColor={theme.primaryColor}
              />
            }
            contentContainerStyle={
              users.length === 0 ? { flex: 1 } : null
            }
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <MaterialIcons name="person-outline" size={48} color={theme.textSecondary} />
            <Text style={[styles.noDataText, { color: theme.textSecondary }]}>
              Aucun utilisateur trouvé
            </Text>
          </View>
        )}
      </View>
    );
  }, [
    users, 
    refreshing, 
    theme, 
    handleBlockUser, 
    handleRoleChange, 
    onRefresh
  ]);

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
      edges={['top', 'left', 'right']}
    >
      {Platform.OS === 'android' && (
        <StatusBar
          backgroundColor={theme.backgroundColor}
          barStyle={darkMode ? 'light-content' : 'dark-content'}
        />
      )}
      <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.textColor }]}>
            Tableau de bord admin
          </Text>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            accessibilityRole="button"
            accessibilityLabel="Se déconnecter"
          >
            <Feather name="log-out" size={20} color={theme.textColor} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.mainContent}>
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#836EFE" />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Chargement...
            </Text>
          </View>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'listings' && renderListings()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'settings' && renderSettings()}
          </>
        )}
      </View>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { 
        backgroundColor: theme.cardBackground,
        borderTopColor: theme.borderColor 
      }]}>
        <NavItem 
          icon={(color) => (
            <MaterialIcons name="dashboard" size={24} color={color} />
          )}
          label="Tableau"
          isActive={activeTab === 'dashboard'}
          onPress={() => setActiveTab('dashboard')}
          activeColor="#836EFE"
          inactiveColor={theme.textSecondary}
        />
        
        <NavItem 
          icon={(color) => (
            <MaterialIcons name="list-alt" size={24} color={color} />
          )}
          label="Annonces"
          isActive={activeTab === 'listings'}
          onPress={() => setActiveTab('listings')}
          activeColor="#836EFE"
          inactiveColor={theme.textSecondary}
        />
        
        <NavItem 
          icon={(color) => (
            <Feather name="users" size={24} color={color} />
          )}
          label="Utilisateurs"
          isActive={activeTab === 'users'}
          onPress={() => setActiveTab('users')}
          activeColor="#836EFE"
          inactiveColor={theme.textSecondary}
        />
        
        <NavItem 
          icon={(color) => (
            <Feather name="settings" size={24} color={color} />
          )}
          label="Paramètres"
          isActive={activeTab === 'settings'}
          onPress={() => setActiveTab('settings')}
          activeColor="#836EFE"
          inactiveColor={theme.textSecondary}
        />
      </View>

      {/* Listing Detail Modal */}
      <Modal
        visible={listingModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setListingModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { 
            backgroundColor: theme.cardBackground,
            borderColor: theme.borderColor 
          }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.borderColor }]}>
              <Text style={[styles.modalTitle, { color: theme.textColor }]}>
                Détails de l'annonce
              </Text>
              <TouchableOpacity 
                onPress={() => setListingModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Fermer"
              >
                <Feather name="x" size={24} color={theme.textColor} />
              </TouchableOpacity>
            </View>
            
            {selectedListing && (
              <ScrollView 
                style={styles.modalBody}
                showsVerticalScrollIndicator={false}
              >
                <Text style={[styles.listingDetailTitle, { color: theme.textColor }]}>
                  {selectedListing.title}
                </Text>
                
                <View style={styles.listingDetailMeta}>
                  <View style={[
                    styles.listingStatusBadge,
                    { 
                      backgroundColor: 
                        selectedListing.status === 'pending' ? '#FFA500' : 
                        selectedListing.status === 'approved' ? '#4CAF50' : '#FF6347'
                    }
                  ]}>
                    <Text style={styles.listingStatusBadgeText}>
                      {selectedListing.status === 'pending' ? 'En attente' : 
                       selectedListing.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                    </Text>
                  </View>
                  <Text style={[styles.listingDetailDate, { color: theme.textSecondary }]}>
                    {new Date(selectedListing.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                
                <View style={styles.listingDetailSection}>
                  <Text style={[styles.listingDetailSectionTitle, { color: theme.textColor }]}>
                    Informations du posteur
                  </Text>
                  <View style={[styles.listingDetailCard, { backgroundColor: theme.backgroundColor }]}>
                    <Text style={[styles.listingDetailUser, { color: theme.textColor }]}>
                      {selectedListing.userName}
                    </Text>
                    <Text style={[styles.listingDetailEmail, { color: theme.textSecondary }]}>
                      {selectedListing.userEmail}
                    </Text>
                    <Text style={[styles.listingDetailPhone, { color: theme.textSecondary }]}>
                      {selectedListing.userPhone || 'Pas de téléphone renseigné'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.listingDetailSection}>
                  <Text style={[styles.listingDetailSectionTitle, { color: theme.textColor }]}>
                    Description
                  </Text>
                  <Text style={[styles.listingDetailDescription, { color: theme.textColor }]}>
                    {selectedListing.description}
                  </Text>
                </View>
                
                <View style={styles.listingDetailSection}>
                  <Text style={[styles.listingDetailSectionTitle, { color: theme.textColor }]}>
                    Catégorie et type
                  </Text>
                  <View style={styles.listingDetailTags}>
                    <View style={styles.listingDetailTag}>
                      <Text style={styles.listingDetailTagText}>
                        {selectedListing.category}
                      </Text>
                    </View>
                    <View style={styles.listingDetailTag}>
                      <Text style={styles.listingDetailTagText}>
                        {selectedListing.type}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.listingDetailSection}>
                  <Text style={[styles.listingDetailSectionTitle, { color: theme.textColor }]}>
                    Images
                  </Text>
                  {selectedListing.images && selectedListing.images.length > 0 ? (
                    <FlatList 
                      horizontal 
                      data={selectedListing.images}
                      keyExtractor={(item, index) => `image-${index}`}
                      showsHorizontalScrollIndicator={false}
                      renderItem={({ item }) => (
                        <Image 
                          source={{ uri: item }} 
                          style={styles.listingDetailImage}
                          resizeMode="cover"
                        />
                      )}
                      contentContainerStyle={styles.listingImagesContainer}
                    />
                  ) : (
                    <Text style={[styles.noImagesText, { color: theme.textSecondary }]}>
                      Aucune image disponible
                    </Text>
                  )}
                </View>
                
                <View style={styles.modalActions}>
                  {selectedListing.status === 'pending' ? (
                    <>
                      <Button
                        buttonText="Approuver"
                        onPress={() => handleModerateListing(selectedListing.id, 'approve')}
                        disabled={loading}
                        buttonStyle={styles.approveButton}
                        accessibilityLabel="Approuver l'annonce"
                      />
                      <Button
                        buttonText="Rejeter"
                        onPress={() => handleModerateListing(selectedListing.id, 'reject')}
                        disabled={loading}
                        buttonStyle={styles.rejectButton}
                        textStyle={styles.rejectButtonText}
                        accessibilityLabel="Rejeter l'annonce"
                      />
                    </>
                  ) : (
                    <Button
                      buttonText="Réinitialiser l'état"
                      onPress={() => handleModerateListing(selectedListing.id, 'reset')}
                      disabled={loading}
                      buttonStyle={styles.resetButton}
                      accessibilityLabel="Réinitialiser l'état de l'annonce"
                    />
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        visible={resetConfirmModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setResetConfirmModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.confirmModalContent, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.warningIconContainer}>
              <MaterialIcons name="warning" size={50} color="#FFA500" />
            </View>
            
            <Text style={[styles.confirmModalTitle, { color: theme.textColor }]}>
              Réinitialiser le système
            </Text>
            
            <Text style={[styles.confirmModalText, { color: theme.textSecondary }]}>
              Cette action réinitialisera toutes les données pour la nouvelle année scolaire. Toutes les annonces et les interactions passées seront archivées et non accessibles aux utilisateurs.
            </Text>
            <Text style={[styles.confirmModalText, { color: theme.textSecondary }]}>
              Êtes-vous sûr de vouloir continuer?
            </Text>
            
            <View style={styles.confirmModalActions}>
              <TouchableOpacity 
                style={[styles.confirmModalButton, styles.cancelButton]}
                onPress={() => setResetConfirmModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Annuler"
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.confirmModalButton, styles.confirmButton]}
                onPress={handleSystemReset}
                accessibilityRole="button"
                accessibilityLabel="Confirmer la réinitialisation"
              >
                <Text style={styles.confirmButtonText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {loading && !refreshing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_700Bold',
  },
  logoutButton: {
    padding: 8,
  },
  mainContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'SourceSansPro_400Regular',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'Montserrat_700Bold',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    fontFamily: 'Montserrat_700Bold',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'SourceSansPro_400Regular',
  },
  actionButtonsContainer: {
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    fontFamily: 'Montserrat_600SemiBold',
  },
  recentActivityContainer: {
    marginTop: 10,
  },
  sectionSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    fontFamily: 'Montserrat_600SemiBold',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  activityMeta: {
    fontSize: 13,
    marginBottom: 2,
    fontFamily: 'SourceSansPro_400Regular',
  },
  activityStatus: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'SourceSansPro_600SemiBold',
  },
  viewButton: {
    backgroundColor: '#836EFE',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 10,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    padding: 20,
    fontFamily: 'SourceSansPro_400Regular',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 8,
    backgroundColor: 'rgba(131, 110, 254, 0.1)',
  },
  filterButtonActive: {
    backgroundColor: '#836EFE',
  },
  filterText: {
    color: '#836EFE',
    fontSize: 14,
    fontFamily: 'SourceSansPro_600SemiBold',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listingItem: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listingItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    fontFamily: 'Montserrat_600SemiBold',
  },
  listingStatus: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
    fontFamily: 'SourceSansPro_600SemiBold',
  },
  listingMeta: {
    fontSize: 13,
    marginBottom: 8,
    fontFamily: 'SourceSansPro_400Regular',
  },
  listingDescription: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'SourceSansPro_400Regular',
  },
  listingCategory: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryLabel: {
    fontSize: 14,
    fontFamily: 'SourceSansPro_400Regular',
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'SourceSansPro_600SemiBold',
  },
  listingActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  actionButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 8,
  },
  viewActionButton: {
    backgroundColor: '#836EFE',
  },
  approveActionButton: {
    backgroundColor: '#4CAF50',
  },
  rejectActionButton: {
    backgroundColor: '#FF6347',
  },
  resetActionButton: {
    backgroundColor: '#FFA500',
  },
  actionButtonSmallText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 5,
    fontFamily: 'Montserrat_500Medium',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  userItem: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userItemContent: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#836EFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userInitials: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_700Bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 6,
    fontFamily: 'SourceSansPro_400Regular',
  },
  userDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  userDetailLabel: {
    fontSize: 14,
    marginRight: 5,
    fontFamily: 'SourceSansPro_400Regular',
  },
  userDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'SourceSansPro_600SemiBold',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  userActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 8,
  },
  userActionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 5,
    fontFamily: 'Montserrat_500Medium',
  },
  bottomNav: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 12,
    marginTop: 3,
    fontFamily: 'SourceSansPro_400Regular',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_700Bold',
  },
  modalBody: {
    marginBottom: 20,
  },
  listingDetailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'Montserrat_700Bold',
  },
  listingDetailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  listingStatusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  listingStatusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  listingDetailDate: {
    fontSize: 14,
    fontFamily: 'SourceSansPro_400Regular',
  },
  listingDetailSection: {
    marginBottom: 20,
  },
  listingDetailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    fontFamily: 'Montserrat_600SemiBold',
  },
  listingDetailCard: {
    padding: 12,
    borderRadius: 8,
  },
  listingDetailUser: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
    fontFamily: 'Montserrat_500Medium',
  },
  listingDetailEmail: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'SourceSansPro_400Regular',
  },
  listingDetailPhone: {
    fontSize: 14,
    fontFamily: 'SourceSansPro_400Regular',
  },
  listingDetailDescription: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'SourceSansPro_400Regular',
  },
  listingDetailTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  listingDetailTag: {
    backgroundColor: '#836EFE',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  listingDetailTagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'SourceSansPro_400Regular',
  },
  listingImagesContainer: {
    paddingRight: 10,
  },
  listingDetailImage: {
    width: 200,
    height: 150,
    marginRight: 10,
    borderRadius: 8,
  },
  noImagesText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 10,
    fontFamily: 'SourceSansPro_400Regular',
  },
  modalActions: {
    marginTop: 10,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
    marginBottom: 10,
  },
  rejectButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FF6347',
    marginBottom: 10,
  },
  rejectButtonText: {
    color: '#FF6347',
  },
  resetButton: {
    backgroundColor: '#FFA500',
  },
  confirmModalContent: {
    width: '90%',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  warningIconContainer: {
    marginBottom: 15,
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'Montserrat_700Bold',
  },
  confirmModalText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
    fontFamily: 'SourceSansPro_400Regular',
  },
  confirmModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  confirmModalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F2F2F2',
  },
  cancelButtonText: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  confirmButton: {
    backgroundColor: '#FF6347',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  settingsSection: {
    borderRadius: 10,
    marginBottom: 20,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    fontFamily: 'Montserrat_600SemiBold',
  },
  adminProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  adminAvatarContainer: {
    marginRight: 15,
  },
  adminAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#836EFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminAvatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_700Bold',
  },
  adminInfoContainer: {
    flex: 1,
  },
  adminName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    fontFamily: 'Montserrat_600SemiBold',
  },
  adminEmail: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'SourceSansPro_400Regular',
  },
  adminDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  adminDetailLabel: {
    fontSize: 14,
    marginRight: 6,
    fontFamily: 'SourceSansPro_400Regular',
  },
  adminDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'SourceSansPro_600SemiBold',
  },
  settingsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingsOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsOptionText: {
    fontSize: 16,
    marginLeft: 12,
    fontFamily: 'SourceSansPro_400Regular',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButtonContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  logoutFullButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutFullButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
});

export default AdminDashboard;