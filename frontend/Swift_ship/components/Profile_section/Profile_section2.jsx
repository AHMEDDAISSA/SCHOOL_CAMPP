import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import React, { useContext } from 'react';
import ThemeContext from '../../theme/ThemeContext';
import Profile_section3 from './Profile_section3';
import Profile_section4 from './Profile_section4';
import { Montserrat_500Medium, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { SourceSansPro_600SemiBold } from '@expo-google-fonts/source-sans-pro';
import Camera from '../../assets/images/camera.svg';
import { router } from 'expo-router';
// Importez ici des icônes pour améliorer l'interface
import ProfileIcon from '../../assets/images/profillleeeeee.svg'; // À créer ou importer
import EmailIcon from '../../assets/images/email.svg'; // À créer ou importer
import PhoneIcon from '../../assets/images/phonee.svg'; // À créer ou importer

const Profile_section2 = () => {
  const { theme, darkMode, profileData } = useContext(ThemeContext);

  const getRoleLabel = (roleId) => {
    switch(roleId) {
      case 'parent':
        return 'Parent';
      case 'admin':
        return 'Administrateur';
      case 'exploitant':
        return 'Exploitant';
      default:
        return 'Non défini';
    }
  };

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
              <View style={[styles.placeholder_image, { backgroundColor: darkMode ? '#2a2a2a' : '#f0f0f0' }]}>
                <ProfileIcon width={40} height={40} color={darkMode ? "#999" : "#666"} />
              </View>
            )}
            <TouchableOpacity style={styles.circle}>
              <Camera />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={[styles.content, { backgroundColor: theme.cardbg, shadowColor: darkMode ? '#000' : '#ccc' }]}>
          <Text style={[styles.name, { color: theme.color2 }]}>
            {profileData.fullName || 'Utilisateur'}
          </Text>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <EmailIcon width={16} height={16} color={darkMode ? "#ccc" : "#666"} />
              <Text style={[styles.infoText, { color: theme.color4 }]}>
                {profileData.email || 'Email non défini'}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <PhoneIcon width={16} height={16} color={darkMode ? "#ccc" : "#666"} />
              <Text style={[styles.infoText, { color: theme.color4 }]}>
                {profileData.phoneNumber || 'Numéro non défini'}
              </Text>
            </View>
          </View>
          
          <View style={styles.editRow}>
            {profileData.role && (
              <View style={styles.roleContainer}>
                <Text style={[styles.role, { color: theme.color4 }]}>
                  Profil:
                </Text>
                <Text style={[
                  styles.roleValue, 
                  { 
                    color: '#836EFE',
                    backgroundColor: darkMode ? 'rgba(131, 110, 254, 0.2)' : '#f0f0ff',
                  }
                ]}>
                  {profileData.role ? getRoleLabel(profileData.role) : 'Non défini'}
                </Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={[styles.editButton, { backgroundColor: darkMode ? 'rgba(131, 110, 254, 0.2)' : '#f0f0ff' }]} 
              onPress={() => router.push('/profile-setup')}
            >
              <Text style={styles.editButtonText}>Modifier</Text>
            </TouchableOpacity>
          </View>
          
          {profileData.lastUpdated && (
            <Text style={[styles.lastUpdated, { color: theme.color4 }]}>
              Mis à jour le {new Date(profileData.lastUpdated).toLocaleDateString()}
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
    marginVertical: 25,
    position: 'relative',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  role: {
    fontSize: 12,
    lineHeight: 20,
    fontFamily: 'Montserrat_500Medium',
    color: '#4C4C4C',
    marginRight: 5,
  },
  roleValue: {
    fontSize: 12,
    lineHeight: 20,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#836EFE',
    backgroundColor: '#f0f0ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  circle: {
    backgroundColor: '#836EFE',
    width: 32,
    height: 32,
    borderRadius: 50,
    position: 'absolute',
    bottom: 5,
    right: -8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#836EFE',
  },
  placeholder_image: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#836EFE',
  },
  image_container: {
    position: 'relative',
  },
  content: {
    backgroundColor: '#F1F1F1',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  name: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: 'SourceSansPro_600SemiBold',
    color: '#151515',
    marginBottom: 10,
  },
  infoContainer: {
    gap: 8,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'Montserrat_500Medium',
    color: '#4C4C4C',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#f0f0ff',
  },
  editButtonText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 12,
    color: '#836EFE',
  },
  lastUpdated: {
    fontSize: 11,
    marginTop: 15,
    fontFamily: 'Montserrat_500Medium',
    color: '#999',
    fontStyle: 'italic',
  },
});