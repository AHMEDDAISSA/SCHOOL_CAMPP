import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Switch, Image, KeyboardAvoidingView, Platform, ActivityIndicator, Pressable, Alert } from 'react-native';
import React, { useContext, useState, useEffect,useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Ajout d'AsyncStorage
import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import { router } from "expo-router";
import ThemeContext from '../../theme/ThemeContext';
import AnnonceContext from '../../contexts/AnnonceContext';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import PhoneInput from 'react-native-phone-number-input';
import { createAd, uploadMultipleImages, sendEmailOTP, verifyOTP } from '../../services/api'; // Ajouté les fonctions d'API
import Toast from 'react-native-toast-message';
import { createAnnounce } from '../../services/api'; 

const PublierAnnonce = () => {
  const { theme, darkMode, profileData } = useContext(ThemeContext); 
  // const { addAnnonce } = useContext(AnnonceContext);
  const phoneInput = useRef(null);
  

  const CustomPhoneInput = ({ defaultValue, defaultCode, onChangeText, onChangeFormattedText, containerStyle, textContainerStyle, textInputStyle, codeTextStyle, textInputProps, flagButtonStyle, hasError, theme }) => {
    return (
      <PhoneInput
        defaultValue={defaultValue}
        defaultCode={defaultCode}
        layout="first"
        onChangeText={onChangeText}
        onChangeFormattedText={onChangeFormattedText}
        containerStyle={[
          containerStyle,
          hasError && [styles.inputError, { borderColor: theme.log }]
        ]}
        textContainerStyle={[
          textContainerStyle,
          hasError && { backgroundColor: theme.background2 }
        ]}
        textInputStyle={textInputStyle}
        codeTextStyle={codeTextStyle}
        textInputProps={{
          ...textInputProps,
          placeholder: textInputProps.placeholder || 'Votre numéro de téléphone',
        }}
        flagButtonStyle={[
          flagButtonStyle,
          hasError && { backgroundColor: theme.background2 }
        ]}
        withDarkTheme={false}
        withShadow={false}
        autoFocus={false}
      />
    );
  };
  // Load fonts
  const [fontsLoaded] = useFonts({
    Montserrat_700Bold,
    Montserrat_600SemiBold,
    Montserrat_500Medium,
  });
  
  // États du formulaire
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [camp, setCamp] = useState(''); 
  
  
  // Nouveaux champs pour les coordonnées et préférences de communication
  const [userName, setUserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [showName, setShowName] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showEmail, setShowEmail] = useState(true);
  const [preferredContact, setPreferredContact] = useState('');
  const [isActive, setIsActive] = useState(true);
  

  const handlePhoneChange = (text) => {
    setPhoneNumber(text);
  };
  
  const handleFormattedPhoneChange = (text) => {
    const countryCode = phoneInput.current?.getCountryCode();
    if (countryCode) {
      setCountryCode(`+${countryCode}`);
    }
  };

  const handleContactMethodChange = (methodId) => {
  setPreferredContact(methodId);
  
  // Réinitialisez les erreurs de validation liées au téléphone
  if (methodId === 'phone' && !phoneNumber) {
    // Assurez-vous que missingFields est bien un tableau avant de modifier
    setMissingFields(prevFields => {
      const updatedFields = Array.isArray(prevFields) ? [...prevFields] : [];
      if (!updatedFields.includes('numéro de téléphone')) {
        updatedFields.push('numéro de téléphone');
      }
      return updatedFields;
    });
  } else {
    // Retirez l'erreur du téléphone si une autre méthode est sélectionnée
    setMissingFields(prevFields => {
      if (!Array.isArray(prevFields)) return [];
      return prevFields.filter(field => field !== 'numéro de téléphone');
    });
  }
};

  const isPhoneRequired = preferredContact === 'phone';
  const hasPhoneError = isPhoneRequired && !phoneNumber && Array.isArray(missingFields) && missingFields.includes('numéro de téléphone');

  // États pour l'authentification par OTP
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Permet de passer la vérification OTP pour test
  
  // Champs obligatoires
  const [missingFields, setMissingFields] = useState([]);
  
  // Catégories disponibles
  const categories = [
    { id: '1', name: 'Donner', icon: 'gift-outline' },
    { id: '2', name: 'Prêter', icon: 'swap-horizontal-outline' },
    { id: '3', name: 'Emprunter', icon: 'hand-left-outline' },
    { id: '6', name: 'Échanger', icon: 'repeat-outline' },
    { id: '4', name: 'Louer', icon: 'cash-outline' },
    { id: '5', name: 'Acheter', icon: 'cart-outline' },
  ];
  
  // Types d'objets (exemple)
  const itemTypes = [
    "Vêtement hiver", "Équipement ski", "Équipement neige", "Chaussures", "Décoration", "Outil", "Tente", "Autre"
  ];
  
  // États des objets
  const itemConditions = [
    "Neuf", "Très bon état", "Bon état", "État moyen", "À réparer"
  ];

  // Options de camps disponibles
  const campOptions = [
    "Camp De Ski", "Camp Vert"
  ];
  
  // Moyens de communication
  const contactMethods = [
    { id: 'email', name: 'Email', icon: 'mail-outline' },
    { id: 'phone', name: 'Téléphone', icon: 'call-outline' },
    { id: 'app', name: 'Application', icon: 'chatbubble-outline' },
  ];
  
  // Récupérer l'email de l'utilisateur depuis AsyncStorage au chargement du composant
  useEffect(() => {
    const getStoredEmail = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('userEmail');
        if (storedEmail) {
          setEmail(storedEmail);
        } else if (profileData && profileData.email) {
          // Utiliser l'email du contexte si disponible
          setEmail(profileData.email);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'email:", error);
      }
    };
    
    getStoredEmail();
  }, [profileData]);
  
  // Fonction pour envoyer OTP
  const handleSendOTP = async () => {
    if (!email) {
      Toast.show({
        type: 'error',
        text1: 'Email requis',
        text2: 'Veuillez entrer votre adresse email pour recevoir le code de vérification.',
        position: 'bottom'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Simuler l'envoi d'OTP (à remplacer par l'appel API réel)
      // await sendEmailOTP(email);
      setTimeout(() => {
        setOtpSent(true);
        setLoading(false);
        Toast.show({
          type: 'success',
          text1: 'Code envoyé',
          text2: 'Un code de vérification a été envoyé à votre adresse email.',
          position: 'bottom'
        });
      }, 1500);
    } catch (error) {
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible d\'envoyer le code de vérification.',
        position: 'bottom'
      });
    }
  };
  
  // Fonction pour vérifier OTP
  const handleVerifyOTP = async () => {
    if (!otp) {
      setOtpError('Veuillez entrer le code de vérification');
      return;
    }
    
    setLoading(true);
    
    try {
      // Simuler la vérification d'OTP (à remplacer par l'appel API réel)
      // await verifyOTP(email, otp);
      setTimeout(() => {
        setIsAuthenticated(true);
        setLoading(false);
        Toast.show({
          type: 'success',
          text1: 'Vérification réussie',
          text2: 'Vous pouvez maintenant publier votre annonce.',
          position: 'bottom'
        });
      }, 1500);
    } catch (error) {
      setLoading(false);
      setOtpError('Code de vérification incorrect');
    }
  };
  
  // Fonction pour sélectionner une image depuis la galerie
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (images.length >= 4) { // Modifié de 5 à 4
        Toast.show({
          type: 'error',
          text1: 'Maximum atteint',
          text2: 'Vous ne pouvez pas ajouter plus de 4 images.',
          position: 'bottom'
        });
      } else {
        setImages([...images, result.assets[0].uri]);
      }
    }
  };
  
  // Fonction pour prendre une photo avec l'appareil photo
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
      if (images.length >= 4) { // Modifié de 5 à 4
        Toast.show({
          type: 'error',
          text1: 'Maximum atteint',
          text2: 'Vous ne pouvez pas ajouter plus de 4 images.',
          position: 'bottom'
        });
      } else {
        setImages([...images, result.assets[0].uri]);
      }
    }
  };
  
  // Retirer une image
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
  
  // Réinitialiser le formulaire
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setType('');
    setDuration('');
    setPrice('');
    setCondition('');
    setCamp(''); // Réinitialiser le camp
    setImages([]);
    setIsActive(true);
    setPreferredContact('email');
    // Garder les coordonnées personnelles pour faciliter les futures publications
  };
  
  // Validation du formulaire
  const validateForm = () => {
    const missing = [];
    
     if (!title) missing.push('titre');
  if (!description) missing.push('description');
  if (!category) missing.push('catégorie');
  if (!type) missing.push('type d\'objet');
  if (!camp) missing.push('camp');
  if (images.length === 0) missing.push('photos');
  
  if ((category === 'Louer' || category === 'Acheter') && !price) {
    missing.push('prix');
  }
  
  if (category === 'Louer' && !duration) {
    missing.push('durée');
  }
  
  // Vérifier explicitement le moyen de communication préféré
  if (preferredContact === 'phone' && !phoneNumber) {
    missing.push('numéro de téléphone');
  }
  
  setMissingFields(missing);
  return missing.length === 0;
};
  
  // Soumission du formulaire
  const handleSubmit = async () => {
    
    if (preferredContact === 'phone' && !phoneNumber) {
    setMissingFields(prevFields => {
      if (!prevFields.includes('numéro de téléphone')) {
        return [...prevFields, 'numéro de téléphone'];
      }
      return prevFields;
    });
    
    Toast.show({
      type: 'error',
      text1: 'Numéro de téléphone requis',
      text2: 'Veuillez saisir votre numéro de téléphone pour le moyen de contact préféré.',
      position: 'bottom',
      visibilityTime: 3000
    });
    return;
  }

    if (!isAuthenticated) {
      Toast.show({
        type: 'error',
        text1: 'Authentification requise',
        text2: 'Veuillez vous authentifier avant de publier une annonce.',
        position: 'bottom'
      });
      return;
    }
    
    
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
    
    setLoading(true);
    
    try {
      
      const nouvelleAnnonce = {
        title,
        description,
        category,
        type,
        condition,
        camp, 
        price: category === 'Louer' || category === 'Acheter' ? price : '',
        duration: category === 'Louer' || category === 'Prêter' ? duration : '',
        images: images,
        isActive,
         // Informations de contact importantes:
        contactEmail: email,
        contactPhone: phoneNumber,
        contactName: userName,
        showEmail: showEmail,
        showPhone: showPhone,
        showName: showName,
        preferredContact: preferredContact, // IMPORTANT: cette propriété sera utilisée dans Inbox
        createdAt: new Date().toISOString()
      };
      
      
      // Ajouter l'annonce via le contexte
      const annonceAjoutee = createAnnounce(nouvelleAnnonce);      
      
      // Réinitialiser le formulaire
      resetForm();
      
      setTimeout(() => {
        setLoading(false);
        Toast.show({
          type: 'success',
          text1: 'Annonce publiée !',
          text2: 'Votre annonce a été publiée avec succès.',
          position: 'bottom',
          visibilityTime: 3000,
          onHide: () => router.replace('(tabs)/Annonces') 
        });
      }, 1000);
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'annonce:", error);
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Une erreur est survenue lors de la publication.',
        position: 'bottom',
        visibilityTime: 3000
      });
    }
  };
  
  // Navigation
  const back = () => {
    router.back();
  };
  
  // Show loading indicator when fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={[styles.loadingContainer, {backgroundColor: theme.background}]}>
        <ActivityIndicator size="large" color="#39335E" />
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, {backgroundColor: theme.background}]}
    >
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={back}
          accessible={true}
          accessibilityLabel="Retour"
          accessibilityHint="Retourner à l'écran précédent"
          accessibilityRole="button"
        >
          {darkMode ? <Dark_back /> : <Back />}
        </TouchableOpacity>
        <Text style={[styles.heading, {color:theme.color}]}>Publier une annonce</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>
      
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
          <Text style={[styles.label, {color: theme.color, marginBottom: 10}]}>
            Titre de l'annonce<Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input, 
              {backgroundColor: theme.cardbg2, color: theme.color},
              !title && missingFields.includes('titre') ? styles.inputError : null
            ]}
            placeholder="Ex: Gants de ski taille 8 en bon état"
            placeholderTextColor="#A8A8A8"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>
        
        {/* Section Camp (NOUVEAU) */}
        <View style={styles.formSection}>
          <Text style={[styles.label, {color: theme.color, marginBottom: 10}]}>
            Camp<Text style={styles.requiredStar}>*</Text>
          </Text>
          <View style={[
            styles.campButtonsContainer, 
            !camp && missingFields.includes('camp') ? styles.containerError : null
          ]}>
            {campOptions.map((campOption, index) => (
              <Pressable 
                key={index}
                style={({ pressed }) => [
                  styles.campButton,
                  { 
                    backgroundColor: darkMode 
                      ? (camp === campOption ? '#5D5FEF' : (pressed ? '#4D4D4D' : '#363636'))
                      : (camp === campOption ? '#39335E' : (pressed ? '#D0D0D0' : '#F0F0F0')),
                    opacity: pressed ? 0.9 : 1,
                  }
                ]}
                onPress={() => setCamp(campOption)}
              >
                <Ionicons 
                  name="flag" 
                  size={18} 
                  color={camp === campOption 
                    ? '#FFFFFF' 
                    : (darkMode ? '#FFFFFF' : '#39335E')} 
                  style={styles.campIcon}
                />
                <Text 
                  style={[
                    styles.campText, 
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
          <Text style={[styles.label, {color: theme.color, marginBottom: 10}]}>
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
                    ? (category === cat.id ? '#5D5FEF' : '#363636') 
                    : (category === cat.id ? '#39335E' : '#F0F0F0') 
                  }
                ]}
                onPress={() => setCategory(cat.id)}
              >
                <View style={[
                  styles.categoryIconContainer,
                  { backgroundColor: category === cat.id 
                    ? (darkMode ? '#ffffff' : '#39335E')
                    : (darkMode ? '#5D5FEF' : '#E6E6FA') 
                  }
                ]}>
                  <Ionicons 
                    name={cat.icon} 
                    size={20} 
                    color={category === cat.id 
                      ? (darkMode ? '#363636' : '#ffffff')
                      : (darkMode ? '#FFFFFF' : '#5D5FEF')
                    } 
                  />
                </View>
                <Text 
                  style={[
                    styles.categoryText, 
                    {color: category === cat.id 
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
          <Text style={[styles.label, {color: theme.color, marginBottom: 10}]}>
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
          <Text style={[styles.label, {color: theme.color, marginBottom: 10}]}>
            Photos (max 4)<Text style={styles.requiredStar}>*</Text>
          </Text>
          <View style={[
            styles.imagePickerContainer,
            images.length === 0 && missingFields.includes('photos') ? styles.containerError : null
          ]}>
            {images.length < 4 && ( // Modifié de 5 à 4
              <View style={styles.imageButtonsContainer}>
                <TouchableOpacity 
                  style={[styles.imageButton, {backgroundColor: theme.cardbg2}]}
                  onPress={pickImage}
                >
                  <Ionicons name="image-outline" size={24} color={darkMode ? '#FFFFFF' : '#39335E'} />
                  <Text style={[styles.imageButtonText, {color: theme.color}]}>Galerie</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.imageButton, {backgroundColor: theme.cardbg2}]}
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
          <Text style={[styles.label, {color: theme.color,marginBottom: 12}]}>
            Description<Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.textArea, 
              {backgroundColor: theme.cardbg2, color: theme.color},
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
      
        {/* Section état */}
        <View style={styles.formSection}>
          <Text style={[styles.label, {color: theme.color,marginBottom: 10}]}>État</Text>
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
        {(category === 'Louer' || category === 'Prêter') && (
          <View style={styles.formSection}>
            <Text style={[styles.label, {color: theme.color}]}>
              Durée disponible
              {category === 'Louer' && <Text style={styles.requiredStar}>*</Text>}
            </Text>
            <TextInput
              style={[
                styles.input, 
                {backgroundColor: theme.cardbg2, color: theme.color},
                category === 'Louer' && !duration && missingFields.includes('durée') ? styles.inputError : null
              ]}
              placeholder="Ex: 1 semaine, 2 mois, etc."
              placeholderTextColor="#A8A8A8"
              value={duration}
              onChangeText={setDuration}
            />
          </View>
        )}
        
        {(category === 'Louer' || category === 'Acheter') && (
          <View style={styles.formSection}>
            <Text style={[styles.label, {color: theme.color}]}>
              Prix<Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input, 
                {backgroundColor: theme.cardbg2, color: theme.color},
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
        
        {/* NOUVELLES SECTIONS */}
        
        {/* Section Informations de contact */}
        <View style={[styles.formSection, styles.sectionSeparator]}>
          <Text style={[styles.sectionTitle, {color: theme.color}]}>Informations de contact</Text>
          
          {/* Email (récupéré de l'utilisateur connecté) - NON MODIFIABLE */}
          <View style={styles.contactFieldRow}>
            <View style={styles.contactFieldLabel}>
              <Text style={[styles.label, {color: theme.color}]}>Email</Text>
              <Text style={[styles.fieldValue, {color: theme.color}]}>{email}</Text>
              <Text style={[styles.heading_text, {color: darkMode ? '#888888' : theme.secondaryText}]}>
                (Email associé à votre compte)
              </Text>
            </View>
            {/* <View style={styles.switchContainer}>
              <Text style={{color: theme.color, fontSize: 14, marginRight: 8}}>Afficher</Text>
              <Switch
                value={showEmail}
                onValueChange={setShowEmail}
                trackColor={{ false: "#767577", true: "#39335E" }}
              />
            </View> */}
          </View>
          
          {/* Nom (facultatif) */}
          <View style={styles.contactField}>
            <View style={styles.contactFieldRow}>
              <Text style={[styles.label, {color: theme.color}]}>Nom (facultatif)</Text>
              <Switch
                value={showName}
                onValueChange={setShowName}
                trackColor={{ false: "#767577", true: "#39335E" }}
              />
            </View>
            <TextInput
              style={[styles.input, {backgroundColor: theme.cardbg2, color: theme.color}]}
              placeholder="Votre nom ou prénom"
              placeholderTextColor="#A8A8A8"
              value={userName}
              onChangeText={setUserName}
            />
          </View>
          
          {/* Téléphone (facultatif) */}
          
          <View style={styles.contactField}>
        <View style={styles.contactFieldRow}>
          <Text style={[styles.label, {color: theme.color}]}>
            Téléphone {isPhoneRequired ? '' : '(facultatif)'}
            {isPhoneRequired && <Text style={styles.requiredStar}>*</Text>}
          </Text>
          <Switch
            value={showPhone}
            onValueChange={setShowPhone}
            trackColor={{ false: "#767577", true: "#39335E" }}
          />
        </View>
        
        {/* Remplacer le TextInput par CustomPhoneInput */}
        <CustomPhoneInput
            ref={phoneInput}
            defaultValue={phoneNumber}
            defaultCode="CH"
            onChangeText={handlePhoneChange}
            onChangeFormattedText={handleFormattedPhoneChange}
            containerStyle={[
              styles.phoneInputContainer, 
              {
                borderColor: theme.bordercolor,
                backgroundColor: theme.cardbg,
              },
             hasPhoneError && styles.phoneInputError,
           ]}
          textContainerStyle={[styles.phoneInputTextContainer, { backgroundColor: theme.cardbg }]}
          textInputStyle={[styles.phoneInputText, { color: theme.color }]}
          codeTextStyle={{ color: theme.color }}
          textInputProps={{
            placeholderTextColor: theme.color3 || "#A8A8A8",
          }}
          flagButtonStyle={{ backgroundColor: theme.background }}
          hasError={hasPhoneError}
          theme={theme}
        />
        
        {hasPhoneError && (
  <Text style={styles.phoneErrorMessage}>
    Le numéro de téléphone facultatif est obligatoire pour ce moyen de contact
  </Text>
)}
      </View>

          

          {/* <View style={styles.contactField}>
            <View style={styles.contactFieldRow}>
              <Text style={[styles.label, {color: theme.color}]}>
                Téléphone (facultatif)
                {preferredContact === 'phone' && <Text style={styles.requiredStar}>*</Text>}
              </Text>
              <Switch
                value={showPhone}
                onValueChange={setShowPhone}
                trackColor={{ false: "#767577", true: "#39335E" }}
              />
            </View>
            <TextInput
              style={[
                styles.input, 
                {backgroundColor: theme.cardbg2, color: theme.color},
                preferredContact === 'phone' && !phoneNumber && missingFields.includes('numéro de téléphone') ? styles.inputError : null
              ]}
              placeholder="Votre numéro de téléphone"
              placeholderTextColor="#A8A8A8"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View> */}
          {/* Moyen de communication préféré */}
          <View style={styles.formSection}>
            <Text style={[styles.label, {color: theme.color, marginBottom: 20}]}>Moyen de communication préféré</Text>
            <View style={styles.contactMethodsContainer}>
             {contactMethods.map(method => (
  <TouchableOpacity 
    key={method.id}
    style={[
      styles.contactMethodButton, 
      { backgroundColor: darkMode 
        ? (preferredContact === method.id ? '#5D5FEF' : '#363636') 
        : (preferredContact === method.id ? '#39335E' : '#F0F0F0') 
      }
    ]}
    onPress={() => handleContactMethodChange(method.id)}
  >
    <Ionicons 
      name={method.icon} 
      size={20} 
      color={preferredContact === method.id 
        ? '#FFFFFF' 
        : (darkMode ? '#FFFFFF' : '#39335E')
      } 
    />
    <Text 
      style={[
        styles.contactMethodText, 
        {color: preferredContact === method.id 
          ? '#FFFFFF' 
          : (darkMode ? '#FFFFFF' : '#39335E')
        }
      ]}
    >
      {method.name}
    </Text>
  </TouchableOpacity>
))}
            </View>
          </View>
        </View>
        
        {/* Section de visibilité de l'annonce */}
        <View style={[styles.formSection, styles.sectionSeparator]}>
          <Text style={[styles.sectionTitle, {color: theme.color}]}>Options de publication</Text>
          
          <View style={styles.visibilityContainer}>
            <Text style={[styles.label, {color: theme.color}]}>Annonce active</Text>
            <View style={styles.switchWithLabel}>
              <Text style={{color: theme.color, marginRight: 8}}>
                {isActive ? 'Oui' : 'Non'}
              </Text>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: "#767577", true: "#39335E" }}
              />
            </View>
          </View>
          
          <Text style={[styles.visibilityDescription, {color: darkMode ? '#888888' : theme.secondaryText}]}>
            Si désactivée, votre annonce ne sera pas visible par les autres utilisateurs mais restera dans votre compte.
          </Text>
        </View>
        
        {/* Bouton de soumission */}
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Text style={styles.submitButtonText}>Publier l'annonce</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
      <Toast />
    </KeyboardAvoidingView>
  );
};

export default PublierAnnonce;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 50 : 10,
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
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  headerRightPlaceholder: {
    width: 24,
  },
  heading: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: 'Montserrat_700Bold',
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  requiredFieldsNote: {
    marginBottom: 15,
    backgroundColor: 'rgba(235, 0, 27, 0.1)',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EB001B',
  },
  requiredFieldsText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
  },
  requiredStar: {
    color: '#EB001B',
    fontSize: 18,
  },
  formSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 10,
  },
  input: {
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#EB001B',
  },
  errorText: {
    color: '#EB001B',
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
    marginTop: 5,
  },
  scrollViewError: {
    borderWidth: 1,
    borderColor: '#EB001B',
    borderRadius: 10,
    padding: 5,
  },
  containerError: {
    borderWidth: 1,
    borderColor: '#EB001B',
    borderRadius: 10,
    padding: 5,
  },
  textArea: {
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
    minHeight: 120,
  },
  categoriesContainer: {
    flexDirection: 'row',
  },
  categoriesContentContainer: {
    paddingRight: 20,
  },
  categoryButton: {
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    minWidth: 110,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeCategoryButton: {
    backgroundColor: '#39335E',
  },
  categoryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14,
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  // Nouveaux styles pour la section Camp
  campButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  campButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%', // Pour avoir 2 par ligne avec un petit espace entre
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: 'center',
  },
  campIcon: {
    marginRight: 6,
  },
  campText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
  },
  typeButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  activeTypeButton: {
    backgroundColor: '#39335E',
  },
  typeText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
  },
  activeTypeText: {
    color: '#FFFFFF',
  },
  conditionButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  conditionButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  activeConditionButton: {
    backgroundColor: '#39335E',
  },
  conditionText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
  },
  activeConditionText: {
    color: '#FFFFFF',
  },
  imagePickerContainer: {
    marginBottom: 10,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  imageButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  imageButtonText: {
    fontFamily: 'Montserrat_500Medium',
    marginTop: 5,
  },
  selectedImagesContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  imagePreviewContainer: {
    marginRight: 10,
    position: 'relative',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  submitButton: {
    backgroundColor: '#EB001B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 16,
    marginLeft: 10,
  },
  
  // Styles pour l'authentification
  authContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  authTitle: {
    fontSize: 22,
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  authDescription: {
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
    marginBottom: 30,
    textAlign: 'center',
  },
  resendButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendButtonText: {
    fontFamily: 'Montserrat_600SemiBold',
    color: '#39335E',
    textDecorationLine: 'underline',
  },
  
  // Styles pour les sections de contact
  sectionSeparator: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 15,
  },
  contactField: {
    marginBottom: 15,
  },
  contactFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  contactFieldLabel: {
    flex: 1,
  },
  fieldValue: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
  },
  fieldNote: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactMethodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  contactMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  contactMethodText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 10,
    marginLeft: 6,
  },
  visibilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  switchWithLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visibilityDescription: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
    fontStyle: 'italic',
  },
  phoneInputContainer: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
  },
  phoneInputTextContainer: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    paddingVertical: 0,
  },
  phoneInputText: {
    fontSize: 16,
    paddingVertical: 0,
    height: 40,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF0000',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    color: '#FF0000',
  },
  requiredStar: {
    color: '#FF0000',
    marginLeft: 2,
  },
  contactField: {
    marginBottom: 16,
  },
  contactFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  phoneInputError: {
    borderWidth: 2,
    borderColor: '#EB001B',
    backgroundColor: 'rgba(235, 0, 27, 0.05)',
  },
  phoneErrorMessage: {
    color: '#EB001B',
    fontFamily: 'Montserrat_500Medium',
    fontSize: 12,
    marginTop: 5,
    marginBottom: 10,
  },
});