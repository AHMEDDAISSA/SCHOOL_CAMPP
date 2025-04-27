import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Switch, Image, KeyboardAvoidingView, Platform, ActivityIndicator, Pressable } from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import { router } from "expo-router";
import ThemeContext from '../../theme/ThemeContext';
import AnnonceContext from '../../contexts/AnnonceContext';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { createAd, uploadMultipleImages } from '../../services/api';
import Toast from 'react-native-toast-message';

const PublierAnnonce = () => {
  const { theme, darkMode } = useContext(ThemeContext);
  const { addAnnonce } = useContext(AnnonceContext);
  
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
  
  
  // Fonction pour sélectionner une image depuis la galerie
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
    setImages([]);
  };
  
  // Validation du formulaire
  const validateForm = () => {
    const missing = [];
    
    if (!title) missing.push('titre');
    if (!description) missing.push('description');
    if (!category) missing.push('catégorie');
    if (!type) missing.push('type d\'objet');
    if (images.length === 0) missing.push('photos');
    
    // Vérifier le prix si la catégorie est "Louer" ou "Acheter"
    if ((category === 'Louer' || category === 'Acheter') && !price) {
      missing.push('prix');
    }
    
    // Vérifier la durée si la catégorie est "Louer"
    if (category === 'Louer' && !duration) {
      missing.push('durée');
    }
    
    setMissingFields(missing);
    return missing.length === 0;
  };
  
  // Soumission du formulaire
  const handleSubmit = () => {
    // Validation de base
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
      // Créer l'objet annonce
      const nouvelleAnnonce = {
        title,
        description,
        category,
        type,
        condition,
        price,
        duration,
        images: images
      };
      
      // Ajouter l'annonce via le contexte
      const annonceAjoutee = addAnnonce(nouvelleAnnonce);
      
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
  }
  
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
          <Text style={[styles.label, {color: theme.color}]}>
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
          <Text style={[styles.label, {color: theme.color}]}>
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
        
        {/* Bouton de soumission */}
        <TouchableOpacity 
          style={[styles.submitButton]}
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
});
