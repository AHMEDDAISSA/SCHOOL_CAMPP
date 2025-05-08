import React, { useContext, useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Dimensions, Image, Platform } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import { Ionicons } from '@expo/vector-icons';
import ThemeContext from '../../theme/ThemeContext';
import Button from '../../components/Button/Button';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { registerUser } from '../../services/api';

const { width, height } = Dimensions.get('window');

const CustomPhoneInput = ({ defaultValue, defaultCode, onChangeText, onChangeFormattedText, containerStyle, textContainerStyle, textInputStyle, codeTextStyle, textInputProps, flagButtonStyle, hasError, theme }) => {
  return (
    <PhoneInput
      defaultValue={defaultValue}
      defaultCode={defaultCode}
      layout="first"
      onChangeText={onChangeText}
      onChangeFormattedText={onChangeFormattedText}
      containerStyle={[
        containerStyle,
        hasError && [styles.inputError, { borderColor: theme.log }]
      ]}
      textContainerStyle={[
        textContainerStyle,
        hasError && { backgroundColor: theme.background2 }
      ]}
      textInputStyle={textInputStyle}
      codeTextStyle={codeTextStyle}
      textInputProps={{
        ...textInputProps,
        placeholder: textInputProps.placeholder || 'Votre numéro de téléphone',
      }}
      flagButtonStyle={[
        flagButtonStyle,
        hasError && { backgroundColor: theme.background2 }
      ]}
      withDarkTheme={false}
      withShadow={false}
      autoFocus={false}
    />
  );
};

