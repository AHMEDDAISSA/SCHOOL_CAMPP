import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '../theme/ThemeContext';
import { MessageProvider } from '../message_context';
// Import Toast and BaseToast explicitly
import Toast, { BaseToast } from 'react-native-toast-message';

// Updated toastConfig to use BaseToast that's imported directly
const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#2ecc71' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily: 'Montserrat_700Bold',
      }}
      text2Style={{
        fontSize: 13,
        fontFamily: 'Montserrat_500Medium',
      }}
    />
  ),
  error: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#e74c3c' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily: 'Montserrat_700Bold',
      }}
      text2Style={{
        fontSize: 13,
        fontFamily: 'Montserrat_500Medium',
      }}
    />
  ),
};

const Root_layout = () => {
  return (
    <MessageProvider>
      <ThemeProvider>
        <>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name='index' />
            <Stack.Screen name='(auth)' />
            <Stack.Screen name='(tabs)' />
            <Stack.Screen name='(screens)/transaction_history' />
            <Stack.Screen name='(screens)/notification' />
            <Stack.Screen name='(screens)/search_page' />
            <Stack.Screen name='(screens)/track_search' />
            <Stack.Screen name='(screens)/my_wallet' />
            <Stack.Screen name='(screens)/topup' />
            <Stack.Screen name='(screens)/pay_method' />
            <Stack.Screen name='(screens)/topup_wallet' />
            <Stack.Screen name='(screens)/chat_screen' />
            <Stack.Screen name='(screens)/inbox_call' />
            <Stack.Screen name='(screens)/track_order' />
            <Stack.Screen name='(screens)/annonces' />
            <Stack.Screen name='(screens)/publier-annonce' />
            <Stack.Screen name='(screens)/recherche_annonce' />
            <Stack.Screen name='(screens)/annonce/:id' />
            <Stack.Screen name='(screens)/#' /> {/* kanet /abonnement  */}
          </Stack>
          <Toast  />
        </>
      </ThemeProvider>
    </MessageProvider>
  );
}

export default Root_layout;

const styles = StyleSheet.create({});
