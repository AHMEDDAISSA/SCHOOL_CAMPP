import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import { FlatList } from 'react-native';

// Components
import StatCard from './StatCard';
import ActionButton from './ActionButton';
import ActivityItem from './ActivityItem';

// Styles
import styles from '../styles';

const DashboardView = ({ 
  theme, 
  statistics, 
  listings, 
  onViewListing, 
  onTabChange,
  onResetSystem 
}) => {
  return (
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
          onPress={() => onTabChange('listings')}
        />
        
        <ActionButton 
          icon={<Feather name="users" size={24} color="#FFFFFF" />}
          text="Gérer les utilisateurs"
          color="#53C1DE"
          onPress={() => onTabChange('users')}
        />
        
        <ActionButton 
          icon={<Ionicons name="refresh-circle" size={24} color="#FFFFFF" />}
          text="Réinitialiser le système"
          color="#FF6347"
          onPress={onResetSystem}
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
                onView={onViewListing}
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
  );
};

export default DashboardView;