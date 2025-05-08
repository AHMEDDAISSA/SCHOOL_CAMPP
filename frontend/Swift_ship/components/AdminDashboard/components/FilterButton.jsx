import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

// Styles
import styles from '../styles';

const FilterButton = ({ label, isActive, onPress }) => (
  <TouchableOpacity 
    style={[
      styles.filterButton, 
      isActive && styles.filterButtonActive
    ]}
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel={`Filtrer par ${label}`}
    accessibilityState={{ selected: isActive }}
  >
    <Text style={[
      styles.filterText,
      isActive && styles.filterTextActive
    ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default React.memo(FilterButton);