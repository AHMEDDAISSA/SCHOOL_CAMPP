import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

// Styles
import styles from '../styles';

const UserItem = ({ item, onBlockToggle, onRoleChange, theme }) => (
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
);

export default React.memo(UserItem);