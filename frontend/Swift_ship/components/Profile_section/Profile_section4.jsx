import { StyleSheet, Text, View, TouchableOpacity, Modal } from 'react-native';
import React, { useContext, useState } from 'react';
import ThemeContext from '../../theme/ThemeContext';
import { Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

const Profile_section4 = () => {
  const [modalVisible, setModalVisible] = useState(false);
  
  const themeContext = useContext(ThemeContext);
  
  if (!themeContext) {
    return (
      <View style={styles.logout_container}>
        <Text>Chargement...</Text>
      </View>
    );
  }
  
  const { theme, resetProfileImage, clearProfileData, darkMode } = themeContext;

  const handleLogout = async () => {
    setModalVisible(true);
  };

  const confirmLogout = async () => {
    if (typeof clearProfileData === 'function') {
      await clearProfileData();
      
      if (typeof resetProfileImage === 'function') {
        resetProfileImage();
      }
      
      Toast.show({
        type: 'success',
        text1: 'Déconnexion réussie',
        text2: 'À bientôt !',
      });
    }
    
    setModalVisible(false);
    router.replace('/lets');
  };
  
  const cancelLogout = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.logout_container}>
        <TouchableOpacity 
          style={[styles.logout, { 
            backgroundColor: '#836EFE',
            shadowColor: darkMode ? 'rgba(131, 110, 254, 0.5)' : 'rgba(131, 110, 254, 0.3)',
          }]} 
          onPress={handleLogout}
        >
          <Text style={[styles.logout_text, { color: '#FFFFFF' }]}>Déconnexion</Text>
        </TouchableOpacity>
      </View>
      
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={cancelLogout}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalView, { 
            backgroundColor: darkMode ? '#222' : '#fff',
            shadowColor: darkMode ? '#000' : '#000',
          }]}>
            <Text style={[styles.modalText, { color: darkMode ? '#fff' : '#000' }]}>
              Êtes-vous sûr de vouloir vous déconnecter ?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.buttonCancel]} 
                onPress={cancelLogout}
              >
                <Text style={styles.buttonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: '#836EFE' }]} 
                onPress={confirmLogout}
              >
                <Text style={styles.buttonText}>Déconnexion</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Profile_section4;

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  logout_container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  logout: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#836EFE',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 50,
    minHeight: 56,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    width: '80%',
  },
  logout_text: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    width: '80%',
    maxWidth: 320,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 25,
    textAlign: 'center',
    fontFamily: 'Montserrat_600SemiBold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  buttonCancel: {
    backgroundColor: '#757575',
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14,
  },
});