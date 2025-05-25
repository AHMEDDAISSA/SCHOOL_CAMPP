import React from 'react';
import { View, StyleSheet } from 'react-native';
import Support from '../components/support/support'; // Import your existing Support component

export default function SupportScreen() {
  return (
    <View style={styles.container}>
      <Support />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
