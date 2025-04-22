import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useState, useContext } from 'react';
import ThemeContext from '../../theme/ThemeContext';

const GenderDropdown = ({
  label,
  placeholder,
  borderRadius,
  backgroundColor,
  borderColor,
}) => {
  const { theme, darkMode } = useContext(ThemeContext);
  const [selectedGender, setSelectedGender] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const selectGender = (gender) => {
    setSelectedGender(gender);
    setDropdownVisible(false);
  };

  return (
    <View style={styles.inputBox}>
      {label && <Text style={[styles.label, { color: theme.color }]}>{label}</Text>}
      <View style={styles.inputWrapper}>
        <TouchableOpacity
          style={[
            styles.input,
            {
              color: theme.color,
              borderRadius: borderRadius || 6,
              backgroundColor:theme.cardbg2,
              borderColor: borderColor || 'transparent',
            },
          ]}
          onPress={toggleDropdown}
        >
          <Text style={{ color: selectedGender ? theme.color : (darkMode ? '#ffffff' : '#808080') }}>
            {selectedGender || placeholder}
          </Text>
        </TouchableOpacity>
        {dropdownVisible && (
          <View style={styles.dropdown}>
            {['Male', 'Female', 'Other'].map((gender, index) => (
              <TouchableOpacity key={index} style={styles.dropdownItem} onPress={() => selectGender(gender)}>
                <Text style={styles.dropdownItemText}>{gender}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default GenderDropdown;

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
  input: {
    paddingVertical: 16,
    paddingHorizontal: 35,
    borderWidth: 1,
    minWidth: 140,
    marginVertical: 20,
  },
  dropdown: {
    position: 'absolute',
    top: '60%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 10,
  },
  dropdownItemText: {
    fontSize: 16,
  },
});
