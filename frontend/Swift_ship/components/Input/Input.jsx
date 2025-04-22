import { StyleSheet, Text, View, TextInput } from 'react-native';
import React, { useContext } from 'react';
import ThemeContext from '../../theme/ThemeContext';
import { SourceSansPro_700Bold } from '@expo-google-fonts/source-sans-pro';

const Input = ({
  label,
  placeholder,
  keyboardType,
  borderRadius,
  borderColor,
  Icon,
  value,
  onChangeText,
}) => {
  const { theme, darkMode } = useContext(ThemeContext);

  return (
    <View style={styles.inputBox}>
      <Text style={[styles.label, { color: theme.color }]}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            {
              color: theme.color,
              borderRadius: borderRadius || 6,
              borderColor: borderColor || 'transparent',
              backgroundColor: theme.card,
            },
          ]}
          placeholderTextColor={darkMode ? '#ffffff' : '#808080'}
          placeholder={placeholder}
          keyboardType={keyboardType}
          value={value}
          onChangeText={onChangeText}
        />
        {Icon && <Icon style={styles.icon} />}
      </View>
    </View>
  );
};

export default Input;

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
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderWidth: 1,
    minWidth: 140,
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    left: 10,
    bottom: 17,
  }
});
