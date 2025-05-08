import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { RefreshControl } from 'react-native';

// Components
import FilterButton from './FilterButton';
import ListingItem from './ListingItem';

// Styles
import styles from '../styles';

const ListingsView = ({ 
  theme, 
  listings, 
  filterStatus, 
  refreshing, 
  onRefresh, 
  onFilterChange, 
  onViewListing, 
  onModerate, 
  onBackToMain 
}) => {
  
  // Filter listings based on selected status
  const filteredListings = filterStatus === 'all' 
    ? listings 
    : listings.filter(listing => listing.status === filterStatus);
  
  return (
    <View style={styles.contentContainer}>
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBackToMain}
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
          onPress={() => onFilterChange('all')}
        />
        
        <FilterButton 
          label="En attente"
          isActive={filterStatus === 'pending'}
          onPress={() => onFilterChange('pending')}
        />
        
        <FilterButton 
          label="Approuvées"
          isActive={filterStatus === 'approved'}
          onPress={() => onFilterChange('approved')}
        />
        
        <FilterButton 
          label="Rejetées"
          isActive={filterStatus === 'rejected'}
          onPress={() => onFilterChange('rejected')}
        />
      </View>

      {filteredListings && filteredListings.length > 0 ? (
        <FlatList
          data={filteredListings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ListingItem 
              item={item}
              onView={onViewListing}
              onModerate={onModerate}
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
            filteredListings.length === 0 ? { flex: 1 } : null
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
};

export default ListingsView;