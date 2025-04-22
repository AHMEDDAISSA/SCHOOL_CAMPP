// Signup_section2.jsx
import { StyleSheet, Text, View, Alert } from 'react-native';
import React, { useContext, useState } from 'react';
import Input from '../../Input/Input';
import Person from "../../../assets/images/person.svg";
import Dark_person from "../../../assets/images/dark_person.svg";
import Button from '../../Button/Button';
import Signup_section3 from '../Signup_section3/Signup_section3';
import ThemeContext from '../../../theme/ThemeContext';
import { requestOTP } from '../../../services/api'; // Import the API function

const Signup_section2 = () => {
    const { theme, darkMode } = useContext(ThemeContext);
    const [modalVisible5, setModalVisible5] = useState(false);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState('');

    // Function to handle email input changes
    const handleEmailChange = (text) => {
        setEmail(text);
    };

    // Function to validate email
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Function to request verification code
    const handleRequestVerificationCode = async () => {
        if (!isValidEmail(email)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            // Use the updated API function
            const response = await requestOTP(email);
            
            if (response.success) {
                // Store userId for verification
                setUserId(response.userId);
                // Open verification modal
                setModalVisible5(true);
            } else {
                Alert.alert('Error', response.message || 'Failed to send verification code');
            }
        } catch (error) {
            console.error('Error requesting OTP:', error);
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const closeModal5 = () => {
        setModalVisible5(false);
    };
    
    return (
        <View>
            <View style={styles.input_container}>
                <Input 
                    placeholder="Please enter your email address" 
                    Icon={darkMode ? Dark_person : Person}
                    value={email}
                    onChangeText={handleEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <Button 
                buttonText={loading ? "Sending..." : "Sign In"} 
                onPress={handleRequestVerificationCode}
                disabled={loading} 
            />
            
            <Signup_section3 
                email={email}
                userId={userId}
                modalVisible5={modalVisible5}
                closeModal5={closeModal5}
            />
        </View>
    );
};

export default Signup_section2;

const styles = StyleSheet.create({
    input_container: {
        gap: 16,
        marginBottom: 15,
    }
});
