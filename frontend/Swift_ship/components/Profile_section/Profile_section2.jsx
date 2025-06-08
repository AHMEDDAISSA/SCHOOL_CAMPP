import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView} from 'react-native';
import React, { useContext, useState, useEffect, useMemo } from 'react';
import ThemeContext from '../../theme/ThemeContext';
import Profile_section3 from './Profile_section3';
import Profile_section4 from './Profile_section4';
import { Montserrat_500Medium, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { SourceSansPro_600SemiBold } from '@expo-google-fonts/source-sans-pro';
import Camera from '../../assets/images/camera.svg';
import { router } from 'expo-router';
import ProfileIcon from '../../assets/images/profillleeeeee.svg';
import EmailIcon from '../../assets/images/mail.svg';
import PhoneIcon from '../../assets/images/phonee.svg';

const Profile_section2 = () => {
  const { theme, darkMode, profileData, refreshUserData } = useContext(ThemeContext);
  const [imageError, setImageError] = useState(false);

  // **NOUVELLE LOGIQUE POUR GÉRER L'IMAGE**
  const profileImageSource = useMemo(() => {
    console.log('=== DEBUG PROFILE IMAGE ===');
    console.log('ProfileData:', profileData);
    console.log('ProfileData.profileImage:', profileData.profileImage);
    console.log('ImageError:', imageError);
    
    if (imageError || !profileData || !profileData.profileImage) {
      console.log('Using placeholder image');
      return null; // Utiliser le placeholder
    }

    let imageUrl = profileData.profileImage;
    
    // Si l'image ne commence pas par http, construire l'URL complète
    if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:') && !imageUrl.startsWith('file:')) {
      imageUrl = `http://192.168.1.21:3001/uploads/${imageUrl}`;
    }
    
    console.log('Final image URL:', imageUrl);
    return { uri: imageUrl };
  }, [profileData, imageError]);

  // **EFFET POUR RAFRAÎCHIR LES DONNÉES AU CHARGEMENT**
  useEffect(() => {
    const refreshData = async () => {
      try {
        if (refreshUserData) {
          await refreshUserData();
        }
      } catch (error) {
        console.error('Erreur lors du rafraîchissement:', error);
      }
    };
    
    refreshData();
  }, []);

  // **EFFET POUR TESTER L'URL DE L'IMAGE**
  useEffect(() => {
    const testImageUrl = async () => {
      if (profileImageSource && profileImageSource.uri) {
        console.log('Testing image URL:', profileImageSource.uri);
        
        try {
          const response = await fetch(profileImageSource.uri, { method: 'HEAD' });
          console.log('Image URL status:', response.status);
          
          if (response.status !== 200) {
            console.error('Image not accessible, status:', response.status);
            setImageError(true);
          }
        } catch (error) {
          console.error('Error testing image URL:', error);
          setImageError(true);
        }
      }
    };
    
    if (profileImageSource) {
      testImageUrl();
    }
  }, [profileImageSource]);

  const handleImageError = (error) => {
    console.error('Error loading profile image:', error.nativeEvent?.error);
    console.log('Failed image URL:', profileImageSource?.uri);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('Profile image loaded successfully:', profileImageSource?.uri);
    setImageError(false);
  };

  const handleImageLoadStart = () => {
    console.log('Started loading image:', profileImageSource?.uri);
    setImageError(false); // Reset error state when starting to load
  };

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

  // **COMPOSANT IMAGE AVEC GESTION D'ERREUR AMÉLIORÉE**
  const ProfileImage = () => {
    if (!profileImageSource || imageError) {
      return (
        <View style={[styles.placeholder_image, { backgroundColor: darkMode ? '#2a2a2a' : '#f0f0f0' }]}>
          <Text style={{ fontSize: 40, color: darkMode ? "#999" : "#666" }}>👤</Text>
        </View>
      );
    }

    return (
      <Image 
        source={profileImageSource}
        style={styles.image}
        onError={handleImageError}
        onLoad={handleImageLoad}
        onLoadStart={handleImageLoadStart}
        // **AJOUT : Props pour améliorer le chargement**
        resizeMode="cover"
        defaultSource={require('../../assets/images/placeholder.png')} // Si vous avez cette image
      />
    );
  };

  return (
    <View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.image_box}>
          <View style={styles.image_container}>
            <ProfileImage />
            <TouchableOpacity 
              style={styles.circle}
              onPress={() => {
                // Action pour changer l'image de profil
                router.push('(screens)/edit-profile');
              }}
            >
              <Camera />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={[styles.content, { backgroundColor: theme.cardbg, shadowColor: darkMode ? '#000' : '#ccc' }]}>
          <Text style={[styles.name, { color: theme.color2 }]}>
            {profileData.fullName || 
             `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || 
             'Utilisateur'}
          </Text>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <EmailIcon width={16} height={16} color={darkMode ? "#ccc" : "#666"} />
              <Text style={[styles.infoText, { color: theme.color4 }]}>
                {profileData.email || 'Email non défini'}
              </Text>
            </View>
            
            {profileData.phoneNumber && (
              <View style={styles.infoItem}>
                <PhoneIcon width={16} height={16} color={darkMode ? "#ccc" : "#666"} />
                <Text style={[styles.infoText, { color: theme.color4 }]}>
                  {profileData.phoneNumber}
                </Text>
              </View>
            )}
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
                  {getRoleLabel(profileData.role)}
                </Text>
              </View>
            )}
            
            {/* **AJOUT : Bouton pour actualiser** */}
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={async () => {
                setImageError(false);
                if (refreshUserData) {
                  await refreshUserData();
                }
              }}
            >
              <Text style={styles.refreshButtonText}>Actualiser</Text>
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

// **STYLES MODIFIÉS/AJOUTÉS**
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
    flex: 1, // **AJOUT pour équilibrer avec le bouton refresh**
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
  // **NOUVEAUX STYLES**
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#f0f0ff',
    borderWidth: 1,
    borderColor: '#836EFE',
  },
  refreshButtonText: {
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