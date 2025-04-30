import React, { useState, useContext, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Image } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import ThemeContext from '../../../theme/ThemeContext';
import { router } from 'expo-router';
import { registerUser } from '../../../services/api';
import Toast from 'react-native-toast-message';
import Signup_section3 from '../Signup_section3/Signup_section3';
import { Ionicons } from '@expo/vector-icons'; // Assurez-vous d'avoir installé expo/vector-icons

// Custom wrapper for PhoneInput to handle props and avoid defaultProps warning
const CustomPhoneInput = ({ defaultValue, defaultCode, onChangeText, onChangeFormattedText, containerStyle, textContainerStyle, textInputStyle, codeTextStyle, textInputProps, flagButtonStyle }) => {
  return (
    <PhoneInput
      defaultValue={defaultValue}
      defaultCode={defaultCode}
      layout="first"
      onChangeText={onChangeText}
      onChangeFormattedText={onChangeFormattedText}
      containerStyle={containerStyle}
      textContainerStyle={textContainerStyle}
      textInputStyle={textInputStyle}
      codeTextStyle={codeTextStyle}
      textInputProps={{
        ...textInputProps,
        placeholder: textInputProps.placeholder || 'Votre numéro de téléphone', // Explicitly set placeholder
      }}
      flagButtonStyle={flagButtonStyle}
      withDarkTheme={false} // Explicitly set to avoid defaultProps
      withShadow={false} // Explicitly set to avoid defaultProps
      autoFocus={false} // Explicitly set to avoid defaultProps
    />
  );
};

