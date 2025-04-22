// components/Signup/EmailSignupForm/EmailSignupForm.jsx
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import React, { useState, useContext } from 'react';
import Input from '../../Input/Input';
import Button from '../../Button/Button';
import ThemeContext from '../../../theme/ThemeContext';
import { router } from 'expo-router';
import Mail from "../../../assets/images/mail.svg";
import Dark_mail from "../../../assets/images/dark_mail.svg";
import { addUser } from '../../../services/api'; // Adjust this import based on your API service

const EmailSignupForm = () => {
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [loading, setLoading] = useState(false);
  const { theme, darkMode } = useContext(ThemeContext);

  // Email validation function
  const validateEmail = (text) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  // Handle email input change
  const handleEmailChange = (text) => {
    setEmail(text);
    // Only validate if there's text
    if (text.length > 0) {
      setIsEmailValid(validateEmail(text));
    } else {
      setIsEmailValid(true); // Don't show error when field is empty
    }
  };

  // Handle signup submission
  const handleSignup = async () => {
    if (!email) {
      alert('Veuillez entrer votre adresse email');
      return;
    }

    if (!validateEmail(email)) {
      setIsEmailValid(false);
      alert('Veuillez entrer une adresse email valide');
      return;
    }

    setLoading(true);

    try {
      // Call your API to register the user with email only
      const userData = await addUser(email);

      if (userData) {
        console.log('User registered:', userData);
        // You might want to show a success message here
        alert('Un lien de vérification a été envoyé à votre adresse email');
        router.push('email-verification'); // Create this screen or redirect to another one
      }
    } catch (err) {
      console.error('Signup error:', err);

      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        alert(`Erreur du serveur: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        // The request was made but no response was received
        alert('Pas de réponse du serveur. Vérifiez votre connexion internet.');
      } else {
        // Something happened in setting up the request that triggered an Error
        alert(`Erreur: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Input
          label="Email"
          placeholder="Entrez votre email"
          keyboardType="email-address"
          value={email}
          onChangeText={handleEmailChange}
          iconLeft={darkMode ? Dark_mail : Mail}
          error={!isEmailValid ? "Veuillez entrer une adresse email valide" : ""}
        />
      </View>

      <View style={styles.checkboxContainer}>
        <Text style={[styles.termsText, { color: theme.color3 }]}>
          En créant un compte, vous acceptez nos{' '}
          <Text style={styles.linkText}>Conditions d'utilisation</Text> et notre{' '}
          <Text style={styles.linkText}>Politique de confidentialité</Text>
        </Text>
      </View>

      <Button
        buttonText={loading ? "Création du compte..." : "Créer un compte"}
        onPress={handleSignup}
        disabled={loading}
      />

      {loading && (
        <ActivityIndicator 
          style={styles.loader} 
          size="small" 
          color="#836EFE" 
        />
      )}
    </View>
  );
};

export default EmailSignupForm;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  checkboxContainer: {
    marginBottom: 25,
  },
  termsText: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Montserrat_400Regular',
    color: '#727272',
    textAlign: 'center',
  },
  linkText: {
    fontFamily: 'Montserrat_700Bold',
    color: '#836EFE',
  },
  loader: {
    marginTop: 10
  }
});
