import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Platform, Dimensions, StatusBar } from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import Back from "../../assets/images/back.svg";
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import Profile from "../../assets/images/anny.jpg";
import Edit from "../../assets/images/Edit.svg";
import Profile_setup_section2 from '../../components/Profile_setup/Profile_setup_section2';
import ThemeContext from '../../theme/ThemeContext';
import { router } from "expo-router";
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const ProfileSetup = () => {
  const { theme, darkMode, updateProfileImage, profileData } = useContext(ThemeContext);
  const [image, setImage] = useState(profileData.profileImage || null);
  
  // Effet pour mettre à jour l'état local quand profileData change
  useEffect(() => {
    setImage(profileData.profileImage);
  }, [profileData.profileImage]);

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
        <Profile_setup_section2 />
      </ScrollView>
      <Toast/>
    </View>
  );
};

export default ProfileSetup;

const styles = StyleSheet.create({
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
