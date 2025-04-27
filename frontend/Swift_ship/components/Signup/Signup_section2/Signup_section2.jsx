import React, { useState, useContext, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import ThemeContext from '../../../theme/ThemeContext';
import { router } from 'expo-router';
import { registerUser, verifyEmail, resendVerificationCode } from '../../../services/api';
import Toast from 'react-native-toast-message';

const Signup_section2 = () => {
  const { theme } = useContext(ThemeContext);
  const phoneInput = useRef(null);

  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    countryCode: '+216',
    camp: '507f1f77bcf86cd799439011',
    role: 'parent'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const handleChange = (field, value) => {
    setFormData(prevState => ({
      ...prevState,
      [field]: value
    }));
    // Remove excessive logging
  };

  const handleSignup = async () => {
    try {
      console.log("Signup button pressed");
      console.log("Current form data:", formData); // Log entire form data at once
      
      // Validate required fields
      if (!formData.email) {
        Toast.show({
          type: 'error',
          text1: 'Erreur!',
          text2: 'Veuillez saisir votre email',
        });
        return;
      }

      if (!formData.email.includes('@') || !formData.email.includes('.')) {
        Toast.show({
          type: 'error',
          text1: 'Erreur!',
          text2: 'Veuillez saisir un email valide',
        });
        return;
      }

      if (!formData.first_name || !formData.last_name) {
        Toast.show({
          type: 'error',
          text1: 'Erreur!',
          text2: 'Veuillez saisir votre prénom et nom',
        });
        return;
      }

      // FIXED: Use formData.phone directly since it's being updated correctly
      if (!formData.phone || formData.phone.trim() === '') {
        Toast.show({
          type: 'error',
          text1: 'Erreur!',
          text2: 'Veuillez saisir un numéro de téléphone',
        });
        return;
      }

      setIsLoading(true);
      
      // Prepare the user data - IMPORTANT: send data correctly without nesting
      const userData = {
        email: formData.email.toLowerCase().trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim(),
        countryCode: formData.countryCode,
        camp: formData.camp,
        role: formData.role
      };

      console.log('Sending registration data:', userData);
      
      // Call registration API directly
      const response = await registerUser(userData);
      console.log('Registration successful:', response);

      Toast.show({
        type: 'success',
        text1: 'Inscription réussie',
        text2: response.message || 'Un code de vérification a été envoyé à votre email.',
      });

      // Set verification step after short delay
      setTimeout(() => {
        setVerificationStep(true);
      }, 1000);
      
    } catch (error) {
      console.error('Registration error:', error);
      
      // Show error toast
      Toast.show({
        type: 'error',
        text1: 'Erreur!',
        text2: error.response?.data?.message || 'Une erreur est survenue lors de l\'inscription',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Code invalide',
        text2: 'Veuillez entrer le code à 6 chiffres complet',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await verifyEmail(formData.email.toLowerCase(), formData.camp, verificationCode);
      console.log('Verification response:', response);

      Toast.show({
        type: 'success',
        text1: 'Vérification réussie',
        text2: 'Votre email a été vérifié avec succès.',
      });

      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error('Verification error:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur!',
        text2: error.response?.data?.message || 'Code de vérification invalide',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      const response = await resendVerificationCode(formData.email.toLowerCase(), formData.camp);
      console.log('Resend code response:', response);

      Toast.show({
        type: 'success',
        text1: 'Code envoyé',
        text2: 'Un nouveau code de vérification a été envoyé à votre email',
      });
    } catch (error) {
      console.error('Resend code error:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur!',
        text2: error.response?.data?.message || 'Une erreur est survenue lors de l\'envoi du code',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (verificationStep) {
    return (
      <View style={styles.container}>
        <Text style={[styles.heading, { color: theme.color }]}>Vérification de l'email</Text>
        <Text style={[styles.subheading, { color: theme.color3 }]}>
          Nous avons envoyé un code de vérification à {formData.email}
        </Text>

        <View style={styles.form_section}>
          <Text style={[styles.label, { color: theme.color }]}>Code de vérification</Text>
          <TextInput
            style={[styles.input, { color: theme.color, borderColor: theme.border }]}
            placeholder="Entrez le code à 6 chiffres"
            placeholderTextColor={theme.color3}
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleVerifyCode} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Vérifier</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={[styles.resendText, { color: theme.color3 }]}>
            Vous n'avez pas reçu le code ?
          </Text>
          <TouchableOpacity onPress={handleResendCode} disabled={isLoading}>
            <Text style={styles.resendButton}>Renvoyer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
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
          style={[styles.input, { color: theme.color, borderColor: theme.border }]}
          placeholder="Votre nom"
          placeholderTextColor={theme.color3}
          value={formData.last_name}
          onChangeText={(text) => handleChange('last_name', text)}
        />
      </View>

      <View style={styles.form_section}>
        <Text style={[styles.label, { color: theme.color }]}>Téléphone</Text>
        <PhoneInput
          ref={phoneInput}
          defaultValue={formData.phone}
          defaultCode="TN" 
          layout="first"
          onChangeText={(text) => {
            handleChange('phone', text);
          }}
          onChangeFormattedText={(text) => {
            // Only set the countryCode, not duplicating logging
            const countryCode = phoneInput.current?.getCountryCode();
            if (countryCode) {
              handleChange('countryCode', `+${countryCode}`);
            }
          }}
          withDarkTheme={theme.dark}
          withShadow
          containerStyle={[styles.phoneInputContainer, { borderColor: theme.border }]}
          textContainerStyle={[styles.phoneInputTextContainer, { backgroundColor: 'transparent' }]}
          textInputStyle={[styles.phoneInputText, { color: theme.color }]}
          codeTextStyle={{ color: theme.color }}
          countryPickerButtonStyle={{ borderRightWidth: 1, borderRightColor: theme.border }}
          placeholder="Numéro sans indicatif"
          textInputProps={{
            placeholderTextColor: theme.color3,
            selectionColor: '#836EFE',
          }}
        />
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSignup} 
        disabled={isLoading}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>S'inscrire</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default Signup_section2;

// Styles remain the same...


const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 30,
  },
  heading: {
    fontSize: 24,
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    marginBottom: 30,
    textAlign: 'center',
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
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat_700Bold',
    fontSize: 16,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  resendText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
    marginRight: 5,
  },
  resendButton: {
    color: '#836EFE',
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14,
  },
  phoneInputContainer: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  phoneInputTextContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  phoneInputText: {
    height: 46,
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
  }
});