import React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import Settings from '../components/settingss/account-settings';
import Toast from 'react-native-toast-message';

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