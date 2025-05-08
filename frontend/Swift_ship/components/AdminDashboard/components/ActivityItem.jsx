import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// Styles
import styles from '../styles';

const ActivityItem = ({ item, onView, theme }) => (
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
);

export default React.memo(ActivityItem);