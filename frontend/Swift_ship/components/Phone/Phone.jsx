// Phone.jsx
import { StyleSheet, Text, View } from 'react-native';
import React, { useState, useContext } from 'react';
import Input from '../../components/Input/Input';
import ThemeContext from '../../theme/ThemeContext';

const Phone = ({ 
  placeholder = "Phone Number",
  onChangePhone,
  initialValue = '',
  required = false,
}) => {
  const { theme, darkMode } = useContext(ThemeContext);
  
  // State for the phone number
  const [phoneNumber, setPhoneNumber] = useState(initialValue);
  
  // State for validation error
  const [error, setError] = useState('');

  // Handle phone number input change
  const handlePhoneChange = (value) => {
    // Remove any non-digit characters
    const numericValue = value.replace(/[^0-9]/g, '');
    
    setPhoneNumber(numericValue);
    
    // Validate the input
    if (numericValue.length > 0 && !/^\d+$/.test(numericValue)) {
      setError('Phone number must contain only digits');
    } else {
      setError('');
    }
    
    // Pass the validated value back to parent component
    if (onChangePhone) {
      onChangePhone(numericValue, !error);
    }
  };

  return (
    <View style={styles.container}>
      <Input 
        placeholder={placeholder}
        value={phoneNumber}
        onChangeText={handlePhoneChange}
        keyboardType="numeric" // Show numeric keyboard
        maxLength={15} // Reasonable max length for phone numbers
      />
      {error ? (
        <Text style={[styles.errorText, { color: theme.error || 'red' }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

export default Phone;

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  errorText: {
    fontSize: 12,
    marginLeft: 10,
    marginTop: 5,
  }
});
