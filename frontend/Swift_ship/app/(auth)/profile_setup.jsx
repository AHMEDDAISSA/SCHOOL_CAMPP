import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Platform } from 'react-native';
import React, { useContext, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import Profile from "../../assets/images/anny.jpg";
import Edit from "../../assets/images/Edit.svg";
import Profile_setup_section2 from '../../components/Profile_setup/Profile_setup_section2';
import ThemeContext from '../../theme/ThemeContext';
import { router } from "expo-router";

const ProfileSetup = () => {
  const { theme, darkMode, updateProfileImage, profileData } = useContext(ThemeContext);
  const [image, setImage] = useState(profileData.profileImage || null);

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
      updateProfileImage(imageUri); // Save to ThemeContext
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={back} style={styles.backButton}>
          {darkMode ? <Dark_back /> : <Back />}
        </TouchableOpacity>
        <Text style={[styles.heading, { color: theme.color }]}>
          Compléter votre profil
        </Text>
      </View>

      <View style={styles.imageContainer}>
        <Image 
          style={styles.image} 
          source={image ? { uri: image } : Profile} 
          alt="image de profil" 
        />
        <TouchableOpacity style={styles.editButton} onPress={pickImage}>
          <Edit />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Profile_setup_section2 />
      </ScrollView>
    </View>
  );
};

export default ProfileSetup;

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
    flex: 1,
  },
  header: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  backButton: {
    position: 'absolute',
    left: 0,
  },
  heading: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: 'Montserrat_700Bold',
    color: '#39335E',
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
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
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 6,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});