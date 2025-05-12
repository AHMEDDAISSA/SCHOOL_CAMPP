import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AnnonceContext = createContext();

export const AnnonceProvider = ({ children }) => {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  
  
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
  const approveAnnounce = async (announceId) => {
  try {
    // Update the announcement in your database
    const updatedAnnonce = { ...annonces.find(a => a.id === announceId), needsModeration: false, status: 'approved' };
    // Call your API endpoint or database update function here
    
    // Update local state
    const updatedAnnounces = annonces.map(a => a.id === announceId ? updatedAnnonce : a);
    setAnnonces(updatedAnnounces);
    
    // Update the moderation list
    const updatedModerateList = annoncesToModerate.filter(a => a.id !== announceId);
    setAnnoncesToModerate(updatedModerateList);
    setFlaggedAnnounces(updatedModerateList.length);
    
    return true;
  } catch (error) {
    console.error('Error approving announcement:', error);
    return false;
  }
};

const rejectAnnounce = async (announceId) => {
  try {
    // Call your delete function or API endpoint
    const success = await deleteAnnonce(announceId);
    
    if (success) {
      // Update the moderation list
      const updatedModerateList = annoncesToModerate.filter(a => a.id !== announceId);
      setAnnoncesToModerate(updatedModerateList);
      setFlaggedAnnounces(updatedModerateList.length);
    }
    
    return success;
  } catch (error) {
    console.error('Error rejecting announcement:', error);
    return false;
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
    try {
      // Filtrer l'annonce à supprimer
      const updatedAnnonces = annonces.filter(annonce => annonce.id !== id);
      
      // Mettre à jour l'état
      setAnnonces(updatedAnnonces);
      
      // Sauvegarder dans le stockage
      await saveAnnonces(updatedAnnonces);
      
      return true; // Succès de la suppression
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'annonce:', error);
      return false; // Échec de la suppression
    }
  };
  
  // Mettre à jour une annonce
  const updateAnnonce = async (id, updatedData) => {
    try {
      const updatedAnnonces = annonces.map(annonce => 
        annonce.id === id ? { ...annonce, ...updatedData } : annonce
      );
      setAnnonces(updatedAnnonces);
      await saveAnnonces(updatedAnnonces);
      return true; // Succès de la mise à jour
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'annonce:', error);
      return false; // Échec de la mise à jour
    }
  };
  
  // Nettoyer les anciennes annonces (plus vieilles que maxAgeDays)
  const cleanOldAnnonces = async (maxAgeDays = 30) => {
    try {
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
    } catch (error) {
      console.error('Erreur lors du nettoyage des anciennes annonces:', error);
      return 0;
    }
  };
  
  // Retirer le statut "nouveau" après un certain temps
  const updateNewStatus = async (newStatusDays = 3) => {
    try {
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
        return true;
      }
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut des annonces:', error);
      return false;
    }
  };
  
  // Récupérer une annonce par son ID
  const getAnnonceById = (id) => {
    return annonces.find(annonce => annonce.id === id) || null;
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
        refreshAnnonces: loadAnnonces,
        getAnnonceById
      }}
    >
      {children}
    </AnnonceContext.Provider>
  );
};

export default AnnonceContext;
