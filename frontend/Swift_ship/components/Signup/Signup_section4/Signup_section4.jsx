import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native';
import React, { useContext } from 'react';
import Back from "../../../assets/images/back.svg";
import Dark_back from "../../../assets/images/dark_back.svg";
import Success from "../../../assets/images/success.svg";
import ThemeContext from '../../../theme/ThemeContext';
import Button from '../../Button/Button';
import { router } from "expo-router";

const Signup_section4 = ({ modalVisible6, closeModal6 }) => {
    const { theme, darkMode, toggleTheme } = useContext(ThemeContext);

    const handleContinue = () => {
        closeModal6();
        router.push('profile_setup');
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
                        <TouchableOpacity onPress={closeModal6}>
                           {darkMode? <Dark_back /> : <Back />}
                        </TouchableOpacity>
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
