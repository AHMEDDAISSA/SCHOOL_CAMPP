import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import React, { useContext } from 'react';
import Open from "../../assets/images/eye-open.svg";
import Close from "../../assets/images/eye-close.svg";
import ThemeContext from '../../theme/ThemeContext';

const Password = ({ label, passwordVisible, setPasswordVisible, placeholder, keyboardType, Icon }) => {
    const { theme, darkMode } = useContext(ThemeContext);
    const togglePasswordVisible = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <View style={styles.inputBox}>
            {label && <Text style={[styles.label, { color: theme.color }]}>{label}</Text>}
            <View style={styles.inputWrapper}>
                {Icon && <Icon style={styles.icon} />}
                <TextInput
                    style={[styles.passwordInput, { color: theme.color, backgroundColor:theme.card }]}
                    placeholderTextColor={darkMode ? '#ffffff' : '#000000'}
                    placeholder={placeholder}
                    secureTextEntry={!passwordVisible}
                    keyboardType={keyboardType}
                />
                <TouchableOpacity onPress={togglePasswordVisible} style={styles.eye}>
                    {passwordVisible ? <Open /> : <Close />}
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Password;

const styles = StyleSheet.create({
    inputBox: {
        gap: 10,
    },
    label: {
        fontSize: 14,
        lineHeight: 24,
        fontFamily: 'SourceSansPro_700Bold',
        color: '#121212',
        textTransform: 'capitalize',
    },
    inputWrapper: {
        position: 'relative',
    },
    passwordInput: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        paddingLeft: 35,
        paddingRight: 45,
        borderRadius: 6,
        backgroundColor: '#f6f6f6',
        borderColor: 'transparent',
    },
    eye: {
        position: 'absolute',
        right: 10,
        bottom: 18,
    },
    icon: {
        position: 'absolute',
        left: 10,
        bottom: 17,
        zIndex: 100,
    },
});
