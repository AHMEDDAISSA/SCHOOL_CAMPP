import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

const useAuth = () => {
  const handleLogout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userRole');
      
      Toast.show({
        type: 'success',
        text1: 'Déconnexion réussie',
        visibilityTime: 2000,
        topOffset: 50
      });
      
      setTimeout(() => router.push('/login'), 500);
    } catch (error) {
      console.error('Error during logout:', error);
      
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Problème lors de la déconnexion',
        visibilityTime: 3000
      });
    }
  }, []);

  return { handleLogout };
};

export default useAuth;