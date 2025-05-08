import React from 'react';
import { View, Text } from 'react-native';

// Styles
import styles from '../styles';

const StatCard = ({ value, label, backgroundColor, valueColor, labelColor }) => (
  <View style={[styles.statCard, { backgroundColor }]}>
    <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: labelColor }]}>{label}</Text>
  </View>
);

export default React.memo(StatCard);