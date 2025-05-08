// components/ProtectedRoute.jsx
import React, { useEffect, useState, useContext } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import ThemeContext from '../../theme/ThemeContext';

const ProtectedRoute = ({ requiredRole, children }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userInfoString = await AsyncStorage.getItem('userInfo');
        
        if (!token) {
          // Pas de token, rediriger vers login
          router.replace('/login');
          return;
        }
        
        // Vérifier le rôle si nécessaire
        if (requiredRole && requiredRole !== 'any') {
          // Extraire le rôle depuis userInfo
          const userInfo = userInfoString ? JSON.parse(userInfoString) : {};
          const userRole = userInfo.role;
          
          if (userRole !== requiredRole) {
            // Rediriger si le rôle ne correspond pas
            router.replace('/home');
            return;
          }
        }
        
        // Si on arrive ici, l'utilisateur est autorisé
        setAuthorized(true);
      } catch (error) {
        console.error('Erreur de vérification d\'authentification:', error);
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [requiredRole]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#6D5FFD" />
      </View>
    );
  }

  return authorized ? children : null;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default ProtectedRoute;
