import { StyleSheet, Text, View, Switch, TouchableOpacity } from 'react-native';
import React, { useContext, useState } from 'react';
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
import { addUser } from '../../../services/api';
import Toast from 'react-native-toast-message'; // Import Toast

const Login_section2 = () => {
    const [email, setEmail] = useState('');
    const [isEmailValid, setIsEmailValid] = useState(true);
    const { theme, darkMode } = useContext(ThemeContext);
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
        // Only validate if there's text
        if (text.length > 0) {
            setIsEmailValid(validateEmail(text));
        } else {
            setIsEmailValid(true); // Don't show error when field is empty
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
            // Replace alert with Toast
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
            // Replace alert with Toast
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
            const userData = await addUser(email);

            if (userData) {
                console.log('User found:', userData);
                // Show success toast
                Toast.show({
                    type: 'success',
                    text1: 'Connexion réussie',
                    text2: 'Vous êtes maintenant connecté',
                    visibilityTime: 3000,
                    topOffset: 50
                });
                
                // Delay navigation slightly to allow toast to be seen
                setTimeout(() => {
                    router.push('/home');
                }, 1000);
            }
        } catch (err) {
            console.error('Login error:', err);

            // Create an appropriate error message based on the error
            let errorMessage = 'Une erreur est survenue lors de la connexion';
            
            if (err.response) {
                errorMessage = `Erreur de serveur: ${err.response.status}`;
                // If you have specific error messages from the backend:
                if (err.response.data && err.response.data.message) {
                    errorMessage = err.response.data.message;
                }
            } else if (err.request) {
                errorMessage = 'Pas de réponse du serveur. Vérifiez votre connexion réseau.';
            } else {
                errorMessage = `Erreur: ${err.message}`;
            }

            // Show error toast
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
                    error={!isEmailValid ? "Please enter a valid email" : ""}
                />
            </View>
            
            <Button
                buttonText={loading ? "Connexion en cours..." : "Se connecter avec Email"}
                onPress={handleLogin}
                disabled={loading}
            />
            
            {/* Modal sections */}
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
