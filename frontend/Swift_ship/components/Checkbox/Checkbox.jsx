// Checkbox.jsx
import React, { useContext } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import ThemeContext from '../../theme/ThemeContext';

const CheckBox = ({ label, checked, onChange }) => {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onChange(!checked)}
    >
      <View style={[styles.checkbox, checked && styles.checked]}>
        {checked && (
          <Ionicons name="checkmark" size={20} color="white" />
        )}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

export default CheckBox;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#BABABA',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginRight: 10,
  },
  checked: {
    backgroundColor: '#007AFF',
  },
  label: {
    fontSize: 12,
    lineHeight: 24,
    fontFamily: 'Montserrat_400Regular',
    color: '#727272',
    maxWidth: '90%',
  },
});
