import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import React, { useContext } from 'react';
import { Ionicons } from '@expo/vector-icons';
import ThemeContext from '../../theme/ThemeContext';
import Toast from 'react-native-toast-message';

const Profile_logout = () => {
  const { theme, darkMode, logout } = useContext(ThemeContext);

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter? Toutes vos données seront effacées de cet appareil.",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Déconnexion",
          style: "destructive",
          onPress: async () => {
            const success = await logout();
            if (success) {
              Toast.show({
                type: 'success',
                text1: 'Déconnecté avec succès',
                text2: 'À bientôt!',
                visibilityTime: 3000
              });
            } else {
              Toast.show({
                type: 'error',
                text1: 'Erreur de déconnexion',
                text2: 'Veuillez réessayer',
                visibilityTime: 3000
              });
            }
          }
        }
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.logoutButton,
        { backgroundColor: darkMode ? theme.cardbg : '#F1F1F1' }
      ]}
      onPress={handleLogout}
    >
      <Ionicons name="log-out-outline" size={24} color="#EB001B" />
      <Text style={styles.logoutText}>Se déconnecter</Text>
    </TouchableOpacity>
  );
};

export default Profile_logout;

const styles = StyleSheet.create({
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F1F1',
    borderRadius: 10,
    padding: 16,
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 30
  },
  logoutText: {
    color: '#EB001B',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    marginLeft: 10
  }
});
