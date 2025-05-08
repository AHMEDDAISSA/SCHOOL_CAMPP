import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AdminDashboard from '../app/(screens)/AdminDashboard';
import Toast from 'react-native-toast-message';

export default function AdminPage() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <AdminDashboard />
        <Toast />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});