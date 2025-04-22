import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native';
import React, { useContext } from 'react';
import Back from "../../../assets/images/back.svg";
import Dark_back from "../../../assets/images/dark_back.svg";
import ThemeContext from '../../../theme/ThemeContext';
import Input from '../../Input/Input';
import Mail from "../../../assets/images/mail.svg";
import Dark_mail from "../../../assets/images/dark_mail.svg";
import Button from '../../Button/Button';
import { Montserrat_400Regular, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';

const Login_section3 = ({ modalVisible, closeModal, openModal2 }) => {
    const { theme, darkMode } = useContext(ThemeContext);

    return (
        <View>
            <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        <View style={styles.modal_header}>
                            <TouchableOpacity onPress={closeModal}>
                             {darkMode? <Dark_back /> : <Back />}
                            </TouchableOpacity>
                            <Text style={[styles.heading, { color: theme.color }]}>Forgot Password</Text>
                        </View>
                        <Text style={[styles.head_text, {color:theme.color3}]}>Don't worry, it happens to the best of us. Enter your email address below and we'll help you reset your password.</Text>
                        <View style={styles.box}>
                            <Input placeholder='Email' Icon={darkMode? Dark_mail : Mail} />
                        </View>
                        <Button buttonText="continue" onPress={openModal2} />
                        <Text style={[styles.bottom_text, {color:theme.color3}]}>By continuing, you agree to Shopping<Text style={styles.terms}> Conditions of Use</Text> and<Text style={styles.terms}> Privacy Notice</Text></Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default Login_section3;

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
        gap: 40,
        marginBottom: 25,
    },
    heading: {
        fontSize: 24,
        lineHeight: 34,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#151515',
        textTransform: 'capitalize',
    },
    head_text: {
        fontSize: 14,
        lineHeight: 24,
        fontFamily: 'Montserrat_400Regular',
        color: '#474747',
    },
    box: {
        marginTop: 22,
        marginBottom: 16,
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
