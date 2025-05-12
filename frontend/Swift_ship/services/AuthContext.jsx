// Créez un fichier AuthContext.js dans votre dossier contexts
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext(); // Export nommé

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Vérifier l'état de connexion au démarrage
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error('Erreur lors de la vérification du statut de connexion:', error);
    }
  };

  const login = async (credentials) => {
    try {
      // Implémentez votre logique de connexion ici
      // Par exemple, appeler une API et stocker le token
      const response = await fetch('YOUR_API_ENDPOINT/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (data.token) {
        await AsyncStorage.setItem('authToken', data.token);
        setIsLoggedIn(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Effacer le token et toutes les données d'authentification
      await AsyncStorage.removeItem('authToken');
      // Vous pouvez ajouter d'autres éléments à effacer ici
      
      setIsLoggedIn(false);
      return true;
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, checkLoginStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
