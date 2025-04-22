import React, { useContext } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';


const Button = ({ buttonText, onPress, backgroundColor, textColor, borderColor, borderRadius }) => {
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          
          backgroundColor: backgroundColor || '#836EFE',
        
          borderColor: borderColor || 'transparent', 

          borderRadius: borderRadius || 8,
        },
      ]}
      onPress={onPress}
    >
       <Text style={[styles.buttonText, { color: textColor || '#ffffff' }]}>
        {typeof buttonText === 'string' ? buttonText : 'Default Text'} {/* Check for valid string */}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 25,
    justifyContent: 'center',
    minWidth: 150,
  },
  buttonText: {
    textTransform: 'capitalize',
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    
  },
});

export default Button;
