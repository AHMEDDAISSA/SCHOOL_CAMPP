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
  
  const { theme, resetProfileImage, clearProfileData } = themeContext;

  const handleLogout = async () => {
    setModalVisible(true);
    await clearProfileData();
  };

  const confirmLogout = () => {
    
    if (typeof resetProfileImage === 'function') {
      resetProfileImage();
      
      Toast.show({
        type: 'success',
        text1: 'Déconnexion réussie',
        text2: 'À bientôt !',
      });
    } else {
      console.error("resetProfileImage n'est pas une fonction");
    }
    
    setModalVisible(false);
    router.replace('/lets'); 
  };
  
  const cancelLogout = () => {
    setModalVisible(false);
  };

  return (
    <View>
      <View style={styles.logout_container}>
        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <Text style={[styles.logout_text, { color: theme.text }]}>Déconnexion</Text>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={cancelLogout}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalView, { backgroundColor: theme.cardbg2 }]}>
            <Text style={styles.modalText}>Êtes-vous sûr de vouloir vous déconnecter ?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.button} onPress={confirmLogout}>
                <Text style={styles.buttonText}>Oui</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonCancel]} onPress={cancelLogout}>
                <Text style={styles.buttonText}>Non</Text>
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
  logout_container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  logout: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#836EFE',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 50,
    minHeight: 56,
    maxHeight: 56,
  },
  logout_text: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#000000',
    textTransform: 'capitalize',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  buttonCancel: {
    backgroundColor: '#757575',
  },
  button: {
    backgroundColor: '#FF007E',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  buttonText: {
    color: '#ffffff',
  },
});
