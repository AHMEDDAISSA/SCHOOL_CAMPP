import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { RefreshControl } from 'react-native';

// Components
import UserItem from './UserItem';

// Styles
import styles from '../styles';

const UsersView = ({ 
  theme, 
  users, 
  refreshing, 
  onRefresh, 
  onBlockToggle, 
  onRoleChange, 
  onBackToMain 
}) => {
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
              onBlockToggle={onBlockToggle}
              onRoleChange={onRoleChange}
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
};

export default UsersView;