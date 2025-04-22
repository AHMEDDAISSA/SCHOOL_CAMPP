import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native';
import React, { useContext, useState } from 'react';
import Back from "../../../assets/images/back.svg";
import Dark_back from "../../../assets/images/dark_back.svg";
import ThemeContext from '../../../theme/ThemeContext';
import Password from '../../Password/Password';
import Button from '../../Button/Button';
import { Montserrat_400Regular, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import Otp from '../../OTP/Otp';

const Login_section4 = ({ modalVisible2, closeModal2, openModal3 }) => {
    const { theme, darkMode } = useContext(ThemeContext);

    return (
        <View>
            <Modal
                transparent={true}
                visible={modalVisible2}
                onRequestClose={closeModal2}
            >
                <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        <View style={styles.modal_header}>
                            <TouchableOpacity onPress={closeModal2}>
                               {darkMode? <Dark_back /> : <Back />}
                            </TouchableOpacity>
                            <Text style={[styles.heading, { color: theme.color }]}>Code de vérification</Text>
                        </View>
                        <Text style={[styles.head_text, {color:theme.color3}]}>Entrez le code à 4 chiffres que vous avez reçu par e-mail.</Text>
                        <Otp />
                     <Button buttonText="continue" onPress={openModal3} />
                     <Text style={[styles.bottom_text, {color:theme.color3}]}>En continuant, vous acceptez les conditions de Shopping.<Text style={styles.terms}> Conditions d'utilisation</Text> et <Text style={styles.terms}> Avis de confidentialité</Text></Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default Login_section4;

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
    }
});
