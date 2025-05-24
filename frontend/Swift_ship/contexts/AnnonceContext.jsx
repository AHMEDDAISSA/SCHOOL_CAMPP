import React, { createContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPosts, deleteAnnonce } from '../services/api';

const AnnonceContext = createContext();

export const AnnonceProvider = ({ children }) => {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);
  const dataFetchedRef = useRef(false); // Référence pour éviter les doubles chargements

  // Nettoyage lors du démontage
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fonction garantie pour transformer les données d'API
  const normalizeAnnonces = (data) => {
    if (!data) return [];

    let annoncesList = [];
    
    // Traiter différentes structures d'API possibles
    if (Array.isArray(data)) {
      annoncesList = data;
    } else if (data.posts && Array.isArray(data.posts)) {
      annoncesList = data.posts;
    } else if (data.data && Array.isArray(data.data)) {
      annoncesList = data.data;
    } else {
      console.warn("Format de données inconnu:", data);
      return [];
    }

    // Normaliser chaque annonce pour garantir une structure cohérente
    return annoncesList.map(item => ({
      ...item,
      id: item._id || item.id || `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      _id: item._id || item.id || `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: item.title || "Sans titre",
      description: item.description || "",
      category: typeof item.category === 'string' ? item.category : 
                (item.category === 1 || item.category === '1') ? 'Donner' : 
                (item.category === 4 || item.category === '4') ? 'Louer' : 
                (item.category === 6 || item.category === '6') ? 'Échanger' :
                (item.category === 2 || item.category === '2') ? 'Prêter' :
                (item.category === 3 || item.category === '3') ? 'Emprunter' :
                (item.category === 5 || item.category === '5') ? 'Acheter' : "Autre",
      type: item.type || "Non spécifié",
      email: item.email || "",
      contactEmail: item.contactEmail || item.email || "",
      camp: item.camp || "",
      images: item.images || [],
      date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR') : 
            item.date ? item.date : new Date().toLocaleDateString('fr-FR'),
      isNew: true
    }));
  };

  // Charger les annonces depuis AsyncStorage
  const loadAnnonces = async () => {
    try {
      setLoading(true);
      const storedAnnonces = await AsyncStorage.getItem('annonces');
      
      if (storedAnnonces && isMounted.current) {
        const parsedAnnonces = JSON.parse(storedAnnonces);
        // Vérifier que les données sont valides
        if (Array.isArray(parsedAnnonces)) {
          setAnnonces(normalizeAnnonces(parsedAnnonces));
          console.log(`${parsedAnnonces.length} annonces chargées depuis le stockage local`);
        } else {
          console.warn("Format d'annonces invalide dans AsyncStorage");
          setAnnonces([]);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des annonces:', error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // Sauvegarder les annonces dans AsyncStorage
  const saveAnnonces = async (newAnnonces) => {
    try {
      await AsyncStorage.setItem('annonces', JSON.stringify(newAnnonces));
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des annonces:', error);
      return false;
    }
  };

  // Version améliorée de refreshAnnonces qui gère correctement les données
  const refreshAnnonces = async () => {
    try {
      console.log("Début du rafraîchissement des annonces");
      setLoading(true);
      
      const response = await getPosts();
      
      if (response) {
        console.log("Données reçues de l'API:", JSON.stringify(response).substring(0, 200) + "...");
        
        // Utiliser la fonction de normalisation pour garantir un format cohérent
        const normalizedData = normalizeAnnonces(response);
        
        console.log(`${normalizedData.length} annonces normalisées pour l'affichage`);
        
        if (normalizedData.length > 0) {
          if (isMounted.current) {
            // IMPORTANT: Utilisez une fonction pour mettre à jour l'état
            // pour éviter les problèmes de closure
            setAnnonces(normalizedData);
            await saveAnnonces(normalizedData);
            console.log("Annonces mises à jour et sauvegardées avec succès");
          }
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des annonces:', error);
      
      // En cas d'erreur, essayer de charger depuis le stockage local
      try {
        const storedAnnonces = await AsyncStorage.getItem('annonces');
        
        if (storedAnnonces && isMounted.current) {
          const parsedAnnonces = JSON.parse(storedAnnonces);
          setAnnonces(normalizeAnnonces(parsedAnnonces));
          console.log(`${parsedAnnonces.length} annonces récupérées depuis AsyncStorage après erreur`);
        }
      } catch (e) {
        console.error('Erreur lors de la récupération depuis AsyncStorage:', e);
      }
      return false;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // Supprimer une annonce avec gestion garantie des IDs
  const deleteAnnonceMeth = async (id, userEmail) => {
    console.log("AnnonceContext - Deleting ID:", id, "User:", userEmail);
    try {
      const success = await deleteAnnonce(id, userEmail);
      
      if (success && success.success) {
        // Mise à jour immédiate du state local 
        setAnnonces(prevAnnonces => 
          prevAnnonces.filter(annonce => 
            annonce._id !== id && annonce.id !== id
          )
        );
        
        // Mise à jour du stockage local
        const updatedAnnonces = annonces.filter(annonce => 
          annonce._id !== id && annonce.id !== id
        );
        
        if (isMounted.current) {
          await AsyncStorage.setItem('annonces', JSON.stringify(updatedAnnonces));
        }
        return { success: true, message: success.message || "Annonce supprimée avec succès" };
      }
      return { success: false, message: success.message || "Erreur lors de la suppression" };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'annonce:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de la suppression de l\'annonce' 
      };
    }
  };
  

  // Initialiser les données au montage du composant
  useEffect(() => {
    if (!dataFetchedRef.current) {
      dataFetchedRef.current = true;
      console.log("Chargement initial des données");
      
      // Séquence garantie: d'abord charger depuis stockage local, puis depuis l'API
      loadAnnonces().then(() => {
        setTimeout(() => {
          if (isMounted.current) {
            refreshAnnonces();
          }
        }, 500); // Petit délai pour éviter les conflits de rendu
      });
    }
    
    return () => {
      console.log("Nettoyage du contexte des annonces");
    };
  }, []);

  // Mettre à jour le statut "nouveau" après un certain temps
  const updateNewStatus = async () => {
    try {
      const viewedAnnoncesStr = await AsyncStorage.getItem('viewedAnnonces') || '[]';
      const viewedAnnonces = JSON.parse(viewedAnnoncesStr);
      
      setAnnonces(prevAnnonces => {
        const updatedAnnonces = prevAnnonces.map(annonce => ({
          ...annonce,
          isNew: !viewedAnnonces.includes(annonce.id) && !viewedAnnonces.includes(annonce._id)
        }));
        return updatedAnnonces;
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut "nouveau":', error);
      return false;
    }
  };
  
  
  // Récupérer une annonce par son ID
  const getAnnonceById = (id) => {
    const annonce = annonces.find(annonce => 
      (annonce.id === id || annonce._id === id)
    );
    return annonce || null;
  };

  return (
    <AnnonceContext.Provider
      value={{
        annonces,
        loading,
        deleteAnnonceMeth,
        updateNewStatus,
        refreshAnnonces,
        getAnnonceById
      }}
    >
      {children}
    </AnnonceContext.Provider>
  );
};

export default AnnonceContext;
 