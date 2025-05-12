import { StyleSheet } from 'react-native';
import React from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '../theme/ThemeContext';
import { MessageProvider } from '../message_context';
import { AnnonceProvider } from '../contexts/AnnonceContext';
import Toast, { BaseToast } from 'react-native-toast-message';
import { AuthProvider } from '../services/AuthContext';

const toastConfig = {
  success: ({ text1, text2, ...rest }) => (
    <BaseToast
      {...rest}
      style={{ borderLeftColor: '#2ecc71', borderLeftWidth: 5 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1={text1}
      text2={text2}
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
  error: ({ text1, text2, ...rest }) => (
    <BaseToast
      {...rest}
      style={{ borderLeftColor: '#e74c3c', borderLeftWidth: 5 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1={text1}
      text2={text2}
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

const RootLayout = () => {
  return (
    <MessageProvider>
      <AuthProvider>
      <ThemeProvider>
        <AnnonceProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(screens)/transaction_history" />
            <Stack.Screen name="(screens)/notification" />
            <Stack.Screen name="(screens)/search_page" />
            <Stack.Screen name="(screens)/track_search" />
            <Stack.Screen name="(screens)/my_wallet" />
            <Stack.Screen name="(screens)/topup" />
            <Stack.Screen name="(screens)/pay_method" />
            <Stack.Screen name="(screens)/topup_wallet" />
            <Stack.Screen name="(screens)/chat_screen" />
            <Stack.Screen name="(screens)/inbox_call" />
            <Stack.Screen name="(screens)/track_order" />
            <Stack.Screen name="(screens)/annonces" />
            <Stack.Screen name="(screens)/publier-annonce" />
            <Stack.Screen name="(screens)/recherche_annonce" />
            <Stack.Screen name="(screens)/annonce/:id" />
            <Stack.Screen name="(screens)/#" /> {/* kanettt 9ball /abonnement */}
          </Stack>
          <Toast config={toastConfig}/> 
        </AnnonceProvider>
      </ThemeProvider>
      </AuthProvider>
    </MessageProvider>
  );
};

export default RootLayout;

const styles = StyleSheet.create({});