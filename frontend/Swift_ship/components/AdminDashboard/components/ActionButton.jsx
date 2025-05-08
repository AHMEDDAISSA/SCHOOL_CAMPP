import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

// Styles
import styles from '../styles';

const ActionButton = ({ icon, text, color, onPress }) => (
  <TouchableOpacity 
    style={[styles.actionButton, { backgroundColor: color }]}
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityLabel={text}
  >
    {icon}
    <Text style={styles.actionButtonText}>{text}</Text>
  </TouchableOpacity>
);

export default React.memo(ActionButton);