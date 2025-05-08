import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Text,
  StatusBar,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import ThemeContext from '../../../theme/ThemeContext';
import Toast from 'react-native-toast-message';

// Hooks
import useAuth from './hooks/useAuth';
import useAdminData from './hooks/useAdminData';
import useModerationActions from './hooks/useModerationActions';

// Components
import DashboardView from './components/DashboardView';
import ListingsView from './components/ListingsView';
import UsersView from './components/UsersView';
import ListingModal from './components/ListingModal';
import ResetConfirmModal from './components/ResetConfirmModal';
import NavItem from './components/NavItem';

// Styles
import styles from './styles';

const AdminDashboard = () => {
  const { theme, darkMode } = useContext(ThemeContext);
  const { handleLogout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedListing, setSelectedListing] = useState(null);
  const [listingModalVisible, setListingModalVisible] = useState(false);
  const [resetConfirmModalVisible, setResetConfirmModalVisible] = useState(false);
  
  const { 
    state, 
    loadData, 
    onRefresh, 
    handleFilterChange 
  } = useAdminData();

  const {
    handleModerateListing,
    handleBlockUser,
    handleRoleChange,
    handleSystemReset
  } = useModerationActions(loadData, () => setResetConfirmModalVisible(false));

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
  }, [loadData]);

  // View listing details
  const handleViewListing = (listing) => {
    setSelectedListing(listing);
    setListingModalVisible(true);
  };

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
            {activeTab === 'dashboard' && (
              <DashboardView 
                theme={theme} 
                statistics={statistics} 
                listings={listings}
                onViewListing={handleViewListing}
                onTabChange={setActiveTab}
                onResetSystem={() => setResetConfirmModalVisible(true)}
              />
            )}
            {activeTab === 'listings' && (
              <ListingsView 
                theme={theme} 
                listings={listings}
                filterStatus={filterStatus}
                refreshing={refreshing}
                onRefresh={onRefresh}
                onFilterChange={handleFilterChange}
                onViewListing={handleViewListing}
                onModerate={handleModerateListing}
                onBackToMain={() => setActiveTab('dashboard')}
              />
            )}
            {activeTab === 'users' && (
              <UsersView 
                theme={theme} 
                users={users}
                refreshing={refreshing}
                onRefresh={onRefresh}
                onBlockToggle={handleBlockUser}
                onRoleChange={handleRoleChange}
                onBackToMain={() => setActiveTab('dashboard')}
              />
            )}
          </>
        )}
      </View>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { 
        backgroundColor: theme.cardBackground,
        borderTopColor: theme.borderColor 
      }]}>
        <NavItem 
          icon={(color) => <Feather name="home" size={24} color={color} />}
          label="Tableau"
          isActive={activeTab === 'dashboard'}
          onPress={() => setActiveTab('dashboard')}
          activeColor="#836EFE"
          inactiveColor={theme.textSecondary}
        />
        
        <NavItem 
          icon={(color) => <Feather name="list" size={24} color={color} />}
          label="Annonces"
          isActive={activeTab === 'listings'}
          onPress={() => setActiveTab('listings')}
          activeColor="#836EFE"
          inactiveColor={theme.textSecondary}
        />
        
        <NavItem 
          icon={(color) => <Feather name="users" size={24} color={color} />}
          label="Utilisateurs"
          isActive={activeTab === 'users'}
          onPress={() => setActiveTab('users')}
          activeColor="#836EFE"
          inactiveColor={theme.textSecondary}
        />
        
        <NavItem 
          icon={(color) => <Feather name="settings" size={24} color={color} />}
          label="Paramètres"
          isActive={activeTab === 'settings'}
          onPress={() => {
            Toast.show({
              type: 'info',
              text1: 'Bientôt disponible',
              text2: 'Cette fonctionnalité sera disponible prochainement',
              visibilityTime: 2000,
              topOffset: 50
            });
          }}
          activeColor="#836EFE"
          inactiveColor={theme.textSecondary}
        />
      </View>

      {/* Modals */}
      <ListingModal
        visible={listingModalVisible}
        listing={selectedListing}
        theme={theme}
        loading={loading}
        onClose={() => setListingModalVisible(false)}
        onModerate={handleModerateListing}
      />

      <ResetConfirmModal
        visible={resetConfirmModalVisible}
        theme={theme}
        onCancel={() => setResetConfirmModalVisible(false)}
        onConfirm={handleSystemReset}
      />

      {/* Loading Overlay */}
      {loading && !refreshing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
    </SafeAreaView>
  );
};

export default AdminDashboard;