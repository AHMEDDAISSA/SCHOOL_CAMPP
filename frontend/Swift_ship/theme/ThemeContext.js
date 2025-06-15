import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserByEmailApi } from '../services/api'; // AJOUT : Import de la fonction API

const lightTheme = {
  background: '#FFFFFF',
  background2: '#ffffff',
  color: '#39335E',
  color2: '#151515',
  color3: '#727272',
  color4: '#4c4c4c',
  color5: '#474D66',
  log: '#FE1717',
  text: '#000000',
  coloring: '#f2f2f2',
  cardbg: '#F1F1F1',
  cardbg2: '#F5F4F8',
  cardbg3: 'rgba(26, 22, 51, 0.20)',
  card: '#f6f6f6',
  overlay: 'rgba(0, 0, 0, 0.5)',
  bordercolor: 'rgba(0, 0, 0, 0.25)',
};

const darkTheme = {
  background: '#261F4E',
  background2: 'rgba(238, 238, 238, 0.2)',
  color: '#FFFFFF',
  color2: '#ffffff',
  color3: '#ffffff',
  color4: '#ffffff',
  color5: '#f6f6f6',
  log: '#FE1717',
  text: '#BABABA',
  coloring: '#333333',
  cardbg: '#3C2E82',
  cardbg2: '#504A70',
  cardbg3: '#261F4E',
  card: '#504A70',
  overlay: 'rgba(255, 255, 255, 0.4)',
  bordercolor: '#333333',
  pagination: '#836EFE',
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [theme, setTheme] = useState(lightTheme);
  const [profileData, setProfileData] = useState({
    fullName: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    profileImage: null,
    role: '',
    canPost: false,
  });

  useEffect(() => {
    const loadDarkModeState = async () => {
      try {
        const darkModeState = await AsyncStorage.getItem('darkMode');
        if (darkModeState !== null) {
          const parsedState = JSON.parse(darkModeState);
          setDarkMode(parsedState.darkMode);
          setTheme(parsedState.darkMode ? darkTheme : lightTheme);
        }
      } catch (error) {
        console.error('Error loading dark mode state:', error);
      }
    };

  const loadProfileData = async () => {
  try {
    const [storedEmail, storedUserInfo, storedProfileData] = await Promise.all([
      AsyncStorage.getItem('userEmail'),
      AsyncStorage.getItem('userInfo'),
      AsyncStorage.getItem('profileData'),
    ]);

    let newProfileData = { ...profileData };
    
    // Charger d'abord les données stockées localement
    if (storedUserInfo) {
      const userInfo = JSON.parse(storedUserInfo);
      newProfileData = { 
        ...newProfileData, 
        ...userInfo,
        fullName: userInfo.fullName || `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim(),
        firstName: userInfo.firstName || userInfo.first_name || '',
        lastName: userInfo.lastName || userInfo.last_name || '',
        phoneNumber: userInfo.phoneNumber || userInfo.phone || '',
        // CORRECTION : Prioriser profileImageUrl
        profileImage: userInfo.profileImageUrl || userInfo.profileImage || null,
      };
    }
    
    if (storedProfileData) {
      const parsedProfileData = JSON.parse(storedProfileData);
      newProfileData = { ...newProfileData, ...parsedProfileData };
    }

    // Récupérer les données les plus récentes depuis l'API
    if (storedEmail) {
      newProfileData.email = storedEmail;
      
      try {
        const userData = await getUserByEmailApi(storedEmail);
        if (userData) {
          console.log('Fresh user data from API:', userData); // Debug
          
          newProfileData = {
            ...newProfileData,
            ...userData,
            fullName: userData.fullName || `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
            firstName: userData.firstName || userData.first_name || '',
            lastName: userData.lastName || userData.last_name || '',
            phoneNumber: userData.phoneNumber || userData.phone || '',
            // CORRECTION : Utiliser profileImageUrl du serveur
            profileImage: userData.profileImageUrl || userData.profileImage || newProfileData.profileImage,
          };
          
          console.log('Final profile data after API update:', newProfileData); // Debug
          
          // Sauvegarder les données mises à jour
          await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
          await AsyncStorage.setItem('profileData', JSON.stringify(newProfileData));
        }
      } catch (error) {
        console.error('Error fetching fresh user data:', error);
        // Continuer avec les données stockées localement en cas d'erreur réseau
      }
    }

    console.log('Final profile data loaded:', newProfileData);
    setProfileData(newProfileData);
  } catch (error) {
    console.error('Error loading profile data:', error);
  }
};

    loadDarkModeState();
    loadProfileData();
  }, []);

  const toggleTheme = async () => {
    try {
      const newDarkMode = !darkMode;
      setDarkMode(newDarkMode);
      setTheme(newDarkMode ? darkTheme : lightTheme);
      await AsyncStorage.setItem('darkMode', JSON.stringify({ darkMode: newDarkMode }));
    } catch (error) {
      console.error('Error saving dark mode state:', error);
    }
  };

