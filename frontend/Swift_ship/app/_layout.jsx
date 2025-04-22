import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '../theme/ThemeContext';
import { MessageProvider } from '../message_context';

const Root_layout = () => {
  return (
    <MessageProvider>
    <ThemeProvider>
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
      </Stack>
    </ThemeProvider>
    </MessageProvider>
  )
}

export default Root_layout;

const styles = StyleSheet.create({})
