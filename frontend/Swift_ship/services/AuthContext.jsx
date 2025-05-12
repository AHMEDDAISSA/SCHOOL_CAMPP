// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Vérifier l'état de connexion et charger les données utilisateur au démarrage
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        // Récupérer le token et les données utilisateur
        const [token, storedUserData] = await Promise.all([
          AsyncStorage.getItem('authToken'),
          AsyncStorage.getItem('userData')
        ]);
        
        // Mettre à jour l'état de connexion
        setIsLoggedIn(!!token);
        
        // Si des données utilisateur existent, les charger
        if (storedUserData) {
          setUserData(JSON.parse(storedUserData));
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      setIsLoggedIn(!!token);
      
      // Récupérer les données utilisateur si connecté
      if (token) {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          setUserData(JSON.parse(storedUserData));
        }
      }
      return !!token;
    } catch (error) {
      console.error('Erreur lors de la vérification du statut de connexion:', error);
      return false;
    }
  };

  const login = async (credentials) => {
    try {
      // Simulation d'une réponse API réussie pour les besoins de l'exemple
      // Dans un environnement réel, vous effectuerez un appel d'API ici
      
      // Stocker le token
      await AsyncStorage.setItem('authToken', 'sample_token');
      
      // Créer et stocker des données utilisateur basiques
      const user = {
        id: credentials.userId || 'user_id',
        fullName: credentials.fullName || 'Nom par défaut',
        email: credentials.email || '',
        role: credentials.role || 'utilisateur',
        first_name: credentials.first_name || '',
        last_name: credentials.last_name || '',
        phoneNumber: credentials.phoneNumber || '',
        camp: credentials.camp || ''
      };
      
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      setUserData(user);
      setIsLoggedIn(true);
      
      return { 
        status: 'success',
        userData: user
      };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return { 
        status: 'error',
        message: error.message 
      };
    }
  };
  
  const register = async (userData) => {
    try {
      // Stocker temporairement les données d'inscription
      await AsyncStorage.setItem('tempUserData', JSON.stringify(userData));
      
      // Dans un environnement réel, vous effectuerez un appel d'API ici
      return {
        status: 'success',
        message: 'Inscription réussie'
      };
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      return {
        status: 'error',
        message: error.message
      };
    }
  };

  const logout = async () => {
    try {
      // Effacer le token et toutes les données d'authentification
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      
      // Réinitialiser l'état
      setIsLoggedIn(false);
      setUserData(null);
      
      return true;
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      return false;
    }
  };
  
  const updateUserData = async (newData) => {
    try {
      const updatedData = { ...userData, ...newData };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedData));
      setUserData(updatedData);
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des données utilisateur:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      userData, 
      loading, 
      login, 
      logout, 
      register, 
      checkLoginStatus,
      updateUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
