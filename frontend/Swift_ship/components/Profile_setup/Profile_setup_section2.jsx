import { StyleSheet, Text, View } from 'react-native';
import React, { useContext, useState } from 'react';
import Input from '../../components/Input/Input';
import DateInput from '../DateInput/DateInput';
import GenderDropdown from '../Gender_dropdown/Gender_dropdown';
import Phone from '../Phone/Phone';
import Button from '../../components/Button/Button';
import { router } from 'expo-router';
import ThemeContext from '../../theme/ThemeContext';
import Toast from 'react-native-toast-message'; // Importation de la bibliothèque Toast

const Profile_setup_section2 = () => {
  const { theme, darkMode, updateProfileData } = useContext(ThemeContext);
  
  const [formData, setFormData] = useState({
    fullName: '',
    nickName: '',
    dob: '',
    email: '',
    phoneNumber: '',
    gender: '',
    isPhoneValid: true,
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDateChange = (date, formattedDate) => {
    setFormData({ ...formData, dob: formattedDate });
  };

  const handlePhoneChange = (phoneNumber, isValid) => {
    setFormData({ ...formData, phoneNumber, isPhoneValid: isValid });
  };

  const handleGenderChange = (gender) => {
    setFormData({ ...formData, gender });
  };

  const showToast = (message, type = 'error') => {
    Toast.show({
      type: type, // 'success', 'error', 'info'
      text1: 'Attention',
      text2: message,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 50,
    });
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.phoneNumber) {
      showToast('Veuillez remplir tous les champs obligatoires (nom complet, email, numéro de téléphone).');
      return false;
    }
    if (!formData.isPhoneValid) {
      showToast('Veuillez entrer un numéro de téléphone valide.');
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (validateForm()) {
      updateProfileData({
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      });
      router.push('/login');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.input_container}>
        <Input
          placeholder="Nom complet"
          value={formData.fullName}
          onChangeText={(text) => handleInputChange('fullName', text)}
        />
        <Input
          placeholder="Surnom"
          value={formData.nickName}
          onChangeText={(text) => handleInputChange('nickName', text)}
        />
        <DateInput
          placeholder="Date de naissance"
          onDateChange={handleDateChange}
        />
        <Input
          placeholder="Email"
          value={formData.email}
          onChangeText={(text) => handleInputChange('email', text)}
          keyboardType="email-address"
        />
        <Phone
          placeholder="Numéro de téléphone"
          onChangePhone={handlePhoneChange}
          initialValue={formData.phoneNumber}
        />
        <GenderDropdown
          placeholder="Genre"
          onSelect={handleGenderChange}
        />
      </View>
      <Button buttonText="Continuer" onPress={handleContinue} />
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
  },
});
