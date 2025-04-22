import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native';
import React, { useContext, useState } from 'react';
import Back from "../../../assets/images/back.svg";
import Dark_back from "../../../assets/images/dark_back.svg";
import Security from "../../../assets/images/password.svg";
import Dark_Security from "../../../assets/images/dark_security.svg";
import ThemeContext from '../../../theme/ThemeContext';
import Password from '../../Password/Password';
import Button from '../../Button/Button';
import { Montserrat_400Regular, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';

const Login_section5 = ({ modalVisible3, closeModal3, openModal4 }) => {
    const { theme, darkMode } = useContext(ThemeContext);
    const [Passwordvisible2, setPasswordvisible2] = useState(false);
    const [Passwordvisible3, setPasswordvisible3] = useState(false);

    return (
        <View>
            <Modal
                transparent={true}
                visible={modalVisible3}
                onRequestClose={closeModal3}
            >
                <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        <View style={styles.modal_header}>
                            <TouchableOpacity onPress={closeModal3}>
                              {darkMode? <Dark_back /> : <Back />}
                            </TouchableOpacity>
                            <Text style={[styles.heading, { color: theme.color }]}>Reset Password</Text>
                        </View>
                        <Text style={[styles.head_text, {color:theme.color3}]}>Set the new password for your account so you can login and access all the features.</Text>
                        <View style={styles.inputContainer}>
                            <Password Icon={darkMode? Dark_Security : Security} placeholder="Password" passwordVisible={Passwordvisible2} setPasswordVisible={setPasswordvisible2} />
                            <Password Icon={darkMode? Dark_Security : Security} placeholder="Confirm Password" passwordVisible={Passwordvisible3} setPasswordVisible={setPasswordvisible3} />
                        </View>
                        <Button buttonText="continue" onPress={openModal4} />
                        <Text style={[styles.bottom_text, {color:theme.color3}]}>By continuing, you agree to Shopping<Text style={styles.terms}> Conditions of Use</Text> and<Text style={styles.terms}> Privacy Notice</Text></Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default Login_section5;

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
        gap: 35,
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
        color: '#727272',
    },
    inputContainer: {
        gap: 16,
        marginVertical: 20,
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
