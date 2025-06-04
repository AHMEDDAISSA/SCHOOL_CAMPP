import React, { useContext, useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, ActivityIndicator, SafeAreaView, Platform, Alert, Share, Dimensions, TextInput, Switch, KeyboardAvoidingView, Pressable } from 'react-native';
import Back from "../../../assets/images/back.svg";
import Dark_back from "../../../assets/images/dark_back.svg";
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import ThemeContext from '../../../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import AnnonceContext from '../../../contexts/AnnonceContext';
import { router, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { updateAnnonce, getUserByEmailApi } from '../../../services/api'; 





// Get screen width for responsive designs
const { width } = Dimensions.get('window');

export default function AnnonceDetail() {
  const { theme, darkMode, profileData } = useContext(ThemeContext);
  const { annonces, deleteAnnonceMeth, refreshAnnonces } = useContext(AnnonceContext);
  
  // Utiliser useLocalSearchParams pour récupérer l'ID depuis l'URL
  const params = useLocalSearchParams();
  const paramId = params.id;

  const [authorData, setAuthorData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  
  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  // Form state variables (for edit mode)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [images, setImages] = useState([]);
  const [missingFields, setMissingFields] = useState([]);
  const [email, setEmail] = useState('');
  const [camp, setCamp] = useState('');

  // ID state to store the valid ID from different sources
  const [id, setId] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  // Catégories disponibles
  const categories = [
    { id: '1', name: 'Donner', icon: 'gift-outline' },
    { id: '2', name: 'Prêter', icon: 'swap-horizontal-outline' },
    { id: '3', name: 'Emprunter', icon: 'hand-left-outline' },
    { id: '6', name: 'Échanger', icon: 'repeat-outline' },
    { id: '4', name: 'Louer', icon: 'cash-outline' },
    { id: '5', name: 'Acheter', icon: 'cart-outline' },
  ];

  const fetchAuthorData = async (email) => {
  if (!email) return;
  
  try {
    const userData = await getUserByEmailApi(email);
    console.log("Données de l'auteur récupérées:", userData);
    console.log("URL d'image récupérée:", userData?.profileImageUrl || userData?.profileImage);
    setAuthorData(userData);
  } catch (error) {
    console.error("Erreur lors de la récupération des données de l'auteur:", error);
  }
};


   const getContactButtonStyle = (contactMethod) => {
    switch(contactMethod) {
      case 'email':
        return {
          backgroundColor: '#4285F4',
          icon: 'mail-outline',
          text: 'Contacter par Email'
        };
      case 'phone':
        return {
          backgroundColor: '#34A853',
          icon: 'call-outline',
          text: 'Contacter par Téléphone'
        };
      default:
        return {
          backgroundColor: '#836EFE',
          icon: 'chatbubble-outline',
          text: 'Envoyer un Message'
        };
    }
  };
   const { backgroundColor, icon, text } = getContactButtonStyle(annonce?.preferredContact || 'app');

  // Types d'objets
  const itemTypes = [
    "Vêtement hiver", "Équipement ski", "Équipement neige", "Chaussures", "Décoration", "Outil", "Tente", "Autre"
  ];
  
  // États des objets
  const itemConditions = [
    "Neuf", "Très bon état", "Bon état", "État moyen", "À réparer"
  ];

  const [fontsLoaded] = useFonts({
    Montserrat_700Bold,
    Montserrat_600SemiBold,
    Montserrat_500Medium,
  });

  const campOptions = [
    "Camp De Ski", "Camp Vert"
  ];

  const getContactButtonInfo = (contactMethod) => {
  switch(contactMethod) {
    case 'email':
      return {
        icon: 'mail-outline',
        text: 'Email',
        color: '#4285F4' // Couleur bleue pour email
      };
    case 'phone':
      return {
        icon: 'call-outline',
        text: 'Téléphone',
        color: '#34A853' // Couleur verte pour téléphone
      };
    case 'app':
    default:
      return {
        icon: 'chatbubble-outline',
        text: 'Message',
        color: '#836EFE' // Couleur violette originale pour message app
      };
  }
};
useEffect(() => {
  if (annonce && userEmail) {
    const ownershipStatus = userEmail === annonce.email;
    const canEdit = ownershipStatus || isAdmin; // Admin peut toujours éditer
    
    setIsOwner(ownershipStatus);
    
    console.log("Access control check:", { 
      userEmail, 
      annonceEmail: annonce.email, 
      isOwner: ownershipStatus,
      isAdmin,
      canEdit 
    });
  }
}, [annonce, userEmail, isAdmin]);

  useEffect(() => {
  const getUserEmail = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem('userEmail');
      if (storedEmail) {
        setUserEmail(storedEmail);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'email:', error);
    }
  };
  
  getUserEmail();
}, []);

useEffect(() => {
  const getUserData = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem('userEmail');
      const adminStatus = await AsyncStorage.getItem('isAdmin');
      const userRole = await AsyncStorage.getItem('userRole'); // Si vous stockez le rôle
      
      if (storedEmail) {
        setUserEmail(storedEmail);
      }
      
      // Vérifier si l'utilisateur est admin de plusieurs façons
      const isUserAdmin = adminStatus === 'true' || 
                         userRole === 'admin' || 
                         (profileData && profileData.role === 'admin');
      
      setIsAdmin(isUserAdmin);
      
      console.log("User data loaded:", {
        email: storedEmail,
        isAdmin: isUserAdmin,
        adminStatus,
        userRole
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
    }
  };
  
  getUserData();
}, [profileData]);
  
  // Récupérer l'ID de l'annonce depuis les différentes sources possibles
  useEffect(() => {
    const getIdFromMultipleSources = async () => {
      try {
        // Essai depuis les paramètres d'URL
        const urlParamId = paramId;
        
        // Essai depuis AsyncStorage
        const storedId = await AsyncStorage.getItem('currentAnnonceId');
        
        // Récupérer depuis les segments d'URL
        const urlSegments = window.location?.pathname?.split('/') || [];
        const lastSegment = urlSegments[urlSegments.length - 1];
        
        console.log("ID sources:", {
          "From URL params": urlParamId,
          "From AsyncStorage": storedId,
          "From URL segments": lastSegment
        });
        
        // Utiliser le premier ID disponible
        const finalId = urlParamId || storedId || lastSegment;
        if (finalId) {
          console.log("Using final ID:", finalId);
          setId(finalId);
        } else {
          setError("Impossible de trouver l'identifiant de l'annonce");
        }
        
      } catch (e) {
        console.error("Error retrieving ID:", e);
        setError("Une erreur s'est produite lors de la récupération de l'identifiant");
      }
    };
    
    getIdFromMultipleSources();
  }, [paramId]);

  // Charger les données de l'annonce une fois que nous avons l'ID
  useEffect(() => {
  if (!id || !annonces || !Array.isArray(annonces)) {
    return;
  }
  
  console.log("Looking for annonce with ID:", id);
  
  // Rechercher l'annonce par ID
  const foundAnnonce = annonces.find(item => 
    (item._id && (item._id === id || item._id.toString() === id)) || 
    (item.id && (item.id === id || item.id.toString() === id))
  );
  
  if (foundAnnonce) {
    console.log("Annonce trouvée:", foundAnnonce.title);
    setAnnonce(foundAnnonce);
    
    // Initialiser les champs du formulaire
    setTitle(foundAnnonce.title || '');
    setDescription(foundAnnonce.description || '');
    setCategory(foundAnnonce.category || '');
    setType(foundAnnonce.type || '');
    setDuration(foundAnnonce.duration || '');
    setPrice(foundAnnonce.price || '');
    setCondition(foundAnnonce.condition || '');
    setCamp(foundAnnonce.camp || '');
    
    // Récupérer l'email de contact
    const emailToUse = foundAnnonce.email || 
                    (foundAnnonce.contact && foundAnnonce.contact.email) || 
                    (profileData && profileData.email) || '';
    setEmail(emailToUse);

    // Gérer les images
    const annonceImages = [];
    if (foundAnnonce.images && foundAnnonce.images.length > 0) {
      annonceImages.push(...foundAnnonce.images);
    } else if (foundAnnonce.imageUrl) {
      annonceImages.push(foundAnnonce.imageUrl);
    }
    setImages(annonceImages);
    
    // Récupérer les informations de l'auteur
    fetchAuthorData(foundAnnonce.email);
    
    setLoading(false);
  } else {
    console.log("Annonce not found");
    setError('Annonce non trouvée');
    setLoading(false);
  }
}, [annonces, id, profileData]);

  const goBack = () => {
    if (isEditMode) {
      Alert.alert(
        "Quitter le mode d'édition",
        "Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir quitter ?",
        [
          { text: "Rester", style: "cancel" },
          { text: "Quitter", onPress: () => setIsEditMode(false) }
        ]
      );
    } else {
      router.back();
    }
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  // Image handling functions
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (images.length >= 5) {
        Toast.show({
          type: 'error',
          text1: 'Maximum atteint',
          text2: 'Vous ne pouvez pas ajouter plus de 5 images.',
          position: 'bottom'
        });
      } else {
        setImages([...images, result.assets[0].uri]);
      }
    }
  };

  const takePhoto = async () => {
    let permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Toast.show({
        type: 'error',
        text1: 'Permission refusée',
        text2: 'Vous devez autoriser l\'accès à l\'appareil photo pour prendre une photo.',
        position: 'bottom'
      });
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (images.length >= 5) {
        Toast.show({
          type: 'error',
          text1: 'Maximum atteint',
          text2: 'Vous ne pouvez pas ajouter plus de 5 images.',
          position: 'bottom'
        });
      } else {
        setImages([...images, result.assets[0].uri]);
      }
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    
    Toast.show({
      type: 'info',
      text1: 'Image supprimée',
      position: 'bottom',
      visibilityTime: 2000
    });
  };

  const handleContact = (item) => {
  const contactMethod = item.preferredContact || 'app';
  
  switch(contactMethod) {
    case 'email':
      // Open email app with pre-filled subject and body
      const emailSubject = `À propos de votre annonce: ${item.title}`;
      const emailBody = `Bonjour,\n\nJe suis intéressé(e) par votre annonce "${item.title}".\nEst-ce toujours disponible?\n\nCordialement.`;
      const emailUrl = `mailto:${item.contactEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      
      Linking.canOpenURL(emailUrl)
        .then(supported => {
          if (supported) {
            return Linking.openURL(emailUrl);
          } else {
            Alert.alert(
              'Erreur',
              "Impossible d'ouvrir l'application email",
              [{ text: 'OK' }]
            );
          }
        })
        .catch(err => {
          console.error('Erreur lors de l\'ouverture de l\'email:', err);
          Alert.alert(
            'Erreur',
            "Une erreur est survenue lors de l'ouverture de l'application email",
            [{ text: 'OK' }]
          );
        });
      break;
    
    case 'phone':
      // Show options: Call, SMS, WhatsApp
      Alert.alert(
        'Contacter par téléphone',
        'Comment souhaitez-vous contacter cette personne?',
        [
          {
            text: 'Appeler',
            onPress: () => {
              const phoneUrl = `tel:${item.contactPhone}`;
              Linking.canOpenURL(phoneUrl)
                .then(supported => {
                  if (supported) {
                    return Linking.openURL(phoneUrl);
                  } else {
                    Alert.alert('Erreur', "Impossible d'ouvrir l'application téléphone");
                  }
                })
                .catch(err => {
                  console.error('Erreur lors de l\'appel:', err);
                  Alert.alert('Erreur', "Une erreur est survenue");
                });
            }
          },
          {
            text: 'SMS',
            onPress: () => {
              const smsUrl = `sms:${item.contactPhone}?body=${encodeURIComponent(`Bonjour, je suis intéressé(e) par votre annonce "${item.title}". Est-ce toujours disponible?`)}`;
              Linking.canOpenURL(smsUrl)
                .then(supported => {
                  if (supported) {
                    return Linking.openURL(smsUrl);
                  } else {
                    Alert.alert('Erreur', "Impossible d'envoyer un SMS");
                  }
                })
                .catch(err => {
                  console.error('Erreur lors de l\'envoi du SMS:', err);
                  Alert.alert('Erreur', "Une erreur est survenue");
                });
            }
          },
          {
            text: 'WhatsApp',
            onPress: () => {
              // Format phone number for WhatsApp (remove spaces, add country code if needed)
              let whatsappNumber = item.contactPhone?.replace(/\s+/g, '') || '';
              if (whatsappNumber.startsWith('0')) {
                whatsappNumber = `41${whatsappNumber.substring(1)}`;  // Add Swiss code for example
              }
              
              const whatsappUrl = `whatsapp://send?phone=${whatsappNumber}&text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par votre annonce "${item.title}". Est-ce toujours disponible?`)}`;
              
              Linking.canOpenURL(whatsappUrl)
                .then(supported => {
                  if (supported) {
                    return Linking.openURL(whatsappUrl);
                  } else {
                    Alert.alert('Erreur', "WhatsApp n'est pas installé sur votre appareil");
                  }
                })
                .catch(err => {
                  console.error('Erreur lors de l\'ouverture de WhatsApp:', err);
                  Alert.alert('Erreur', "Une erreur est survenue");
                });
            }
          },
          {
            text: 'Annuler',
            style: 'cancel'
          }
        ]
      );
      break;
    
    case 'app':
    default:
      // Navigate to in-app messaging
      router.push({
        pathname: '(screens)/chat_screen',
        params: { 
          id: Date.now(),  // Generate a unique ID
          advertId: item.id,
          name: item.contactName || 'Propriétaire'
        }
      });
      break;
  }
};

  const handleDeleteAnnonce = useCallback(() => {
  Alert.alert(
    "Confirmation de suppression",
    "Êtes-vous sûr de vouloir supprimer cette annonce ?",
    [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          setIsDeleting(true);
          try {
            const annonceId = annonce._id || annonce.id;
            // Passer également le statut d'administrateur à la fonction de suppression
            const result = await deleteAnnonceMeth(annonceId, userEmail, isAdmin);
            
            if (result.success) {
              Toast.show({
                type: 'success',
                text1: result.message || 'Annonce supprimée avec succès',
                visibilityTime: 3000,
              });
              router.back();
            } else {
              Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: result.message || 'Impossible de supprimer cette annonce',
                visibilityTime: 3000,
              });
            }
          } catch (error) {
            console.error("Erreur lors de la suppression:", error);
            Toast.show({
              type: 'error',
              text1: 'Erreur',
              text2: 'Une erreur inattendue s\'est produite',
              visibilityTime: 3000,
            });
          } finally {
            setIsDeleting(false);
          }
        }
      }
    ]
  );
}, [annonce, deleteAnnonceMeth, userEmail, isAdmin]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Découvrez cette annonce : ${annonce.title}\nType: ${annonce.type}\n${annonce.description || ''}`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erreur lors du partage',
        visibilityTime: 2000,
      });
    }
  }, [annonce]);

   const getContactIcon = (contactMethod) => {
  switch(contactMethod) {
    case 'email': return 'mail-outline';
    case 'phone': return 'call-outline';
    case 'app': 
    default: return 'chatbubble-outline';
  }
};

  // Form validation
  const validateForm = () => {
  const missing = [];
  
  if (!title) missing.push('titre');
  if (!description) missing.push('description');
  if (!category) missing.push('catégorie');
  if (!type) missing.push('type d\'objet');
  if (!camp) missing.push('camp'); 
  if (!email) missing.push('email');
  if (images.length === 0) missing.push('photos');
  
  // Vérifier le prix si la catégorie est "Louer" ou "Acheter"
  if ((category === 'Louer' || category === 'Acheter') && !price) {
    missing.push('prix');
  }
  
  // Vérifier la durée si la catégorie est "Louer" ou "Emprunter"
  if ((category === 'Louer' || category === 'Emprunter') && !duration) {
    missing.push('durée');
  }
  
  setMissingFields(missing);
  return missing.length === 0;
};

  // Update annonce submission
  const handleSubmit = async () => {
  if (!validateForm()) {
    Toast.show({
      type: 'error',
      text1: 'Champs obligatoires manquants',
      text2: `Veuillez remplir les champs suivants: ${missingFields.join(', ')}.`,
      position: 'bottom',
      visibilityTime: 4000
    });
    return;
  }
  
  setIsSubmitting(true);
  
  try {
    const annonceId = annonce._id || annonce.id;
    
    const updatedData = {
      title,
      description,
      category,
      type,
      condition,
      price,
      duration,
      images,
      camp,
      email,
    };
    
    const result = await updateAnnonce(annonceId, updatedData, userEmail, isAdmin);
    
    if (result.success) {
      setIsEditMode(false);
      Toast.show({
        type: 'success',
        text1: result.message || 'Annonce mise à jour avec succès',
        position: 'bottom',
        visibilityTime: 3000
      });
      
      // Recharger l'annonce après mise à jour
      setTimeout(() => {
        refreshAnnonces().then(() => {
          setActiveImageIndex(0);
        });
      }, 500);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: result.message || 'Impossible de mettre à jour cette annonce',
        position: 'bottom',
        visibilityTime: 3000
      });
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'annonce:", error);
    Toast.show({
      type: 'error',
      text1: 'Erreur',
      text2: 'Une erreur inattendue s\'est produite',
      position: 'bottom',
      visibilityTime: 3000
    });
  } finally {
    setIsSubmitting(false);
  }
};

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Donner': return 'gift-outline';
      case 'Prêter': return 'swap-horizontal-outline';
      case 'Emprunter': return 'hand-left-outline';
      case 'Louer': return 'cash-outline';
      case 'Acheter': return 'cart-outline';
      case 'Échanger': return 'repeat-outline';
      default: return 'document-outline';
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Donner': return '#4CAF50';
      case 'Prêter': return '#2196F3';
      case 'Emprunter': return '#FF9800';
      case 'Louer': return '#9C27B0';
      case 'Acheter': return '#F44336';
      case 'Échanger': return '#009688';
      default: return '#39335E';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const today = new Date();
      // Gestion des différents formats de date possibles
      let date;
      
      if (typeof dateString === 'string' && dateString.includes('/')) {
        // Format "DD/MM/YYYY"
        const parts = dateString.split('/');
        if (parts.length === 3) {
          date = new Date(parts[2], parts[1] - 1, parts[0]);
        } else {
          return dateString; // Format non reconnu, retourner tel quel
        }
      } else {
        // Essayer comme ISO ou autre format standard
        date = new Date(dateString);
      }
      
      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        return dateString; // Date invalide, retourner telle quelle
      }
      
      // Check if it's today
      if (date.toDateString() === today.toDateString()) {
        return "Aujourd'hui";
      }
      
      // Check if it's yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return "Hier";
      }
      
      // Otherwise return the formatted date
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch (error) {
      console.error('Erreur de formatage de la date:', error);
      return dateString; // En cas d'erreur, retourner la chaîne d'origine
    }
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#39335E" />
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <StatusBar style={darkMode ? 'light' : 'dark'} />
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={goBack} accessibilityLabel="Retour" accessibilityRole="button">
              {darkMode ? <Dark_back /> : <Back />}
            </TouchableOpacity>
            <Text style={[styles.heading, { color: theme.color }]}>Annonce</Text>
            <View style={styles.headerRightPlaceholder} />
          </View>
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.color }]}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={goBack}>
              <Text style={styles.retryButtonText}>Retourner</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!annonce) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <StatusBar style={darkMode ? 'light' : 'dark'} />
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={goBack} accessibilityLabel="Retour" accessibilityRole="button">
              {darkMode ? <Dark_back /> : <Back />}
            </TouchableOpacity>
            <Text style={[styles.heading, { color: theme.color }]}>Annonce</Text>
            <View style={styles.headerRightPlaceholder} />
          </View>
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.color }]}>Annonce non disponible</Text>
            <TouchableOpacity style={styles.retryButton} onPress={goBack}>
              <Text style={styles.retryButtonText}>Retourner</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={goBack} 
            accessible={true} 
            accessibilityLabel="Retour" 
            accessibilityRole="button"
          >
            {darkMode ? <Dark_back /> : <Back />}
          </TouchableOpacity>
          <Text style={[styles.heading, { color: theme.color }]}>
            {isEditMode ? "Modifier l'annonce" : "Détails de l'annonce"}
          </Text>
          {isEditMode ? (
            <View style={styles.headerRightPlaceholder} />
          ) : (
            <TouchableOpacity 
              onPress={handleShare}
              accessible={true}
              accessibilityLabel="Partager l'annonce"
              accessibilityRole="button"
            >
              <Ionicons name="share-outline" size={24} color={theme.color} />
            </TouchableOpacity>
          )}
        </View>

        {isEditMode ? (
          // EDIT MODE (Form)
          <ScrollView 
            style={styles.formContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formContent}
          >
            {/* Indication champs obligatoires */}
            <View style={styles.requiredFieldsNote}>
              <Text style={[styles.requiredFieldsText, {color: theme.color}]}>
                Les champs marqués d'un astérisque (*) sont obligatoires
              </Text>
            </View>
            
            {/* Section titre */}
            <View style={styles.formSection}>
              <Text style={[styles.label, {color: theme.color}]}>
                Titre de l'annonce<Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input, 
                  {backgroundColor: theme.cardbg2 || '#F5F5F5', color: theme.color},
                  !title && missingFields.includes('titre') ? styles.inputError : null
                ]}
                placeholder="Ex: Gants de ski taille 8 en bon état"
                placeholderTextColor="#A8A8A8"
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
            </View>

            {/* Section camp */}
            <View style={styles.formSection}>
              <Text style={[styles.label, {color: theme.color}]}>
                Camp<Text style={styles.requiredStar}>*</Text>
              </Text>
              <View style={[
                styles.typeButtonsContainer, 
                !camp && missingFields.includes('camp') ? styles.containerError : null
              ]}>
                {campOptions.map((campOption, index) => (
                  <Pressable 
                    key={index}
                    style={({ pressed }) => [
                      styles.typeButton,
                      { 
                        backgroundColor: darkMode 
                          ? (camp === campOption ? '#5D5FEF' : (pressed ? '#4D4D4D' : '#363636'))
                          : (camp === campOption ? '#39335E' : (pressed ? '#D0D0D0' : '#F0F0F0')),
                        opacity: pressed ? 0.9 : 1,
                      }
                    ]}
                    onPress={() => setCamp(campOption)}
                  >
                    <Text 
                      style={[
                        styles.typeText, 
                        {color: camp === campOption 
                          ? '#FFFFFF' 
                          : (darkMode ? '#FFFFFF' : '#39335E')
                        }
                      ]}
                    >
                      {campOption}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            
            {/* Section catégorie */}
            <View style={styles.formSection}>
              <Text style={[styles.label, {color: theme.color}]}>
                Catégorie<Text style={styles.requiredStar}>*</Text>
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={[
                  styles.categoriesContainer,
                  !category && missingFields.includes('catégorie') ? styles.scrollViewError : null
                ]}
                contentContainerStyle={styles.categoriesContentContainer}
              >
                {categories.map(cat => (
                  <TouchableOpacity 
                    key={cat.id}
                    style={[
                      styles.categoryButton, 
                      { backgroundColor: darkMode 
                        ? (category === cat.name ? '#5D5FEF' : '#363636') 
                        : (category === cat.name ? '#39335E' : '#F0F0F0') 
                      }
                    ]}
                    onPress={() => setCategory(cat.name)}
                  >
                    <View style={[
                      styles.categoryIconContainer,
                      { backgroundColor: category === cat.name 
                        ? (darkMode ? '#ffffff' : '#39335E')
                        : (darkMode ? '#5D5FEF' : '#E6E6FA') 
                      }
                    ]}>
                      <Ionicons 
                        name={cat.icon} 
                        size={20} 
                        color={category === cat.name 
                          ? (darkMode ? '#363636' : '#ffffff')
                          : (darkMode ? '#FFFFFF' : '#5D5FEF')
                        } 
                      />
                    </View>
                    <Text 
                      style={[
                        styles.categoryText, 
                        {color: category === cat.name 
                          ? '#FFFFFF' 
                          : (darkMode ? '#FFFFFF' : '#39335E')
                        }
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {/* Section Type */}
            <View style={styles.formSection}>
              <Text style={[styles.label, {color: theme.color}]}>
                Type d'objet<Text style={styles.requiredStar}>*</Text>
              </Text>
              <View style={[
                styles.typeButtonsContainer, 
                !type && missingFields.includes('type d\'objet') ? styles.containerError : null
              ]}>
                {itemTypes.map((itemType, index) => (
                  <Pressable 
                    key={index}
                    style={({ pressed }) => [
                      styles.typeButton,
                      { 
                        backgroundColor: darkMode 
                          ? (type === itemType ? '#5D5FEF' : (pressed ? '#4D4D4D' : '#363636'))
                          : (type === itemType ? '#39335E' : (pressed ? '#D0D0D0' : '#F0F0F0')),
                        opacity: pressed ? 0.9 : 1,
                      }
                    ]}
                    onPress={() => setType(itemType)}
                  >
                    <Text 
                      style={[
                        styles.typeText, 
                        {color: type === itemType 
                          ? '#FFFFFF' 
                          : (darkMode ? '#FFFFFF' : '#39335E')
                        }
                      ]}
                    >
                      {itemType}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            
            {/* Section Photos */}
            <View style={styles.formSection}>
              <Text style={[styles.label, {color: theme.color}]}>
                Photos (max 5)<Text style={styles.requiredStar}>*</Text>
              </Text>
              <View style={[
                styles.imagePickerContainer,
                images.length === 0 && missingFields.includes('photos') ? styles.containerError : null
              ]}>
                {images.length < 5 && (
                  <View style={styles.imageButtonsContainer}>
                    <TouchableOpacity 
                      style={[styles.imageButton, {backgroundColor: theme.cardbg2 || '#F5F5F5'}]}
                      onPress={pickImage}
                    >
                      <Ionicons name="image-outline" size={24} color={darkMode ? '#FFFFFF' : '#39335E'} />
                      <Text style={[styles.imageButtonText, {color: theme.color}]}>Galerie</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.imageButton, {backgroundColor: theme.cardbg2 || '#F5F5F5'}]}
                      onPress={takePhoto}
                    >
                      <Ionicons name="camera-outline" size={24} color={darkMode ? '#FFFFFF' : '#39335E'} />
                      <Text style={[styles.imageButtonText, {color: theme.color}]}>Appareil photo</Text>
                    </TouchableOpacity>
                  </View>
                )}
                        
                {/* Affichage des images sélectionnées */}
                {images.length > 0 && (
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.selectedImagesContainer}
                  >
                    {images.map((image, index) => (
                      <View key={index} style={styles.imagePreviewContainer}>
                        <Image source={{ uri: image }} style={styles.imagePreview} />
                        <TouchableOpacity 
                          style={styles.removeImageButton}
                          onPress={() => removeImage(index)}
                        >
                          <Ionicons name="close-circle" size={24} color="#EB001B" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>
            
            {/* Section Description */}
            <View style={styles.formSection}>
              <Text style={[styles.label, {color: theme.color}]}>
                Description<Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.textArea, 
                  {backgroundColor: theme.cardbg2 || '#F5F5F5', color: theme.color},
                  !description && missingFields.includes('description') ? styles.inputError : null
                ]}
                placeholder="Décrivez votre objet (état, taille, couleur, etc.)"
                placeholderTextColor="#A8A8A8"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            {/* Section Email */}
            <View style={styles.formSection}>
              <Text style={[styles.label, {color: theme.color}]}>
                Email<Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input, 
                  {backgroundColor: theme.cardbg2 || '#F5F5F5', color: theme.color},
                  !email && missingFields.includes('email') ? styles.inputError : null
                ]}
                placeholder="Votre email de contact"
                placeholderTextColor="#A8A8A8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            {/* Section état */}
            <View style={styles.formSection}>
              <Text style={[styles.label, {color: theme.color}]}>État</Text>
              <View style={styles.conditionButtonsContainer}>
                {itemConditions.map((itemCondition, index) => (
                  <Pressable 
                    key={index}
                    style={({ pressed }) => [
                      styles.conditionButton,
                      { 
                        backgroundColor: darkMode 
                          ? (condition === itemCondition ? '#5D5FEF' : (pressed ? '#4D4D4D' : '#363636'))
                          : (condition === itemCondition ? '#39335E' : (pressed ? '#D0D0D0' : '#F0F0F0')),
                        opacity: pressed ? 0.9 : 1,
                      }
                    ]}
                    onPress={() => setCondition(itemCondition)}
                  >
                    <Text 
                      style={[
                        styles.conditionText, 
                        {color: condition === itemCondition 
                          ? '#FFFFFF' 
                          : (darkMode ? '#FFFFFF' : '#39335E')
                        }
                      ]}
                    >
                      {itemCondition}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            
            {/* Afficher champs selon la catégorie sélectionnée */}
            {/* Ajout de Prêter et Emprunter pour la durée */}
            {(category === 'Louer' || category === 'Prêter' || category === 'Emprunter') && (
  <View style={styles.formSection}>
    <Text style={[styles.label, {color: theme.color}]}>
      Durée disponible
      {(category === 'Louer' || category === 'Emprunter') && <Text style={styles.requiredStar}>*</Text>}
    </Text>
    <TextInput
      style={[
        styles.input, 
        {backgroundColor: theme.cardbg2 || '#F5F5F5', color: theme.color},
        (category === 'Louer' || category === 'Emprunter') && !duration && missingFields.includes('durée') ? styles.inputError : null
      ]}
      placeholder="Ex: 1 semaine, 2 mois, etc."
      placeholderTextColor="#A8A8A8"
      value={duration}
      onChangeText={setDuration}
    />
  </View>
)}

{/* Prix pour Louer et Acheter */}
{(category === 'Louer' || category === 'Acheter') && (
  <View style={styles.formSection}>
    <Text style={[styles.label, {color: theme.color}]}>
      Prix<Text style={styles.requiredStar}>*</Text>
    </Text>
    <TextInput
      style={[
        styles.input, 
        {backgroundColor: theme.cardbg2 || '#F5F5F5', color: theme.color},
        !price && missingFields.includes('prix') ? styles.inputError : null
      ]}
      placeholder="Ex: 10€, 50€, etc."
      placeholderTextColor="#A8A8A8"
      value={price}
      onChangeText={setPrice}
      keyboardType="numeric"
    />
  </View>
)}
            {/* Prix pour Louer et Acheter */}
            {(category === 'Louer' || category === 'Acheter') && (
              <View style={styles.formSection}>
                <Text style={[styles.label, {color: theme.color}]}>
                  Prix<Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input, 
                    {backgroundColor: theme.cardbg2 || '#F5F5F5', color: theme.color},
                    !price && missingFields.includes('prix') ? styles.inputError : null
                  ]}
                  placeholder="Ex: 10€, 50€, etc."
                  placeholderTextColor="#A8A8A8"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />
              </View>
            )}
            
            {/* Boutons d'action */}
            <View style={styles.editActionButtons}>
              <TouchableOpacity 
                style={[styles.cancelButton]}
                onPress={() => setIsEditMode(false)}
              >
                <Ionicons name="close-circle-outline" size={24} color="white" />
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.submitButton]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={24} color="white" />
                    <Text style={styles.submitButtonText}>Mettre à jour</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          // VIEW MODE (Display)
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Image display */}
            <View style={[styles.imageContainer, { backgroundColor: darkMode ? '#444444' : '#E0E0E0' }]}>
              {images.length > 0 ? (
                <Image
                  source={{ uri: images[activeImageIndex] }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons 
                    name={getCategoryIcon(annonce.category)} 
                    size={60} 
                    color={darkMode ? '#666666' : '#CCCCCC'} 
                  />
                </View>
              )}
              
              {/* Category badge */}
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(annonce.category) }]}>
                <Text style={styles.categoryBadgeText}>{annonce.category}</Text>
              </View>
            </View>
            
            {/* Image pagination dots if multiple images */}
            {images.length > 1 && (
              <View style={styles.paginationContainer}>
                {images.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.paginationDot,
                      { backgroundColor: index === activeImageIndex ? '#39335E' : '#D0D0D0' }
                    ]}
                    onPress={() => setActiveImageIndex(index)}
                  />
                ))}
              </View>
            )}

            <View style={styles.contentContainer}>
              <Text style={[styles.title, { color: darkMode ? '#FFFFFF' : '#39335E' }]}>
                {annonce.title}
              </Text>
              
            <View style={[styles.userContainer, { backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
  <Image 
    source={authorData?.profileImageUrl ? { uri: authorData.profileImageUrl } :
           authorData?.profileImage ? { uri: authorData.profileImage } :
           require('../../../assets/images/placeholder.png')}
    style={styles.userAvatar}
  />
  <View>
    <Text style={[styles.userName, { color: darkMode ? '#FFFFFF' : '#39335E' }]}>
      {authorData?.fullName || 
      `${authorData?.first_name || ''} ${authorData?.last_name || ''}`.trim() || 
      'Utilisateur inconnu'}
    </Text>
    <Text style={[styles.userRole, { color: darkMode ? '#AAAAAA' : '#666666' }]}>
      Membre depuis {new Date().getFullYear()}
    </Text>
  </View>
</View>

              <View style={styles.infoContainer}>
  {annonce.condition && (
    <View style={styles.infoRow}>
      <Ionicons name="shield-checkmark-outline" size={18} color={darkMode ? '#AAAAAA' : '#666666'} />
      <Text style={[styles.infoText, { color: darkMode ? '#AAAAAA' : '#666666' }]}>
        État: {annonce.condition}
      </Text>
    </View>
  )}

  {annonce.camp && (
    <View style={styles.infoRow}>
      <Ionicons name="bonfire-outline" size={18} color={darkMode ? '#AAAAAA' : '#666666'} />
      <Text style={[styles.infoText, { color: darkMode ? '#AAAAAA' : '#666666' }]}>
        Camp: {annonce.camp}
      </Text>
    </View>
  )}

  {email && (
    <View style={styles.infoRow}>
      <Ionicons name="mail-outline" size={18} color={darkMode ? '#AAAAAA' : '#666666'} />
      <Text style={[styles.infoText, { color: darkMode ? '#AAAAAA' : '#666666' }]}>
        Email: {email}
      </Text>
    </View>
  )}
  
  {/* Display duration for Louer, Prêter, and Emprunter categories */}
  {(annonce.category === 'Louer' || 
    annonce.category === 'Prêter' || 
    annonce.category === 'Emprunter') && 
    annonce.duration && (
    <View style={styles.infoRow}>
      <Ionicons name="time-outline" size={18} color={darkMode ? '#AAAAAA' : '#666666'} />
      <Text style={[styles.infoText, { color: darkMode ? '#AAAAAA' : '#666666' }]}>
        Durée: {annonce.duration}
      </Text>
    </View>
  )}

  {/* Display price for Louer and Acheter categories */}
  {(annonce.category === 'Louer' || 
    annonce.category === 'Acheter') && 
    annonce.price && (
    <View style={styles.infoRow}>
      <Ionicons name="cash-outline" size={18} color={darkMode ? '#AAAAAA' : '#666666'} />
      <Text style={[styles.infoText, { color: darkMode ? '#AAAAAA' : '#666666' }]}>
        Prix: {annonce.price}€
      </Text>
    </View>
  )}
  
 <View style={styles.infoRow}>
  <Ionicons name="calendar-outline" size={18} color={darkMode ? '#AAAAAA' : '#666666'} />
  <Text style={[styles.infoText, { color: darkMode ? '#AAAAAA' : '#666666' }]}>
    Publié: {formatDate(annonce.date)}
  </Text>
</View>
</View>

              <Text style={[styles.descriptionTitle, { color: darkMode ? '#FFFFFF' : '#39335E' }]}>
                Description
              </Text>
              <Text style={[styles.description, { color: darkMode ? '#CCCCCC' : '#333333' }]}>
                {annonce.description || "Aucune description fournie."}
              </Text>
            </View>

            <View style={styles.actionButtons}>
        {/* Bouton de contact - visible seulement si ce n'est pas le propriétaire */}
        {!isOwner && !isAdmin && (
    <TouchableOpacity
      style={[styles.contactButton, { backgroundColor }]}
      onPress={() => handleContact(annonce)}
    >
      <Ionicons name={icon} size={20} color="white" />
      <Text style={styles.contactButtonText}>{text}</Text>
    </TouchableOpacity>
  )}
        
        {/* Boutons Modifier/Supprimer - visibles seulement pour le propriétaire */}
       {(isOwner || isAdmin) && (
  <>
    <TouchableOpacity 
      style={styles.editButton}
      onPress={toggleEditMode}
      disabled={isDeleting}
      accessible={true}
      accessibilityLabel="Modifier l'annonce"
      accessibilityRole="button"
    >
      <Ionicons name="pencil-outline" size={20} color="#FFFFFF" />
      <Text style={styles.editButtonText}>Modifier</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={[styles.deleteButton, { opacity: isDeleting ? 0.5 : 1 }]}
      onPress={handleDeleteAnnonce}
      disabled={isDeleting}
      accessible={true}
      accessibilityLabel="Supprimer l'annonce"
      accessibilityRole="button"
    >
      {isDeleting ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <>
          <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
          <Text style={styles.deleteButtonText}>Supprimer</Text>
        </>
      )}
    </TouchableOpacity>
  </>
)}
      </View>
      
      {/* Message informatif si l'utilisateur n'est pas propriétaire */}
      {!isOwner && isEditMode && (
        <View style={styles.notOwnerMessage}>
          <Text style={[styles.notOwnerText, { color: theme.color }]}>
            Vous ne pouvez pas modifier cette annonce car vous n'en êtes pas le propriétaire.
          </Text>
        </View>
      )}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 50 : 10,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerRightPlaceholder: {
    width: 24,
  },
  heading: {
    fontSize: 20,
    fontFamily: 'Montserrat_700Bold',
    flex: 1,
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
  },
  contentContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 15,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  userRole: {
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
  },
  infoContainer: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
    marginLeft: 8,
  },
  descriptionTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#836EFE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
    marginLeft: 7,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#39335E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
    marginLeft: 7,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#EB001B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Montserrat_600SemiBold',
    marginLeft: 7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#39335E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  // Form styles
  formContainer: {
    flex: 1,
  },
  formContent: {
    paddingBottom: 40,
  },
  requiredFieldsNote: {
    marginBottom: 20,
  },
  requiredFieldsText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
    fontStyle: 'italic',
  },
  formSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 8,
  },
  requiredStar: {
    color: '#EB001B',
    fontSize: 16,
  },
  input: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 16,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textArea: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 16,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 120,
  },
  categoriesContainer: {
    marginBottom: 10,
  },
  categoriesContentContainer: {
    paddingRight: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 25,
    marginRight: 10,
  },
  categoryIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  categoryText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14,
  },
  typeButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  typeButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    margin: 5,
    minWidth: width * 0.28,
    alignItems: 'center',
  },
  typeText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14,
  },
  conditionButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  conditionButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    margin: 5,
    minWidth: width * 0.28,
    alignItems: 'center',
  },
  conditionText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14,
  },
  imagePickerContainer: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  imageButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  imageButtonText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14,
    marginLeft: 8,
  },
  selectedImagesContainer: {
    marginBottom: 10,
  },
  imagePreviewContainer: {
    marginRight: 10,
    position: 'relative',
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 15,
  },
  inputError: {
    borderColor: '#EB001B',
    borderWidth: 1,
  },
  scrollViewError: {
    borderColor: '#EB001B',
    borderWidth: 1,
    borderRadius: 10,
  },
  containerError: {
    borderColor: '#EB001B',
    borderWidth: 1,
    borderRadius: 10,
    padding: 5,
  },
  editActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FF6347',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    marginLeft: 10,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    marginLeft: 10,
  },
   notOwnerMessage: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFE69C',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    margin: 20,
    marginTop: 0,
  },
  notOwnerText: {
    textAlign: 'center',
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
    color: '#856404',
  }
});
