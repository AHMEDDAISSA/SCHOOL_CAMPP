import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import ThemeContext from '../../../theme/ThemeContext';
import { router } from 'expo-router';
import { registerUser } from '../../../services/api';
import Toast from 'react-native-toast-message';
import Signup_section3 from '../Signup_section3/Signup_section3';

const Signup_section2 = () => {
  const { theme } = useContext(ThemeContext);

  const [formData, setFormData] = useState({
    email: '',
    // Keep these fields in state but don't show in UI
    camp: '507f1f77bcf86cd799439011', // Default camp value from original code
    role: 'parent', // Default to 'parent' role
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

      setIsLoading(true);

      // Include all required fields for API
      const userData = {
        email: formData.email.toLowerCase().trim(),
        camp: formData.camp,      // Required by API
        role: formData.role,      // Required by API
      };

      console.log('Registering user with data:', userData);
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
      console.error('registerUser error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
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
});
