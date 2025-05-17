import React, { createContext, useState, useEffect , useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPosts, deleteAnnounce } from '../services/api';


const AnnonceContext = createContext();

export const AnnonceProvider = ({ children }) => {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(false);
 const isMounted = useRef(true); // Initialiser avec true
  
  // Nettoyage lors du démontage
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);


  
  // Charger les annonces depuis AsyncStorage
 const loadAnnonces = async () => {
    try {
      setLoading(true);
      const storedAnnonces = await AsyncStorage.getItem('annonces');
      if (storedAnnonces && isMounted.current) {
        const parsedAnnonces = JSON.parse(storedAnnonces);
        // Vérifier que les données sont valides
        if (Array.isArray(parsedAnnonces)) {
          setAnnonces(parsedAnnonces);
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
 const addAnnonce = async (nouvelleAnnonce) => {
   try {
      
      const storedAnnonces = await AsyncStorage.getItem('annonces');
      const currentAnnonces = storedAnnonces ? JSON.parse(storedAnnonces) : [];
      
      
      if (!nouvelleAnnonce.id) {
        nouvelleAnnonce.id = Date.now().toString();
      }
      
      
      nouvelleAnnonce.createdAt = nouvelleAnnonce.createdAt || new Date().toISOString();
      nouvelleAnnonce.date = nouvelleAnnonce.date || new Date().toLocaleDateString('fr-FR');
      nouvelleAnnonce.isNew = true;
      
      
      const updatedAnnonces = [nouvelleAnnonce, ...currentAnnonces];
      
      
      const saveSuccess = await saveAnnonces(updatedAnnonces);
      
      if (!saveSuccess) {
        throw new Error("Erreur lors de la sauvegarde des annonces");
      }
      
      // Mettre à jour l'état seulement si le composant est toujours monté
      if (isMounted.current) {
        setAnnonces(updatedAnnonces);
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'annonce:', error);
      return false;
    }
  };
  const transformApiData = (apiData) => {
    if (!apiData || !apiData.posts || !Array.isArray(apiData.posts)) return [];
    console.log('Invalid API data format:', apiData);

    return apiData.posts.map(post => ({
      id: post._id,
      title: post.title,
      description: post.description,
      category: typeof post.category === 'string' ? post.category : 
               (post.category === '1' ? 'Donner' : 
                post.category === '4' ? 'Louer' : 
                post.category === '6' ? 'Échanger' : post.category),
      type: post.type,
      email: post.email,
      camp: post.camp,
      is_published: post.is_published,
      contact_info: post.contact_info,
      date: post.createdAt ? new Date(post.createdAt).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'),
      isNew: true
      
    }));
  };
    
  
    const refreshAnnonces = async () => {
    try {
      setLoading(true);
      const response = await getPosts();
      //  console.log("API Response:", response);
      if (response) {
        console.log("ddddddss", response);
        
        setAnnonces(response.posts);
        await AsyncStorage.setItem('annonces', JSON.stringify(response));
      }
      return true;
    } catch (error) {
      console.error('Erreur lors du chargement des annonces:', error);//*** */
      
      try {
        const storedAnnonces = await AsyncStorage.getItem('annonces');
     
        
        if (storedAnnonces) {
          setAnnonces(JSON.parse(storedAnnonces));
        }
      } catch (e) {
        console.error('Erreur lors de la récupération depuis AsyncStorage:', e);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };
  
 
  const deleteAnnonceMeth = async (id) => {
    
    
    console.log("ANNContext",id);
  try {
    
    const success = await deleteAnnounce(id);
    
    if (success) {
      const updatedAnnonces = annonces.filter(annonce => annonce.id !== id);
      
      if (isMounted.current) {
        setAnnonces(updatedAnnonces);
        await AsyncStorage.setItem('annonces', JSON.stringify(updatedAnnonces));
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'annonce:', error);
    return false;
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
      return true; 
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'annonce:', error);
      return false; 
    }
  };
  
  // Nettoyer les anciennes annonces (plus vieilles que maxAgeDays)
   const cleanOldAnnonces = async (daysLimit) => {
    try {
      const currentDate = new Date();
      const limitDate = new Date();
      limitDate.setDate(currentDate.getDate() - daysLimit);
      
      const filteredAnnonces = annonces.filter(annonce => {
        const annonceDate = new Date(annonce.date);//.split('/').reverse().join('-'));
        return annonceDate >= limitDate;
      });
      
      const deletedCount = annonces.length - filteredAnnonces.length;
      
      if (deletedCount > 0) {
        setAnnonces(filteredAnnonces);
        await AsyncStorage.setItem('annonces', JSON.stringify(filteredAnnonces));
      }
      
      return deletedCount;
    } catch (error) {
      console.error('Erreur lors du nettoyage des annonces:', error);
      return 0;
    }
  };

  
  // Retirer le statut "nouveau" après un certain temps
  const updateNewStatus = async () => {
    try {
      const viewedAnnoncesStr = await AsyncStorage.getItem('viewedAnnonces') || '[]';
      const viewedAnnonces = JSON.parse(viewedAnnoncesStr);
      
      const updatedAnnonces = annonces.map(annonce => ({
        ...annonce,
        isNew: !viewedAnnonces.includes(annonce.id)
      }));
      
      setAnnonces(updatedAnnonces);
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut "nouveau":', error);
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
        deleteAnnonceMeth,
        updateAnnonce,
        // cleanOldAnnonces,
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
