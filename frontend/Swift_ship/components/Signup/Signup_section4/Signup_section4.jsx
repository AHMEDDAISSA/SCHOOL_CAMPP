import { StyleSheet, Text, View, Modal, TouchableOpacity, BackHandler } from 'react-native'; // Ajouter BackHandler
import React, { useContext, useEffect } from 'react';
// Supprimer les imports Back et Dark_back
import Success from "../../../assets/images/success.svg";
import ThemeContext from '../../../theme/ThemeContext';
import Button from '../../Button/Button';
import { router } from "expo-router";
import Toast from 'react-native-toast-message';

const Signup_section4 = ({ modalVisible6, closeModal6, email, userId }) => {
    const { theme, darkMode, toggleTheme } = useContext(ThemeContext);

    // Gestion du bouton retour physique
    useEffect(() => {
        const backAction = () => {
            if (modalVisible6) {
                Alert.alert(
                    "Confirmation",
                    "Voulez-vous vraiment quitter l'inscription ?",
                    [
                        {
                            text: "Non",
                            onPress: () => null,
                            style: "cancel"
                        },
                        { 
                            text: "Oui", 
                            onPress: () => closeModal6()
                        }
                    ]
                );
                return true; // Bloque le retour par défaut
            }
            return false; // Comportement normal
        };


        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [modalVisible6]);

    // Show success toast (existant)
    useEffect(() => {
        if (modalVisible6) {
            Toast.show({
                type: 'success',
                text1: 'Inscription terminée',
                text2: 'Votre compte a été créé avec succès',
                visibilityTime: 4000,
                topOffset: 50
            });
        }
    }, [modalVisible6]);

    const handleContinue = () => {
        closeModal6();        
        router.push({ pathname: `profile_setup`, params: {email, userId} } );
    };

    return (
        <View>
            <Modal
                transparent={true}
                visible={modalVisible6}
                onRequestClose={closeModal6}
            >
                <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        {/* Supprimer le TouchableOpacity pour la flèche */}
                        <View style={styles.image_container}>
                            <Success />
                        </View>
                        <Text style={[styles.heading, { color: theme.color }]}>Réussi</Text>
                        <Button buttonText="continue" onPress={handleContinue} />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default Signup_section4;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
    },
    modalContent: {
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 25,
        backgroundColor: '#fff',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    image_container: {
        alignItems: 'center',
    },
    heading: {
        fontSize: 24,
        lineHeight: 34,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#151515',
        textTransform: 'capitalize',
        textAlign: 'center',
        marginVertical: 30,
    },
});