const updateProfileData = async (data, shouldSaveToServer = false) => {
    try {
      console.log('Updating profile data:', data);
      
      if (shouldSaveToServer && profileData._id) {
        try {
          const response = await updateUserProfile(profileData._id, data);
          if (response && response.success) {
            data = response.user || data;
          }
        } catch (serverError) {
          console.error('Server update failed:', serverError);
          throw serverError;
        }
      }
      
      let imageUrl = null;
      if (data.profileImageUrl) {
        imageUrl = data.profileImageUrl;
      } else if (data.profileImage) {
        if (data.profileImage.startsWith('http') || data.profileImage.startsWith('file://')) {
          imageUrl = data.profileImage;
        } else {
          imageUrl = `${UPLOADS_URL}/${data.profileImage}`;
        }
      } else {
        imageUrl = profileData.profileImage;
      }
      
      const mappedData = {
        ...data,
        fullName: data.fullName || `${data.first_name || data.firstName || ''} ${data.last_name || data.lastName || ''}`.trim(),
        firstName: data.firstName || data.first_name || '',
        lastName: data.lastName || data.last_name || '',
        phoneNumber: data.phoneNumber || data.phone || '',
        profileImage: imageUrl,
        profileImageUrl: imageUrl,
        lastUpdated: new Date().toISOString(),
      };
      
      const newProfileData = { 
        ...profileData, 
        ...mappedData,
        _id: profileData._id,
        email: profileData.email,
      };
      
      setProfileData(newProfileData);
      await AsyncStorage.setItem('profileData', JSON.stringify(newProfileData));
      await AsyncStorage.setItem('userInfo', JSON.stringify(newProfileData));
      
      return newProfileData;
      
    } catch (error) {
      console.error('Error updating profile data:', error);
      throw error;
    }
  };

  const updateProfileImage = async (imageUri) => {
    try {
      const newProfileData = { ...profileData, profileImage: imageUri };
      setProfileData(newProfileData);
      await AsyncStorage.setItem('profileData', JSON.stringify(newProfileData));
    } catch (error) {
      console.error('Error saving profile image:', error);
    }
  };

  const clearProfileData = async () => {
    try {
      const emptyProfile = {
        fullName: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        profileImage: null,
        role: '',
      };
      setProfileData(emptyProfile);
      await AsyncStorage.setItem('profileData', JSON.stringify(emptyProfile));
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('userInfo');
    } catch (error) {
      console.error('Error clearing profile data:', error);
    }
  };

  const resetProfileImage = async () => {
    try {
      const updatedProfileData = { ...profileData, profileImage: null };
      setProfileData(updatedProfileData);
      await AsyncStorage.setItem('profileData', JSON.stringify(updatedProfileData));
    } catch (error) {
      console.error('Error resetting profile image:', error);
    }
  };

  // AJOUT : Fonction pour rafraîchir les données utilisateur
  const refreshUserData = useCallback(async () => {
  try {
    if (profileData && profileData.email) {
      const updatedUserData = await getUserByEmailApi(profileData.email);
      if (updatedUserData) {
        setProfileData(updatedUserData);
        await AsyncStorage.setItem('profileData', JSON.stringify(updatedUserData));
      }
    }
  } catch (error) {
    console.error('Erreur lors du rafraîchissement des données utilisateur:', error);
  }
}, [profileData]);

// Ajoutez refreshUserData à la valeur du contexte
const value = {
  theme,
  darkMode,
  toggleTheme,
  profileData,
  setProfileData,
  refreshUserData, // AJOUT
};

  return (
    <ThemeContext.Provider
      value={{
        theme,
        darkMode,
        toggleTheme,
        profileData,
        setProfileData,
        updateProfileData,
        updateProfileImage,
        clearProfileData,
        resetProfileImage,
        refreshUserData, // AJOUT
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
