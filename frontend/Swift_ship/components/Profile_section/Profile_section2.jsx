import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import React, { useContext } from 'react';
import ThemeContext from '../../theme/ThemeContext';
import Profile_section4 from './Profile_section4';
import Profile_section3 from './Profile_section3';
import { Montserrat_500Medium, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { SourceSansPro_600SemiBold } from '@expo-google-fonts/source-sans-pro';
import Camera from '../../assets/images/camera.svg';
import { router } from 'expo-router';

const Profile_section2 = () => {
  const { theme, darkMode, profileData } = useContext(ThemeContext);

  return (
    <View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.image_box}>
          <View style={styles.image_container}>
            {profileData.profileImage ? (
              <Image 
                source={{ uri: profileData.profileImage }} 
                style={styles.image} 
              />
            ) : (
              <View style={styles.placeholder_image}>
                <Text style={styles.placeholder_text}>Pas d'image</Text>
              </View>
            )}
            <View style={styles.circle}>
              <Camera />
            </View>
          </View>
        </View>
        <View style={[styles.content, { backgroundColor: theme.cardbg }]}>
          <Text style={[styles.name, { color: theme.color2 }]}>
            {profileData.fullName || 'Ahmed Aissa'}
          </Text>
          <View style={styles.mail_row}>
            <Text style={[styles.mail, { color: theme.color4 }]}>
              {profileData.email || 'ahmedaissa@gmail.com'}
            </Text>
            <TouchableOpacity onPress={() => router.push('/profile-setup')}>
              <Text style={styles.edit}>edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.no, { color: theme.color4 }]}>
            {profileData.phoneNumber || '(208) 808-946'}
          </Text>
          
          {profileData.role && (
            <Text style={[styles.role, { color: theme.color4 }]}>
              Profil: {profileData.role === 'parent' ? 'Parent' : 
                      profileData.role === 'admin' ? 'Administrateur' : 
                      profileData.role === 'exploitant' ? 'Exploitant' : ''}
            </Text>
          )}
        </View>
        <Profile_section3 />
        <Profile_section4 />
      </ScrollView>
    </View>
  );
};

export default Profile_section2;

const styles = StyleSheet.create({
  image_box: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
    position: 'relative',
  },
  role: {
    fontSize: 12,
    lineHeight: 20,
    fontFamily: 'Montserrat_500Medium',
    color: '#4C4C4C',
    marginTop: 4,
  },
  circle: {
    backgroundColor: '#836EFE',
    width: 24,
    height: 24,
    borderRadius: 50,
    position: 'absolute',
    bottom: 10,
    right: -5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    position: 'relative',
  },
  placeholder_image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder_text: {
    color: '#666',
    fontSize: 12,
  },
  image_container: {
    position: 'relative',
  },
  content: {
    backgroundColor: '#F1F1F1',
    borderRadius: 10,
    padding: 16,
  },
  name: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'SourceSansPro_600SemiBold',
    color: '#151515',
  },
  mail_row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mail: {
    fontSize: 12,
    lineHeight: 20,
    fontFamily: 'Montserrat_500Medium',
    color: '#4C4C4C',
  },
  edit: {
    fontSize: 12,
    lineHeight: 19,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#836EFE',
    textTransform: 'capitalize',
  },
  no: {
    fontSize: 12,
    lineHeight: 20,
    fontFamily: 'Montserrat_500Medium',
    color: '#4C4C4C',
  },
});