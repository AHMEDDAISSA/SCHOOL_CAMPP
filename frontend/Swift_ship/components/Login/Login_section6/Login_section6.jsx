import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native';
import React, { useContext, useState } from 'react';
import Back from "../../../assets/images/back.svg";
import Dark_back from "../../../assets/images/dark_back.svg";
import Success from "../../../assets/images/success.svg";
import ThemeContext from '../../../theme/ThemeContext';
import Password from '../../Password/Password';
import Button from '../../Button/Button';
import { Montserrat_400Regular, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { router, Link } from "expo-router";

const Login_section6 = ({ modalVisible4, closeModal4 }) => {
    const { theme, darkMode } = useContext(ThemeContext);
    return (
        <View>
            <Modal
                transparent={true}
                visible={modalVisible4}
                onRequestClose={closeModal4}
            >
                <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                            <TouchableOpacity onPress={closeModal4}>
                               {darkMode? <Dark_back /> : <Back />}
                            </TouchableOpacity>
                            <View style={styles.image_container}>
                            <Success />
                            </View>
                            <Text style={[styles.heading, { color: theme.color }]}>Successful</Text>
                        <Button buttonText="continue" onPress={() => {router.push('home')}} />
                 </View>
                </View>
            </Modal>
        </View>
    );
};

export default Login_section6;

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
