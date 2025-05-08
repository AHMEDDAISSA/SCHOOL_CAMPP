import { StyleSheet, Text, View, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
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
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(90); // Changé: 3 minutes en secondes
  const [canResend, setCanResend] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Countdown timer for OTP expiration - version améliorée
  useEffect(() => {
    let timer;
    if (modalVisible5 && countdown > 0 && !isVerified && !canResend) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
      Toast.show({
        type: 'info',
        text1: 'Code expiré',
        text2: 'Vous pouvez maintenant demander un nouveau code',
        visibilityTime: 3000,
        topOffset: 50
      });
    }
    return () => clearTimeout(timer);
  }, [countdown, modalVisible5, isVerified, canResend]);

  // Reset states when modal opens
  useEffect(() => {
    if (modalVisible5) {
      setCountdown(90); // Changé: 3 minutes
      setCanResend(false);
      setOtpCode('');
      setAttempts(0);
      setIsVerified(false);
      setApiError(null);
    }
  }, [modalVisible5]);

  const openModal6 = () => {
    setTimeout(() => setModalVisible6(true), 500);
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
      closeModal5();
      openModal6();
      return;
    }
    
    setLoading(true);
    setApiError(null);
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
        
        setIsVerified(true);
        Toast.show({
          type: 'success',
          text1: 'Vérification réussie',
          text2: 'Votre code a été vérifié avec succès',
          visibilityTime: 4000,
          topOffset: 50
        });
        
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
      setApiError(error);
      
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
  
  // Request new OTP from backend - version améliorée
  const handleResendCode = async () => {
    if (!canResend || isVerified || resendLoading) return;
    
    setResendLoading(true);
    setApiError(null);
    
    try {
      // Approche simplifiée avec un seul appel API
      const response = await resendOTP(userId, email);
      
      if (response && (response.status === 'success' || response.success)) {
        setCountdown(90); // Reset à 3 minutes
        setCanResend(false);
        setOtpCode(''); // Efface le code précédent
        setAttempts(0); // Reset attempts
        
        Toast.show({
          type: 'success',
          text1: 'Code envoyé',
          text2: 'Nouveau code de vérification envoyé avec succès',
          visibilityTime: 4000,
          topOffset: 50
        });
      } else {
        throw new Error(response?.message || 'Échec de l\'envoi du code');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      setApiError(error);
      
      // Essayer avec uniquement userId si la première tentative a échoué
      if (error.response?.status === 404) {
        try {
          console.log('Essai avec uniquement userId');
          const fallbackResponse = await resendOTP(userId);
          
          if (fallbackResponse && (fallbackResponse.status === 'success' || fallbackResponse.success)) {
            setCountdown(90); // Reset à 3 minutes
            setCanResend(false);
            setOtpCode(''); // Efface le code précédent
            setAttempts(0); // Reset attempts
            
            Toast.show({
              type: 'success',
              text1: 'Code envoyé',
              text2: 'Nouveau code de vérification envoyé avec succès',
              visibilityTime: 4000,
              topOffset: 50
            });
            setResendLoading(false);
            return; // Sortir de la fonction si la tentative de secours réussit
          }
        } catch (fallbackError) {
          console.error('Fallback error:', fallbackError);
          // Continuer vers le bloc de gestion d'erreur général
        }
      }
      
      // Gestion d'erreur générale
      Toast.show({
        type: 'error',
        text1: 'Erreur!',
        text2: error.response?.data?.message || 'Erreur réseau. Veuillez réessayer.',
        visibilityTime: 4000,
        topOffset: 50
      });
      
      // Activer le bouton de renvoi immédiatement en cas d'erreur
      setCanResend(true);
    } finally {
      setResendLoading(false);
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
                    buttonText={loading ? "Vérification..." : "Continuer"} 
                    onPress={handleContinue}
                    disabled={loading || otpCode.length !== 6} 
                />
                
                {/* Afficher message d'erreur API si nécessaire */}
                {apiError?.response?.status === 404 && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>
                      Service de vérification indisponible. Veuillez contacter le support.
                    </Text>
                  </View>
                )}
                
                {/* Bouton de renvoi amélioré */}
                <TouchableOpacity 
                    onPress={handleResendCode}
                    disabled={!canResend || loading || isVerified || resendLoading}
                    style={[
                        styles.resendContainer,
                        (!canResend || loading || isVerified || resendLoading) && styles.disabledResend,
                        canResend && !isVerified && !resendLoading && styles.activeResend
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Renvoyer le code de vérification"
                    accessibilityHint={canResend ? "Appuyez pour recevoir un nouveau code de vérification" : "Attendez l'expiration du minuteur pour renvoyer un code"}
                >
                    {resendLoading ? (
                        <ActivityIndicator size="small" color="#836EFE" />
                    ) : (
                        <Text style={[
                            styles.resendText, 
                            { color: canResend && !isVerified ? '#836EFE' : theme.color3 }
                        ]}>
                            {canResend && !isVerified 
                              ? 'Renvoyer le code' 
                              : `Renvoyer le code (${formatTime(countdown)})`}
                        </Text>
                    )}
                </TouchableOpacity>
                
                {/* Option de contournement en cas d'erreur 404 prolongée */}
                {apiError?.response?.status === 404 && (
                  <TouchableOpacity 
                    style={styles.skipVerificationContainer}
                    onPress={() => {
                      // Informer l'utilisateur et passer à l'étape suivante
                      Toast.show({
                        type: 'info',
                        text1: 'Vérification reportée',
                        text2: 'Vous pourrez vérifier votre email plus tard',
                        visibilityTime: 3000,
                        topOffset: 50
                      });
                      closeModal5();
                      openModal6();
                    }}
                  >
                    {/* <Text style={styles.skipVerificationText}>
                      Passer la vérification pour le moment
                    </Text> */}
                  </TouchableOpacity>
                )}
                
                <Text style={[styles.bottom_text, {color:theme.color3}]}>
                      En continuant, vous acceptez les
                    <Text style={styles.terms}> Conditions d'utilisation</Text> et
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

// Styles avec ajouts pour les erreurs et options supplémentaires
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
  timerContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  timerText: {
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
  },
  resendContainer: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 10,
  },
  disabledResend: {
    opacity: 0.6,
  },
  activeResend: {
    opacity: 1,
    backgroundColor: 'rgba(131, 110, 254, 0.1)',
    padding: 8,
    borderRadius: 4,
  },
  resendText: {
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
  },
  errorContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: 'rgba(235, 0, 27, 0.1)',
    borderRadius: 8,
  },
  errorText: {
    color: '#EB001B',
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'center',
  },
  skipVerificationContainer: {
    marginTop: 15,
    padding: 8,
    alignItems: 'center',
  },
  skipVerificationText: {
    fontSize: 13,
    color: '#836EFE',
    fontFamily: 'Montserrat_600SemiBold',
    textDecorationLine: 'underline',
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
