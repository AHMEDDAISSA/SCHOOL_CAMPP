import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import Back from "../../../assets/images/back.svg";
import Dark_back from "../../../assets/images/dark_back.svg";
import ThemeContext from '../../../theme/ThemeContext';
import Button from '../../Button/Button';
import { Montserrat_400Regular, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import Otp from '../../OTP/Otp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { verifyOTP, resendOTP } from '../../../services/api';
import Toast from 'react-native-toast-message';

// Import Signup_section4 lazily to break the circular dependency
const LazySignup_section4 = React.lazy(() => import('../Signup_section4/Signup_section4'));

const Signup_section3 = ({ email, userId, closeModal5, modalVisible5 }) => {
  const { theme, darkMode } = useContext(ThemeContext);
  const [modalVisible6, setModalVisible6] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isVerified, setIsVerified] = useState(false); // New state to track verification

  // Countdown timer for OTP expiration
  useEffect(() => {
    let timer;
    if (modalVisible5 && countdown > 0 && !isVerified) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, modalVisible5, isVerified]);

  // Reset states when modal opens
  useEffect(() => {
    if (modalVisible5) {
      setCountdown(300); // 5 minutes
      setCanResend(false);
      setOtpCode(''); // Clear OTP
      setAttempts(0); // Reset attempts
      setIsVerified(false); // Reset verification status
    }
  }, [modalVisible5]);

  const openModal6 = () => {
    setTimeout(() => setModalVisible6(true), 500); // Slight delay to ensure modal5 closes
  };  
  
  const closeModal6 = () => {
    setModalVisible6(false);
  };

  // Handle OTP input changes
  const handleOtpChange = (code) => {
    setOtpCode(code);
  };
  
  // Format countdown time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Verify OTP with backend
  const handleContinue = async () => {
    if (!otpCode || otpCode.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Code invalide',
        text2: 'Veuillez entrer le code à 6 chiffres complet',
        visibilityTime: 4000,
        topOffset: 50
      });
      return;
    }

    if (isVerified) {
      // If already verified, skip submission and proceed to next modal
      closeModal5();
      openModal6();
      return;
    }
    
    setLoading(true);
    try {
      const response = await verifyOTP(userId, otpCode);
      
      if (response.status === 'success') {
        // Store the JWT token if provided
        if (response.token) {
          try {
            await AsyncStorage.setItem('authToken', response.token);
            console.log('Token stored successfully');
          } catch (storageError) {
            console.error('Error storing token:', storageError);
          }
        }
        
        setIsVerified(true); // Mark as verified
        Toast.show({
          type: 'success',
          text1: 'Vérification réussie',
          text2: 'Votre code a été vérifié avec succès',
          visibilityTime: 4000,
          topOffset: 50
        });
        
        // Close verification modal and open next step
        closeModal5();
        openModal6();
      } else {
        setAttempts(attempts + 1);
        Toast.show({
          type: 'error',
          text1: 'Échec de vérification',
          text2: response.message || 'Code de vérification invalide',
          visibilityTime: 4000,
          topOffset: 50
        });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setAttempts(attempts + 1);
      
      // Handle "Email already verified" error
      if (error.response?.status === 400 && error.response?.data?.message === 'Email already verified.') {
        setIsVerified(true);
        Toast.show({
          type: 'info',
          text1: 'Déjà vérifié',
          text2: 'Votre email est déjà vérifié. Passez à l\'étape suivante.',
          visibilityTime: 4000,
          topOffset: 50
        });
        closeModal5();
        openModal6();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erreur!',
          text2: error.response?.data?.message || 'Erreur réseau. Veuillez réessayer.',
          visibilityTime: 4000,
          topOffset: 50
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Request new OTP from backend
  const handleResendCode = async () => {
    if (!canResend || isVerified) return;
    
    setLoading(true);
    try {
      const response = await resendOTP(userId); // Only pass userId
      
      if (response.status === 'success') {
        setCountdown(300); // Reset to 5 minutes
        setCanResend(false);
        setOtpCode(''); // Clear previous code
        setAttempts(0); // Reset attempts
        Toast.show({
          type: 'success',
          text1: 'Code envoyé',
          text2: 'Nouveau code de vérification envoyé avec succès',
          visibilityTime: 4000,
          topOffset: 50
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erreur!',
          text2: response.message || 'Échec de l\'envoi du code de vérification',
          visibilityTime: 4000,
          topOffset: 50
        });
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur!',
        text2: error.response?.data?.message || 'Erreur réseau. Veuillez réessayer.',
        visibilityTime: 4000,
        topOffset: 50
      });
    } finally {
      setLoading(false);
    }
  };

  // If resendOTP requires email, use this version instead:
  // const handleResendCode = async () => {
  //   if (!canResend || isVerified) return;
  //   
  //   setLoading(true);
  //   try {
  //     const response = await resendOTP(userId, email);
  //     // ... rest of the code ...
  //   } catch (error) {
  //     // ... error handling ...
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <View>
     <Modal
        transparent={true}
        visible={modalVisible5}
        onRequestClose={closeModal5}
     >
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
            <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                <View style={styles.modal_header}>
                    <TouchableOpacity onPress={closeModal5}>
                      {darkMode ? <Dark_back /> : <Back />}
                    </TouchableOpacity>
                    <Text style={[styles.heading, { color: theme.color }]}>Vérification</Text>
                </View>
                <Text style={[styles.head_text, {color:theme.color3}]}>
                    Entrez le code à 6 chiffres que vous avez reçu par e-mail.
                </Text>
                
                <View style={styles.timerContainer}>
                    <Text style={[styles.timerText, {color: theme.color3}]}>
                        Le code expire dans: {formatTime(countdown)}
                    </Text>
                </View>
                
                {/* OTP component */}
                <Otp onChange={handleOtpChange} value={otpCode} />
                
                <Button 
                    buttonText={loading ? "Verifying..." : "Continue"} 
                    onPress={handleContinue}
                    disabled={loading || isVerified} 
                />
                
                <TouchableOpacity 
                    onPress={handleResendCode}
                    disabled={!canResend || loading || isVerified}
                    style={styles.resendContainer}
                >
                    <Text style={[
                        styles.resendText, 
                        { color: canResend && !isVerified ? '#836EFE' : theme.color3 }
                    ]}>
                        {canResend && !isVerified ? 'Renvoyer le code' : `Veuillez attendre l'expiration du minuteur pour renvoyer`}
                    </Text>
                </TouchableOpacity>
                
                <Text style={[styles.bottom_text, {color:theme.color3}]}>
                      En continuant, vous acceptez les
                    <Text style={styles.terms}> Conditions d'utilisation</Text> and
                    <Text style={styles.terms}> Politique de confidentialité</Text>
                </Text>
            </View>
        </View>
     </Modal>
     
     {/* Use React.Suspense to handle lazy loading */}
     <React.Suspense fallback={<View />}>
       <LazySignup_section4
          modalVisible6={modalVisible6}
          closeModal6={closeModal6}
          openModal6={openModal6}
          email={email}
          userId={userId}
       />
     </React.Suspense>
    </View>
  );
};

export default Signup_section3;

// Styles remain the same
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 60,
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modal_header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 70,
    marginBottom: 25,
  },
  heading: {
    fontSize: 24,
    lineHeight: 34,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#151515',
  },
  head_text: {
    fontSize: 14,
    lineHeight: 24,
    fontFamily: 'Montserrat_400Regular',
    color: '#727272',
  },
  bottom_text: {
    fontSize: 12,
    lineHeight: 22,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#474747',
    textAlign: 'center',
    marginTop: 16,
  },
  terms: {
    fontSize: 12,
    lineHeight: 22,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#836EFE',
    textDecorationLine: 'underline',
  },
});