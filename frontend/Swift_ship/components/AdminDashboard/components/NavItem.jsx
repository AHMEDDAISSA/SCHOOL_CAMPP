import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

// Styles
import styles from '../styles';

const NavItem = ({ icon, label, isActive, onPress, activeColor, inactiveColor }) => (
  <TouchableOpacity 
    style={styles.navItem} 
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="tab"
    accessibilityLabel={label}
    accessibilityState={{ selected: isActive }}
  >
    {icon(isActive ? activeColor : inactiveColor)}
    <Text 
      style={[
        styles.navLabel, 
        { color: isActive ? activeColor : inactiveColor }
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

export default React.memo(NavItem);