const RoleSelector = ({ selectedRole, onRoleSelect, theme }) => {
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
      {roles.map((role) => (
        <TouchableOpacity
          key={role.id}
          style={[
            styles.roleCard,
            { 
              backgroundColor: theme.dark ? '#2A2A2A' : '#F8F8F8',
              borderColor: selectedRole === role.id ? '#836EFE' : theme.border,
              borderWidth: selectedRole === role.id ? 2 : 1,
              shadowColor: theme.dark ? '#000' : '#888',
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
              { color: selectedRole === role.id ? '#836EFE' : theme.color }
            ]}>
              {role.label}
            </Text>
            <Text style={[
              styles.roleDescription, 
              { color: theme.color3 }
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

const Signup_section2 = () => {
  const { theme } = useContext(ThemeContext);
  const phoneInput = useRef(null);

  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    countryCode: '',
    camp: '507f1f77bcf86cd799439011',
    role: '',
    userId: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible5, setModalVisible5] = useState(false);

  const showToast = (type, text1, text2) => {
    Toast.show({
      type,
      text1,
      text2,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
    });
  };

  const handleChange = (field, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleRoleSelect = (role) => {
    handleChange('role', role);
  };

  const closeModal5 = () => {
    setModalVisible5(false);
  };

  const handleSignup = async () => {
    try {
      if (!formData.email) {
        showToast('error', 'Erreur!', 'Veuillez saisir votre email');
        return;
      }

      if (!formData.email.includes('@') || !formData.email.includes('.')) {
        showToast('error', 'Erreur!', 'Veuillez saisir un email valide');
        return;
      }

      if (!formData.first_name || !formData.last_name) {
        showToast('error', 'Erreur!', 'Veuillez saisir votre prénom et nom');
        return;
      }

      if (!formData.phone || formData.phone.trim() === '') {
        showToast('error', 'Erreur!', 'Veuillez saisir un numéro de téléphone');
        return;
      }

      if (!formData.role) {
        showToast('error', 'Erreur!', 'Veuillez sélectionner un type d\'utilisateur');
        return;
      }

      setIsLoading(true);

      const userData = {
        email: formData.email.toLowerCase().trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim(),
        countryCode: formData.countryCode,
        camp: formData.camp,
        role: formData.role,
      };

      const response = await registerUser(userData);

      setFormData((prev) => ({
        ...prev,
        userId: response.user?.id,
      }));

      showToast('success', 'Inscription réussie', response.message || 'Un code de vérification a été envoyé à votre email.');

      setTimeout(() => {
        setModalVisible5(true);
      }, 1000);
    } catch (error) {
      showToast('error', 'Erreur!', error.response?.data?.message || 'Une erreur inattendue est survenue lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.form_section}>
          <Text style={[styles.label, { color: theme.color }]}>E-mail</Text>
          <TextInput
            style={[styles.input, { color: theme.color, borderColor: theme.border }]}
            placeholder="Votre email"
            placeholderTextColor={theme.color3}
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.form_section}>
          <Text style={[styles.label, { color: theme.color }]}>Prénom</Text>
          <TextInput
            style={[styles.input, { color: theme.color, borderColor: theme.border }]}
            placeholder="Votre prénom"
            placeholderTextColor={theme.color3}
            value={formData.first_name}
            onChangeText={(text) => handleChange('first_name', text)}
          />
        </View>

        <View style={styles.form_section}>
          <Text style={[styles.label, { color: theme.color }]}>Nom</Text>
          <TextInput
            style={[styles.input, { color: theme.color, borderColor: theme.border, backgroundColor: theme.dark ? '#333333' : 'transparent' }]}
            placeholder="Votre nom"
            placeholderTextColor={theme.color3}
            value={formData.last_name}
            onChangeText={(text) => handleChange('last_name', text)}
          />
        </View>

        <View style={styles.form_section}>
          <Text style={[styles.label, { color: theme.color }]}>Téléphone</Text>
          <CustomPhoneInput
            ref={phoneInput}
            defaultValue={formData.phone}
            defaultCode="CH"
            onChangeText={(text) => handleChange('phone', text)}
            onChangeFormattedText={(text) => {
              const countryCode = phoneInput.current?.getCountryCode();
              if (countryCode) {
                handleChange('countryCode', `+${countryCode}`);
              }
            }}
            containerStyle={[styles.phoneInputContainer, {
              borderColor: theme.border || '#CCCCCC',
              backgroundColor: theme.dark ? '#333333' : 'transparent',
            }]}
            textContainerStyle={[styles.phoneInputTextContainer, { backgroundColor: theme.dark ? '#333333' : 'transparent' }]}
            textInputStyle={[styles.phoneInputText, { color: theme.color }]}
            codeTextStyle={{ color: theme.color }}
            textInputProps={{
              placeholderTextColor: theme.color3,
            }}
            flagButtonStyle={{ backgroundColor: theme.dark ? '#333333' : 'transparent' }}
          />
        </View>

        <View style={styles.form_section}>
          <Text style={[styles.sectionTitle, { color: theme.color }]}>Choisissez votre profil</Text>
          <RoleSelector 
            selectedRole={formData.role} 
            onRoleSelect={handleRoleSelect} 
            theme={theme}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={isLoading} activeOpacity={0.7}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>S'inscrire</Text>
          )}
        </TouchableOpacity>

        <Signup_section3
          modalVisible5={modalVisible5}
          closeModal5={closeModal5}
          email={formData.email}
          userId={formData.userId}
        />
      </View>
    </ScrollView>
  );
};

export default Signup_section2;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 30,
    paddingBottom: 30,
  },
  form_section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#836EFE',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat_700Bold',
    fontSize: 16,
  },
  phoneInputContainer: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneInputTextContainer: {
    paddingVertical: 0,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  phoneInputText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
    height: 50,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 15,
  },
  roleSelectionContainer: {
    width: '100%',
    marginBottom: 10,
  },
  roleCard: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roleCardContent: {
    flex: 1,
    flexDirection: 'column',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  roleTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 6,
  },
  roleDescription: {
    fontSize: 13,
    fontFamily: 'Montserrat_400Regular',
    opacity: 0.8,
  },
  checkmarkContainer: {
    padding: 5,
  },
});
