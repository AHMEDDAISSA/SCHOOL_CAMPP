import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import Back from "../../../assets/images/back.svg";
import Dark_back from "../../../assets/images/dark_back.svg";
import ThemeContext from '../../../theme/ThemeContext';
import Button from '../../Button/Button';
import { Montserrat_400Regular, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import Otp from '../../OTP/Otp';
import Signup_section4 from '../Signup_section4/Signup_section4';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { verifyOTP, resendOTP } from '../../../services/api';
import Toast from 'react-native-toast-message';

const Signup_section3 = ({ email, userId, closeModal5, modalVisible5 }) => {
  const { theme, darkMode } = useContext(ThemeContext);
  const [modalVisible6, setModalVisible6] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Countdown timer for OTP expiration
  useEffect(() => {
    let timer;
    if (modalVisible5 && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, modalVisible5]);

  // Reset countdown when modal opens
  useEffect(() => {
    if (modalVisible5) {
      setCountdown(300); // 5 minutes as per your OTP model
      setCanResend(false);
      setOtpCode(''); // Clear previous code
      setAttempts(0); // Reset attempts
    }
  }, [modalVisible5]);

  const openModal6 = () => {
    setTimeout(() => setModalVisible6(true), 300);
  };  
  
  const closeModal6 = () => {
    setModalVisible6(false);
  };

  // Handle OTP input changes
  const handleOtpChange = (code) => {
    // Get the combined OTP value from all inputs
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
    
    setLoading(true);
    try {
      // Use the updated API function
      const response = await verifyOTP(userId, otpCode);
      
      if (response.success) {
        // Store the JWT token if provided
        if (response.token) {
          try {
            await AsyncStorage.setItem('authToken', response.token);
            console.log('Token stored successfully');
          } catch (storageError) {
            console.error('Error storing token:', storageError);
          }
        }
        
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
        // Update attempts
        setAttempts(attempts + 1);
        Toast.show({
          type: 'error',
          text1: 'Echec de vérification',
          text2: response.message || 'Code de vérification invalide',
          visibilityTime: 4000,
          topOffset: 50
        });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      // Update attempts
      setAttempts(attempts + 1);
      Toast.show({
        type: 'error',
        text1: 'Erreur!',
        text2: 'Erreur réseau. Veuillez réessayer.',
        visibilityTime: 4000,
        topOffset: 50
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Request new OTP from backend
  const handleResendCode = async () => {
    if (!canResend) return;
    
    setLoading(true);
    try {
      // Use the updated API function
      const response = await resendOTP(userId, email);
      
      if (response.success) {
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
        text2: 'Erreur réseau. Veuillez réessayer.',
        visibilityTime: 4000,
        topOffset: 50
      });
    } finally {
      setLoading(false);
    }
  };

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
                      {darkMode? <Dark_back /> : <Back />}
                    </TouchableOpacity>
                    <Text style={[styles.heading, { color: theme.color }]}>Verification</Text>
                </View>
                <Text style={[styles.head_text, {color:theme.color3}]}>
                    Enter the 6 digits code that you received on your email.
                </Text>
                
                <View style={styles.timerContainer}>
                    <Text style={[styles.timerText, {color: theme.color3}]}>
                        Code expires in: {formatTime(countdown)}
                    </Text>
                </View>
                
                {/* OTP component */}
                <Otp onChange={handleOtpChange} />
                
                <Button 
                    buttonText={loading ? "Verifying..." : "Continue"} 
                    onPress={handleContinue}
                    disabled={loading} 
                />
                
                <TouchableOpacity 
                    onPress={handleResendCode}
                    disabled={!canResend || loading}
                    style={styles.resendContainer}
                >
                    <Text style={[
                        styles.resendText, 
                        { color: canResend ? '#836EFE' : theme.color3 }
                    ]}>
                        {canResend ? 'Resend code' : `Wait until timer expires to resend`}
                    </Text>
                </TouchableOpacity>
                
                <Text style={[styles.bottom_text, {color:theme.color3}]}>
                    By continuing, you agree to Shopping
                    <Text style={styles.terms}> Conditions of Use</Text> and
                    <Text style={styles.terms}> Privacy Notice</Text>
                </Text>
            </View>
        </View>
     </Modal>
     
     <Signup_section4
        modalVisible6={modalVisible6}
        closeModal6={closeModal6}
        openModal6={openModal6}
        email={email}
        userId={userId}
     />
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
  resendContainer: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  resendText: {
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  timerText: {
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
  },
});
