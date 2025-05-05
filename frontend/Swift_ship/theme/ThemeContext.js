import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    email: '',
    phoneNumber: '',
    profileImage: null,
    role: '',
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
        if (storedEmail) {
          newProfileData.email = storedEmail;
        }
        if (storedUserInfo) {
          const userInfo = JSON.parse(storedUserInfo);
          newProfileData = { ...newProfileData, ...userInfo };
        }
        if (storedProfileData) {
          const parsedProfileData = JSON.parse(storedProfileData);
          newProfileData = { ...newProfileData, ...parsedProfileData };
        }

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

  const updateProfileData = async (data) => {
    try {
      const newProfileData = { ...profileData, ...data };
      setProfileData(newProfileData);
      await AsyncStorage.setItem('profileData', JSON.stringify(newProfileData));
    } catch (error) {
      console.error('Error saving profile data:', error);
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
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;