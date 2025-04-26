import React, { createContext, useState, useEffect } from 'react';

const AnnonceContext = createContext();

export const AnnonceProvider = ({ children }) => {
  // État des annonces
  const [annonces, setAnnonces] = useState([
    {
      id: '1',
      title: 'Gants de ski taille 8 en parfait état, peu utilisés',
      category: 'Prêter',
      type: 'Équipement ski',
      date: '20/04/2025',
      isNew: true,
      imageUrl: 'https://images.unsplash.com/photo-1607250388533-ffdc26b6899e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      images: ['https://images.unsplash.com/photo-1607250388533-ffdc26b6899e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80']
    },
    {
      id: '2',
      title: 'Bonnet rouge enfant',
      category: 'Donner',
      type: 'Vêtement hiver',
      date: '19/04/2025',
      isNew: true,
      imageUrl: null,
      images: []
    },
    {
      id: '3',
      title: 'Chaussures de randonnée T36',
      category: 'Échanger',
      type: 'Chaussures',
      date: '18/04/2025',
      imageUrl: 'https://images.unsplash.com/photo-1582398626929-4aaba43ffd66?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      images: ['https://images.unsplash.com/photo-1582398626929-4aaba43ffd66?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80']
    },
    {
      id: '4',
      title: 'Combinaison de ski 6 ans',
      category: 'Prêter',
      type: 'Vêtement hiver',
      date: '17/04/2025',
      imageUrl: null,
      images: []
    },
    {
      id: '5',
      title: 'Bâtons de ski 90cm',
      category: 'Donner',
      type: 'Équipement ski',
      date: '16/04/2025',
      imageUrl: 'https://images.unsplash.com/photo-1607348896103-2f53aa301afd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      images: ['https://images.unsplash.com/photo-1607348896103-2f53aa301afd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80']
    }
  ]);

  // Fonction pour ajouter une nouvelle annonce
  const addAnnonce = (nouvelleAnnonce) => {
    // Générer un ID unique (dans une vraie application, cela viendrait du backend)
    const newId = (parseInt(annonces[0]?.id || '0') + 1).toString();
    
    // Formater la date actuelle
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    
    // Traitement des images
    const allImages = nouvelleAnnonce.images || [];
    
    // Créer l'annonce avec les valeurs par défaut
    const annonceComplete = {
      id: newId,
      title: nouvelleAnnonce.title,
      category: nouvelleAnnonce.category,
      type: nouvelleAnnonce.type || 'Autre',
      date: formattedDate,
      isNew: true,
      imageUrl: allImages.length > 0 ? allImages[0] : null,
      images: allImages,
      condition: nouvelleAnnonce.condition,
      description: nouvelleAnnonce.description,
      price: nouvelleAnnonce.price,
      duration: nouvelleAnnonce.duration
    };
    
    // Ajouter l'annonce au début de la liste
    setAnnonces([annonceComplete, ...annonces]);
    
    return annonceComplete;
  };

  // Valeur du contexte à partager
  const value = {
    annonces,
    setAnnonces,
    addAnnonce
  };

  return (
    <AnnonceContext.Provider value={value}>
      {children}
    </AnnonceContext.Provider>
  );
};

export default AnnonceContext;