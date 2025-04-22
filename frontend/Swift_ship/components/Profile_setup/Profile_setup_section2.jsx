// Profile_setup_section2.jsx
import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import React, { useContext, useState } from 'react';
import Input from '../../components/Input/Input';
import DateInput from '../DateInput/DateInput';
import GenderDropdown from '../Gender_dropdown/Gender_dropdown';
import Phone from '../Phone/Phone'; 
import Button from '../../components/Button/Button';
import { router, Link } from "expo-router";
import ThemeContext from '../../theme/ThemeContext';

const Profile_setup_section2 = () => {
  const { theme, darkMode } = useContext(ThemeContext);
  
  // State to store form values
  const [formData, setFormData] = useState({
    fullName: '',
    nickName: '',
    dob: '',
    email: '',
    phoneNumber: '',
    gender: '',
    isPhoneValid: true // Add flag to track phone validation
  });

  // Handle general input changes
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Handle date change from DateInput
  const handleDateChange = (date, formattedDate) => {
    setFormData({
      ...formData,
      dob: formattedDate
    });
  };

  // Handle phone number change from Phone component
  const handlePhoneChange = (phoneNumber, isValid) => {
    setFormData({
      ...formData,
      phoneNumber,
      isPhoneValid: isValid
    });
  };

  // Handle gender selection
  const handleGenderChange = (gender) => {
    setFormData({
      ...formData,
      gender
    });
  };

  // Validate the form before submission
  const validateForm = () => {
    // Check if phone is valid
    if (!formData.isPhoneValid) {
      Alert.alert('Invalid Input', 'Please enter a valid phone number');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleContinue = () => {
    if (validateForm()) {
      router.push('/login');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.input_container}>
        <Input 
          placeholder="Full Name" 
          value={formData.fullName}
          onChangeText={(text) => handleInputChange('fullName', text)}
        />
        <Input 
          placeholder="Nick Name" 
          value={formData.nickName}
          onChangeText={(text) => handleInputChange('nickName', text)}
        />
        <DateInput 
          placeholder="Date of birth" 
          onDateChange={handleDateChange}
          // value={formData.date}
          // onChangeText={(text) => handleInputChange('', text)}
        />
        
        <Input 
          placeholder="Email" 
          value={formData.email}
          onChangeText={(text) => handleInputChange('email', text)}
          keyboardType="email-address"
        />
        
        
        <Phone 
          placeholder="Phone Number"
          onChangePhone={handlePhoneChange}
          initialValue={formData.phoneNumber}
        />
        
        <GenderDropdown 
          placeholder="Gender" 
          onSelect={handleGenderChange}
        />
      </View>
      <Button buttonText="Continue" onPress={handleContinue} />
    </View>
  );
};

export default Profile_setup_section2;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 60,
    flex: 1,
  },
  input_container: {
    flex: 1,
  }
});
