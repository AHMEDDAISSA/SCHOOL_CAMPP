import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Platform, Dimensions, StatusBar } from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import Back from "../../assets/images/back.svg";
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import Profile from "../../assets/images/anny.jpg";
import Edit from "../../assets/images/Edit.svg";
import Profile_setup_section2 from '../../components/Profile_setup/Profile_setup_section2';
import ThemeContext from '../../theme/ThemeContext';
import { router, useLocalSearchParams } from "expo-router";
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const ProfileSetup = () => {
  const { email, userId } = useLocalSearchParams();
  
  const { theme, darkMode, updateProfileImage, profileData } = useContext(ThemeContext);
  // Initialiser l'image à null pour la réinitialiser à chaque montage du composant
  const [image, setImage] = useState(null);
  
  // Supprimer useEffect qui met à jour l'image depuis profileData
  // Cela empêche la persistance de l'image entre les utilisations

  const back = () => {
    router.push('signup');
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert("Nous avons besoin de l'autorisation pour accéder à votre galerie");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      setImage(imageUri);
      updateProfileImage(imageUri);
    }
  };

  // Fonction de réinitialisation qui pourrait être appelée à d'autres moments si nécessaire
  const resetImage = () => {
    setImage(null);
    updateProfileImage(null); // Réinitialiser aussi dans le contexte
  };

  // Utiliser useEffect avec un tableau de dépendances vide pour réinitialiser à chaque montage
  useEffect(() => {
    resetImage();
    // Cette fonction s'exécutera à chaque montage du composant
    return () => {
      // Vous pouvez aussi ajouter une logique de nettoyage ici si nécessaire
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={back} style={styles.backButton}>
          <Back fill={theme.color} />
        </TouchableOpacity>
        <Text style={[styles.heading, { color: theme.color }]}>
          Compléter votre profil
        </Text>
        <Toast/>
      </View>

      <View style={styles.imageContainer}>
        <Image 
          style={styles.image} 
          source={image ? { uri: image } : Profile} 
          alt="image de profil" 
        />
        <TouchableOpacity style={[styles.editButton, { backgroundColor: theme.cardbg }]} onPress={pickImage}>
          <Edit fill={theme.color} />
        </TouchableOpacity>
        <Toast/>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        style={styles.scrollView}
      >
        <Profile_setup_section2 email={email} userId={userId} />
      </ScrollView>
      <Toast/>
    </View>
  );
};

export default ProfileSetup;

const styles = StyleSheet.create({
  // Styles inchangés
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 35,
    paddingHorizontal: 0,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  header: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    left: 20,
  },
  heading: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: 'Montserrat_700Bold',
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  editButton: {
    position: 'absolute',
    bottom: 10,
    right: 110,
    borderRadius: 50,
    padding: 6,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});
