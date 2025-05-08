import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

// Styles
import styles from '../styles';

const ListingItem = ({ item, onView, onModerate, theme }) => (
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
);

export default React.memo(ListingItem);