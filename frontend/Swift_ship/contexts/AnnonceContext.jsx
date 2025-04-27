// contexts/AnnonceContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AnnonceContext = createContext();

export const AnnonceProvider = ({ children }) => {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Charger les annonces depuis le stockage au démarrage
  useEffect(() => {
    loadAnnonces();
  }, []);
  
  // Charger les annonces depuis AsyncStorage
  const loadAnnonces = async () => {
    try {
      setLoading(true);
      const storedAnnonces = await AsyncStorage.getItem('annonces');
      if (storedAnnonces) {
        setAnnonces(JSON.parse(storedAnnonces));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des annonces:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Sauvegarder les annonces dans AsyncStorage
  const saveAnnonces = async (newAnnonces) => {
    try {
      await AsyncStorage.setItem('annonces', JSON.stringify(newAnnonces));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des annonces:', error);
    }
  };
  
  // Ajouter une nouvelle annonce
  const addAnnonce = async (newAnnonce) => {
    // Générer un ID unique basé sur la date
    const id = `annonce_${Date.now()}`;
    
    // Ajouter une date de création et marqueur "nouveau"
    const annonce = {
      ...newAnnonce,
      id,
      date: new Date().toLocaleDateString('fr-FR'),
      isNew: true,
      createdAt: Date.now() // Pour le tri et le nettoyage
    };
    
    // Ajouter au début de la liste
    const updatedAnnonces = [annonce, ...annonces];
    setAnnonces(updatedAnnonces);
    
    // Sauvegarder dans le stockage
    await saveAnnonces(updatedAnnonces);
    
    return id; // Retourner l'ID pour la navigation
  };
  
  // Supprimer une annonce
  const deleteAnnonce = async (id) => {
    const updatedAnnonces = annonces.filter(annonce => annonce.id !== id);
    setAnnonces(updatedAnnonces);
    await saveAnnonces(updatedAnnonces);
  };
  
  // Mettre à jour une annonce
  const updateAnnonce = async (id, updatedData) => {
    const updatedAnnonces = annonces.map(annonce => 
      annonce.id === id ? { ...annonce, ...updatedData } : annonce
    );
    setAnnonces(updatedAnnonces);
    await saveAnnonces(updatedAnnonces);
  };
  
  // Nettoyer les anciennes annonces (plus vieilles que maxAgeDays)
  const cleanOldAnnonces = async (maxAgeDays = 30) => {
    const now = Date.now();
    const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
    
    const updatedAnnonces = annonces.filter(annonce => {
      return now - annonce.createdAt < maxAgeMs;
    });
    
    // Ne mettre à jour que si des annonces ont été supprimées
    if (updatedAnnonces.length < annonces.length) {
      setAnnonces(updatedAnnonces);
      await saveAnnonces(updatedAnnonces);
      return annonces.length - updatedAnnonces.length; // Retourner le nombre d'annonces supprimées
    }
    
    return 0;
  };
  
  // Retirer le statut "nouveau" après un certain temps
  const updateNewStatus = async (newStatusDays = 3) => {
    const now = Date.now();
    const newStatusMs = newStatusDays * 24 * 60 * 60 * 1000;
    
    const needsUpdate = annonces.some(
      annonce => annonce.isNew && (now - annonce.createdAt > newStatusMs)
    );
    
    if (needsUpdate) {
      const updatedAnnonces = annonces.map(annonce => {
        if (annonce.isNew && (now - annonce.createdAt > newStatusMs)) {
          return { ...annonce, isNew: false };
        }
        return annonce;
      });
      
      setAnnonces(updatedAnnonces);
      await saveAnnonces(updatedAnnonces);
    }
  };
  
  return (
    <AnnonceContext.Provider
      value={{
        annonces,
        loading,
        addAnnonce,
        deleteAnnonce,
        updateAnnonce,
        cleanOldAnnonces,
        updateNewStatus,
        refreshAnnonces: loadAnnonces
      }}
    >
      {children}
    </AnnonceContext.Provider>
  );
};

export default AnnonceContext;