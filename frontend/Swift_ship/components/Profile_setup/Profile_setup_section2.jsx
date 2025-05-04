import React, { useContext, useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import { Ionicons } from '@expo/vector-icons';
import ThemeContext from '../../theme/ThemeContext';
import Button from '../../components/Button/Button';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

// Get screen dimensions for better spacing
const { width, height } = Dimensions.get('window');

// Custom wrapper for PhoneInput to handle props and avoid defaultProps warning
const CustomPhoneInput = ({ defaultValue, defaultCode, onChangeText, onChangeFormattedText, containerStyle, textContainerStyle, textInputStyle, codeTextStyle, textInputProps, flagButtonStyle, hasError }) => {
  return (
    <PhoneInput
      defaultValue={defaultValue}
      defaultCode={defaultCode}
      layout="first"
      onChangeText={onChangeText}
      onChangeFormattedText={onChangeFormattedText}
      containerStyle={[
        containerStyle, 
        hasError && styles.inputError
      ]}
      textContainerStyle={[
        textContainerStyle, 
        hasError && { backgroundColor: '#4A3048' }
      ]}
      textInputStyle={textInputStyle}
      codeTextStyle={codeTextStyle}
      textInputProps={{
        ...textInputProps,
        placeholder: textInputProps.placeholder || 'Votre numéro de téléphone',
      }}
      flagButtonStyle={[
        flagButtonStyle,
        hasError && { backgroundColor: '#4A3048' }
      ]}
      withDarkTheme={false}
      withShadow={false}
      autoFocus={false}
    />
  );
};

const RoleSelector = ({ selectedRole, onRoleSelect, theme, hasError }) => {
  const roles = [
    { 
      id: 'parent', 
      label: 'Parent', 
      icon: 'people-outline',
      description: 'Gérer le compte de votre enfant'
    },
    { 
      id: 'admin', 
      label: 'Administrateur', 
      icon: 'settings-outline',
      description: 'Administrer la plateforme'
    },
    { 
      id: 'exploitant', 
      label: 'Exploitant', 
      icon: 'business-outline',
      description: 'Gérer les services'
    }
  ];

  return (
    <View style={styles.roleSelectionContainer}>
      {hasError && (
        <Text style={styles.errorText}>Veuillez sélectionner un profil</Text>
      )}
      {roles.map((role) => (
        <TouchableOpacity
          key={role.id}
          style={[
            styles.roleCard,
            { 
              backgroundColor: '#FFFFFF',
              borderColor: selectedRole === role.id ? '#836EFE' : (hasError ? '#FF5A5A' : '#EEEEEE'),
              borderWidth: selectedRole === role.id ? 2 : (hasError ? 2 : 1),
              shadowColor: '#000',
            }
          ]}
          onPress={() => onRoleSelect(role.id)}
        >
          <View style={styles.roleCardContent}>
            <View style={[
              styles.iconContainer, 
              { backgroundColor: selectedRole === role.id ? '#836EFE' : '#E0E0E0' }
            ]}>
              <Ionicons 
                name={role.icon} 
                size={24} 
                color={selectedRole === role.id ? '#FFFFFF' : '#555555'} 
              />
            </View>
            <Text style={[
              styles.roleTitle, 
              { color: selectedRole === role.id ? '#836EFE' : '#333333' }
            ]}>
              {role.label}
            </Text>
            <Text style={[
              styles.roleDescription, 
              { color: '#666666' }
            ]}>
              {role.description}
            </Text>
          </View>
          {selectedRole === role.id && (
            <View style={styles.checkmarkContainer}>
              <Ionicons name="checkmark-circle" size={24} color="#836EFE" />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const Profile_setup_section2 = () => {
  const { theme, updateProfileData } = useContext(ThemeContext);
  const phoneInput = useRef(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    nickName: '',
    email: '', // This will be pre-filled from signup
    phone: '',
    countryCode: '',
    role: '',
    camp: '507f1f77bcf86cd799439011',
  });

  // État pour suivre les champs qui ont été touchés
  const [touchedFields, setTouchedFields] = useState({
    first_name: false,
    last_name: false,
    phone: false,
    role: false
  });

  // État pour les erreurs
  const [errors, setErrors] = useState({
    first_name: false,
    last_name: false,
    phone: false,
    role: false
  });

  // Vérifier la validité du formulaire à chaque changement dans formData
  useEffect(() => {
    // Ne vérifie que les champs qui ont été touchés
    const newErrors = {
      first_name: touchedFields.first_name && !formData.first_name,
      last_name: touchedFields.last_name && !formData.last_name,
      phone: touchedFields.phone && (!formData.phone || formData.phone.trim() === ''),
      role: touchedFields.role && !formData.role
    };
    
    setErrors(newErrors);
  }, [formData, touchedFields]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    
    // Marquer le champ comme touché
    if (!touchedFields[field]) {
      setTouchedFields({ ...touchedFields, [field]: true });
    }
  };

  const handleRoleSelect = (role) => {
    handleInputChange('role', role);
    setTouchedFields({ ...touchedFields, role: true });
  };

  const handleInputBlur = (field) => {
    setTouchedFields({ ...touchedFields, [field]: true });
  };

  const showToast = (message, type = 'error') => {
    Toast.show({
      type: type,
      text1: 'Attention',
      text2: message,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 70,
      props: {
        backgroundColor: '#FF5A5A',
        textColor: '#FFFFFF',
      }
    });
  };

  const validateForm = () => {
    // Marquer tous les champs comme touchés pour afficher toutes les erreurs
    setTouchedFields({
      first_name: true,
      last_name: true,
      phone: true,
      role: true
    });

    // Vérifier tous les champs obligatoires
    const newErrors = {
      first_name: !formData.first_name,
      last_name: !formData.last_name,
      phone: !formData.phone || formData.phone.trim() === '',
      role: !formData.role
    };
    
    setErrors(newErrors);

    // Construire le message d'erreur
    let errorMsg = "";
    if (newErrors.first_name || newErrors.last_name) {
      errorMsg = 'Veuillez saisir votre prénom et nom.';
    } else if (newErrors.phone) {
      errorMsg = 'Veuillez saisir un numéro de téléphone.';
    } else if (newErrors.role) {
      errorMsg = 'Veuillez sélectionner un type d\'utilisateur.';
    }

    if (errorMsg) {
      showToast(errorMsg);
      return false;
    }
    
    return true;
  };

  const handleContinue = () => {
    if (validateForm()) {
      // Combiner first_name et last_name pour créer 
      const fullName = `${formData.first_name} ${formData.last_name}`;
      
      // Mettre à jour les données du profil avec le bon format pour ThemeContext
      updateProfileData({
        fullName: fullName,
        email: formData.email, // Conserver l'email s'il est disponible
        phoneNumber: formData.phone,
        // Stocker également les champs individuels si vous en avez besoin ultérieurement
        first_name: formData.first_name,
        last_name: formData.last_name,
        nickName: formData.nickName,
        countryCode: formData.countryCode,
        role: formData.role,
      });
      
      router.push('/login');
    }
  };

  // Composant pour les étiquettes avec astérisque pour les champs obligatoires
  const RequiredLabel = ({ text }) => (
    <View style={styles.labelContainer}>
      <Text style={[styles.label, { color: '#FFFFFF' }]}>{text}</Text>
      <Text style={styles.asterisk}>*</Text>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#282449' }}>
      <View style={[styles.container, { backgroundColor: '#282449' }]}>
        <View style={styles.input_container}>
          <View style={styles.form_section}>
            <RequiredLabel text="Nom" />
            {errors.last_name && (
              <Text style={styles.errorText}>Ce champ est obligatoire</Text>
            )}
            <TextInput
              style={[
                styles.input, 
                { 
                  color: '#FFFFFF', 
                  borderColor: '#393463', 
                  backgroundColor: errors.last_name ? '#4A3048' : '#393463'
                }
              ]}
              placeholder="Votre nom"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={formData.last_name}
              onChangeText={(text) => handleInputChange('last_name', text)}
              onBlur={() => handleInputBlur('last_name')}
            />
          </View>

          <View style={styles.form_section}>
            <RequiredLabel text="Prénom" />
            {errors.first_name && (
              <Text style={styles.errorText}>Ce champ est obligatoire</Text>
            )}
            <TextInput
              style={[
                styles.input, 
                { 
                  color: '#FFFFFF', 
                  borderColor: '#393463',
                  backgroundColor: errors.first_name ? '#4A3048' : '#393463'
                }
              ]}
              placeholder="Votre prénom"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={formData.first_name}
              onChangeText={(text) => handleInputChange('first_name', text)}
              onBlur={() => handleInputBlur('first_name')}
            />
          </View>

          <View style={styles.form_section}>
            <Text style={[styles.label, { color: '#FFFFFF' }]}>Surnom (optionnel)</Text>
            <TextInput
              style={[styles.input, { 
                color: '#FFFFFF', 
                borderColor: '#393463',
                backgroundColor: '#393463'  
              }]}
              placeholder="Votre surnom"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={formData.nickName}
              onChangeText={(text) => handleInputChange('nickName', text)}
            />
          </View>

          <View style={styles.form_section}>
            <RequiredLabel text="Téléphone" />
            {errors.phone && (
              <Text style={styles.errorText}>Ce champ est obligatoire</Text>
            )}
            <CustomPhoneInput
              ref={phoneInput}
              defaultValue={formData.phone}
              defaultCode="CH"
              onChangeText={(text) => handleInputChange('phone', text)}
              onChangeFormattedText={(text) => {
                const countryCode = phoneInput.current?.getCountryCode();
                if (countryCode) {
                  handleInputChange('countryCode', `+${countryCode}`);
                }
              }}
              containerStyle={[styles.phoneInputContainer, {
                borderColor: '#393463',
                backgroundColor: '#393463',
              }]}
              textContainerStyle={[styles.phoneInputTextContainer, { backgroundColor: '#393463' }]}
              textInputStyle={[styles.phoneInputText, { color: '#FFFFFF' }]}
              codeTextStyle={{ color: '#FFFFFF' }}
              textInputProps={{
                placeholderTextColor: "rgba(255, 255, 255, 0.6)",
                onBlur: () => handleInputBlur('phone'),
              }}
              flagButtonStyle={{ backgroundColor: '#393463' }}
              hasError={errors.phone}
            />
          </View>

          <View style={styles.form_section}>
            <RequiredLabel text="Choisissez votre profil" />
            <RoleSelector 
              selectedRole={formData.role} 
              onRoleSelect={handleRoleSelect} 
              theme={theme}
              hasError={errors.role}
            />
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button buttonText="Continuer" onPress={handleContinue} />
        </View>
      </View>
    </ScrollView>
  );
};

export default Profile_setup_section2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    minHeight: height * 0.85, // Make it take more screen space
    paddingBottom: 100,
  },
  input_container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  form_section: {
    marginBottom: 30, // Increased spacing between sections
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 16, 
    fontFamily: 'Montserrat_700Bold',
  },
  asterisk: {
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
    color: '#FF5A5A',
    marginLeft: 5,
  },
  errorText: {
    color: '#FF5A5A',
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18, 
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 25, 
  },
  input: {
    height: 60, // Increased height
    borderWidth: 0, // No border
    borderRadius: 12, // Rounded corners
    paddingHorizontal: 20,
    fontFamily: 'Montserrat_500Medium',
    fontSize: 16,
  },
  inputError: {
    borderWidth: 2,
    borderColor: '#FF5A5A',
    backgroundColor: '#4A3048', // Rouge foncé pour le mode sombre
  },
  phoneInputContainer: {
    width: '100%',
    height: 60, // Increased height
    borderWidth: 0, // No border
    borderRadius: 12, // Rounded corners
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneInputTextContainer: {
    paddingVertical: 0,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  phoneInputText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 16,
    height: 60,
  },
  roleSelectionContainer: {
    width: '100%',
    marginBottom: 20,
  },
  roleCard: {
    borderRadius: 14,
    marginBottom: 15,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  roleCardContent: {
    flex: 1,
    flexDirection: 'column',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    opacity: 0.8,
  },
  checkmarkContainer: {
    padding: 6,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 20,
  }
});
