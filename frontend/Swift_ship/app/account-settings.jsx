import React from 'react';
import { View, StyleSheet } from 'react-native';
import Settings from '../components/settingss/account-settings'; 

export default function SettingScreen() {
  return (
    <View style={styles.container}>
      <Settings />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