const RoleSelector = ({ selectedRole, onRoleSelect, theme, hasError }) => {
  const roles = [
    {
      id: 'parent',
      label: 'Parent',
      icon: 'people-outline',
      description: 'Gérer le compte de votre enfant'
    },
    {
      id: 'admin',
      label: 'Administrateur',
      icon: 'settings-outline',
      description: 'Administrer la plateforme'
    },
    {
      id: 'exploitant',
      label: 'Exploitant',
      icon: 'business-outline',
      description: 'Gérer les services'
    }
  ];

  return (
    <View style={styles.roleSelectionContainer}>
      {hasError && (
        <Text style={[styles.errorText, { color: theme.log }]}>Veuillez sélectionner un profil</Text>
      )}
      {roles.map((role) => (
        <TouchableOpacity
          key={role.id}
          style={[
            styles.roleCard,
            {
              backgroundColor: '#F9F9F9',
              borderColor: selectedRole === role.id ? '#6D5FFD' : (hasError ? theme.log : '#E0E0E0'),
              borderWidth: selectedRole === role.id ? 2 : (hasError ? 2 : 1),
              shadowColor: theme.color2,
            }
          ]}
          onPress={() => onRoleSelect(role.id)}
        >
          <View style={styles.roleCardContent}>
            <View style={[
              styles.iconContainer,
              { backgroundColor: selectedRole === role.id ? '#6D5FFD' : '#E0E0E0' }
            ]}>
              <Ionicons
                name={role.icon}
                size={24}
                color={selectedRole === role.id ? '#FFFFFF' : '#757575'}
              />
            </View>
            <Text style={[
              styles.roleTitle,
              { color: selectedRole === role.id ? '#6D5FFD' : '#424242' }
            ]}>
              {role.label}
            </Text>
            <Text style={[
              styles.roleDescription,
              { color: '#757575' }
            ]}>
              {role.description}
            </Text>
          </View>
          {selectedRole === role.id && (
            <View style={styles.checkmarkContainer}>
              <Ionicons name="checkmark-circle" size={24} color="#6D5FFD" />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const Profile_setup_section2 = (data) => {  
  const { theme, updateProfileData } = useContext(ThemeContext);
  const phoneInput = useRef(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    nickName: '',
    email: data.email,
    phone: '',
    countryCode: '',
    role: '',
    camp: '507f1f77bcf86cd799439011',
    userId: data.userId,
  });

  const [touchedFields, setTouchedFields] = useState({
    first_name: false,
    last_name: false,
    phone: false,
    role: true
  });

  const [errors, setErrors] = useState({
    first_name: false,
    last_name: false,
    phone: false,
    role: false
  });

  useEffect(() => {
    const newErrors = {
      first_name: touchedFields.first_name && !formData.first_name,
      last_name: touchedFields.last_name && !formData.last_name,
      phone: touchedFields.phone && (!formData.phone || formData.phone.trim() === ''),
      role: touchedFields.role && !formData.role
    };

    setErrors(newErrors);
  }, [formData, touchedFields]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (!touchedFields[field]) {
      setTouchedFields({ ...touchedFields, [field]: true });
    }
  };

  const handleRoleSelect = (role) => {
    handleInputChange('role', role);
    setTouchedFields({ ...touchedFields, role: true });
  };

  const handleInputBlur = (field) => {
    setTouchedFields({ ...touchedFields, [field]: true });
  };

  const showToast = (message, type = 'error') => {
    Toast.show({
      type: type,
      text1: 'Attention',
      text2: message,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 70,
      props: {
        backgroundColor: theme.log,
        textColor: theme.background,
      }
    });
  };

  const validateForm = () => {
    setTouchedFields({
      first_name: true,
      last_name: true,
      phone: true,
      role: true
    });

    const newErrors = {
      first_name: !formData.first_name,
      last_name: !formData.last_name,
      phone: !formData.phone || formData.phone.trim() === '',
      role: !formData.role
    };

    setErrors(newErrors);

    let errorMsg = "";
    if (newErrors.first_name || newErrors.last_name) {
      errorMsg = 'Veuillez saisir votre prénom et nom.';
    } else if (newErrors.phone) {
      errorMsg = 'Veuillez saisir un numéro de téléphone.';
    } else if (newErrors.role) {
      errorMsg = 'Veuillez sélectionner un type d\'utilisateur.';
    }

    if (errorMsg) {
      showToast(errorMsg);
      return false;
    }

    return true;
  };

  const handleContinue = async () => {
    if (validateForm()) {
      const fullName = `${formData.first_name} ${formData.last_name}`;
      Toast.show({
        type: 'success',
        text1: 'Profil mis à jour',
        text2: `Profil ${formData.role === 'parent' ? 'Parent' : 
               formData.role === 'admin' ? 'Administrateur' : 
               formData.role === 'exploitant' ? 'Exploitant' : ''} sélectionné`,
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 70,
      });

      console.log("ff",{
        userId: formData.userId,
        fullName: fullName,
        email: formData.email,
        phoneNumber: formData.phone,
        first_name: formData.first_name,
        last_name: formData.last_name,
        nickName: formData.nickName,
        countryCode: formData.countryCode,
        role: formData.role,
        lastUpdated: new Date().toISOString(),
        camp: formData.camp
      });
      const response = await registerUser({
        userId: formData.userId,
        fullName: fullName,
        email: formData.email,
        phoneNumber: formData.phone,
        first_name: formData.first_name,
        last_name: formData.last_name,
        nickName: formData.nickName,
        countryCode: formData.countryCode,
        role: formData.role,
        lastUpdated: new Date().toISOString(),
        camp: formData.camp
      });
      if (response.status == "success") {
        router.push('/login');
      }else{
        console.log("responsess error", response);
      }
      
      
      // updateProfileData({
      //   fullName: fullName,
      //   email: formData.email,
      //   phoneNumber: formData.phone,
      //   first_name: formData.first_name,
      //   last_name: formData.last_name,
      //   nickName: formData.nickName,
      //   countryCode: formData.countryCode,
      //   role: formData.role,
      //   lastUpdated: new Date().toISOString(),
      // });
    }
  };

  const RequiredLabel = ({ text }) => (
    <View style={styles.labelContainer}>
      <Text style={[styles.label, { color: theme.color }]}>{text}</Text>
      <Text style={[styles.asterisk, { color: theme.log }]}>*</Text>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.input_container}>
          <View style={styles.form_section}>
            <RequiredLabel text="Nom" />
            {errors.last_name && (
              <Text style={[styles.errorText, { color: theme.log }]}>Ce champ est obligatoire</Text>
            )}
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.color,
                  borderColor: theme.bordercolor,
                  backgroundColor: errors.last_name ? theme.background2 : theme.cardbg,
                }
              ]}
              placeholder="Votre nom"
              placeholderTextColor={theme.color3}
              value={formData.last_name}
              onChangeText={(text) => handleInputChange('last_name', text)}
              onBlur={() => handleInputBlur('last_name')}
            />
          </View>

          <View style={styles.form_section}>
            <RequiredLabel text="Prénom" />
            {errors.first_name && (
              <Text style={[styles.errorText, { color: theme.log }]}>Ce champ est obligatoire</Text>
            )}
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.color,
                  borderColor: theme.bordercolor,
                  backgroundColor: errors.first_name ? theme.background2 : theme.cardbg,
                }
              ]}
              placeholder="Votre prénom"
              placeholderTextColor={theme.color3}
              value={formData.first_name}
              onChangeText={(text) => handleInputChange('first_name', text)}
              onBlur={() => handleInputBlur('first_name')}
            />
          </View>
                {/* fazet il telifoun */}
          <View style={styles.form_section}>
            <RequiredLabel text="Téléphone" />
            {errors.phone && (
              <Text style={[styles.errorText, { color: theme.log }]}>Ce champ est obligatoire</Text>
            )}
            <CustomPhoneInput
              ref={phoneInput}
              defaultValue={formData.phone}
              defaultCode="CH"
              onChangeText={(text) => handleInputChange('phone', text)}
              onChangeFormattedText={(text) => {
                const countryCode = phoneInput.current?.getCountryCode();
                if (countryCode) {
                  handleInputChange('countryCode', `+${countryCode}`);
                }
              }}
              containerStyle={[styles.phoneInputContainer, {
                borderColor: theme.bordercolor,
                backgroundColor: theme.cardbg,
              }]}
              textContainerStyle={[styles.phoneInputTextContainer, { backgroundColor: theme.cardbg }]}
              textInputStyle={[styles.phoneInputText, { color: theme.color }]}
              codeTextStyle={{ color: theme.color }}
              textInputProps={{
                placeholderTextColor: theme.color3,
                onBlur: () => handleInputBlur('phone'),
              }}
              flagButtonStyle={{ backgroundColor: theme.background }}
              hasError={errors.phone}
              theme={theme}
            />
          </View>

          <View style={styles.form_section}>
            <RequiredLabel text="Choisissez votre profil" />
            <RoleSelector
              selectedRole={formData.role}
              onRoleSelect={handleRoleSelect}
              theme={theme}
              hasError={errors.role}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button buttonText="Continuer" onPress={handleContinue} />
        </View>
      </View>
    </ScrollView>
  );
};

export default Profile_setup_section2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    minHeight: height * 0.85,
    paddingBottom: 100,
  },
  input_container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  form_section: {
    marginBottom: 30,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
  },
  asterisk: {
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
    marginLeft: 5,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 5,
  },
  input: {
    height: 60,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 20,
    fontFamily: 'Montserrat_500Medium',
    fontSize: 16,
  },
  inputError: {
    borderWidth: 2,
  },
  phoneInputContainer: {
    width: '100%',
    height: 60,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneInputTextContainer: {
    paddingVertical: 0,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  phoneInputText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 16,
    height: 60,
  },
  roleSelectionContainer: {
    width: '100%',
    marginBottom: 20,
  },
  roleCard: {
    borderRadius: 14,
    marginBottom: 15,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  roleCardContent: {
    flex: 1,
    flexDirection: 'column',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    opacity: 0.8,
  },
  checkmarkContainer: {
    padding: 6,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 20,
  }
});