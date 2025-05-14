import { StyleSheet, Text, View, Switch, TouchableOpacity } from 'react-native';
import React, { useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Input from '../../Input/Input';
import Mail from "../../../assets/images/mail.svg";
import Dark_mail from "../../../assets/images/dark_mail.svg";
import Button from '../../Button/Button';
import Login_section3 from '../Login_section3/Login_section3';
import Login_section4 from '../Login_section4/Login_section4';
import ThemeContext from '../../../theme/ThemeContext';
import Login_section5 from '../Login_section5/Login_section5';
import Login_section6 from '../Login_section6/Login_section6';
import { router, Link } from "expo-router";
import { loginUser } from '../../../services/api';
import Toast from 'react-native-toast-message';

const Login_section2 = () => {
    const [email, setEmail] = useState('');
    const [isEmailValid, setIsEmailValid] = useState(true);
    const { theme, darkMode, setProfileData } = useContext(ThemeContext);
    const [isRemember, setIsRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisible2, setModalVisible2] = useState(false);
    const [modalVisible3, setModalVisible3] = useState(false);
    const [modalVisible4, setModalVisible4] = useState(false);

    // Email validation function
    const validateEmail = (text) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(text);
    };

    // Handle email input change
    const handleEmailChange = (text) => {
        setEmail(text);
        if (text.length > 0) {
            setIsEmailValid(validateEmail(text));
        } else {
            setIsEmailValid(true);
        }
    };

    const toggleSwitch = () => setIsRemember(previousState => !previousState);
    
    // Modal management functions
    const openModal = () => setModalVisible(true);
    const closeModal = () => setModalVisible(false);
    const openModal2 = () => {
        setModalVisible(false);
        setTimeout(() => setModalVisible2(true), 300);
    };
    const openModal3 = () => {
        setModalVisible2(false);
        setTimeout(() => setModalVisible3(true), 300);
    };
    const openModal4 = () => {
        setModalVisible3(false);
        setTimeout(() => setModalVisible4(true), 300);
    };
    const closeModal2 = () => setModalVisible2(false);
    const closeModal3 = () => setModalVisible3(false);
    const closeModal4 = () => setModalVisible4(false);

    // Login function
    const handleLogin = async () => {
        if (!email) {
            Toast.show({
                type: 'error',
                text1: 'Erreur!',
                text2: 'Veuillez saisir votre adresse e-mail',
                visibilityTime: 4000,
                topOffset: 50
            });
            return;
        }
    
        if (!validateEmail(email)) {
            Toast.show({
                type: 'error',
                text1: 'Erreur!',
                text2: 'Veuillez saisir une adresse e-mail valide',
                visibilityTime: 4000,
                topOffset: 50
            });
            return;
        }
    
        setLoading(true);
    
        try {
            const userData = await loginUser(email);
    
            if (userData.status === "success" || userData.token) {
                console.log('User logged in:', userData);
    
                if (userData.token) {
                    try {
                        await AsyncStorage.setItem('userToken', userData.token);
                        await AsyncStorage.setItem('userEmail', email);
                        
                        // Store user info in AsyncStorage and update context
                        if (userData.user) {
                            await AsyncStorage.setItem('userInfo', JSON.stringify(userData.user));
                            setProfileData({
    fullName: userData.user.fullName || `${userData.user.first_name || ''} ${userData.user.last_name || ''}`.trim(),
    email: userData.user.email,
    phoneNumber: userData.user.phone,
    role: userData.user.role,
    first_name: userData.user.first_name,
    last_name: userData.user.last_name,
    
  });
                            
                            // Get user role
                            const userRole = userData.user.role;
                            
                            // Store user role for future use
                            await AsyncStorage.setItem('userRole', userRole);
                        } else {
                            setProfileData(prev => ({ ...prev, email }));
                        }
                        console.log('Token, email, and user info stored successfully');
                    } catch (storageError) {
                        console.error('Failed to store data:', storageError);
                        throw new Error('Failed to store authentication data');
                    }
                } else {
                    throw new Error('No token received from server');
                }
    
                Toast.show({
                    type: 'success',
                    text1: 'Connexion réussie',
                    text2: 'Vous êtes maintenant connecté',
                    visibilityTime: 3000,
                    topOffset: 50
                });
    
                setTimeout(() => {
                    // Check if user has a role from userData
                    if (userData.user && userData.user.role) {
                        const userRole = userData.user.role;
                        
                        
                        switch(userRole) {
                            case 'exploitant':
                                router.push('/exploitant');
                                break;
                            case 'admin':
                                router.push('/admin');
                                break;
                            case 'parent':
                                router.push('/home');
                                break;
                            default:
                                router.push('/home');
                        }
                    } else {
                        
                        router.push('/home');
                    }
                }, 1000);
            } else {
                throw new Error(userData.message || 'Response received but login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            let errorMessage = 'Une erreur est survenue lors de la connexion';
            if (err.response) {
                const status = err.response.status;
                if (status === 404) {
                    errorMessage = "Cet email n'est pas enregistré. Veuillez créer un compte.";
                } else if (status === 401) {
                    errorMessage = "Identifiants invalides. Veuillez réessayer.";
                } else if (status === 400) {
                    errorMessage = err.response.data?.message || "Données invalides. Vérifiez vos informations.";
                } else {
                    errorMessage = `Erreur de serveur: ${status}`;
                    if (err.response.data && err.response.data.message) {
                        errorMessage = err.response.data.message;
                    }
                }
            } else if (err.request) {
                errorMessage = 'Pas de réponse du serveur. Vérifiez votre connexion réseau.';
            } else {
                errorMessage = `Erreur: ${err.message}`;
            }
    
            Toast.show({
                type: 'error',
                text1: 'Échec de la connexion',
                text2: errorMessage,
                visibilityTime: 4000,
                topOffset: 50
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View>
            <View style={[styles.input_container]}>
                <Input
                    label="Email"
                    placeholder="Entrez-votre-email"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={handleEmailChange}
                    iconLeft={darkMode ? Dark_mail : Mail}
                    error={!isEmailValid ? "Veuillez saisir un email valide" : ""}
                />
            </View>
            
            <Button
                buttonText={loading ? "Connexion en cours..." : "Se connecter avec Email"}
                onPress={handleLogin}
                disabled={loading}
            />
            
            <Login_section3 
                modalVisible={modalVisible}
                closeModal={closeModal}
                openModal2={openModal2}
            />
            <Login_section4
                modalVisible2={modalVisible2}
                closeModal2={closeModal2}
                openModal3={openModal3}
            />
            <Login_section5 
                modalVisible3={modalVisible3}
                closeModal3={closeModal3}
                openModal4={openModal4}
            />
            <Login_section6 
                modalVisible4={modalVisible4}
                closeModal4={closeModal4}
            />
        </View>
    );
};

export default Login_section2;

const styles = StyleSheet.create({
    input_container: {
        gap: 16,
        marginBottom: 15,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 16,
        paddingBottom: 16,
    },
    switch_row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    remember: {
        fontSize: 14,
        lineHeight: 24,
        fontFamily: 'SourceSansPro_400Regular',
        color: '#727272',
    },
    forget: {
        fontSize: 12,
        lineHeight: 24,
        fontFamily: 'Montserrat_400Regular',
        color: '#727272',
    },
    infoContainer: {
        marginTop: 20,
        padding: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(131, 110, 254, 0.1)',
    },
    infoText: {
        fontSize: 14,
        fontFamily: 'SourceSansPro_400Regular',
        textAlign: 'center',
    }
});