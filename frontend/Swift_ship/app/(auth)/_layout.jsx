import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import {Stack} from "expo-router";

const Authlayout = () => {
  return (
    <Stack>
        <Stack.Screen name='lets' options={{headerShown: false}} />
        <Stack.Screen name='login' options={{headerShown: false}} />
        <Stack.Screen name='signup' options={{headerShown: false}} />
        <Stack.Screen name='profile_setup' options={{headerShown: false}} />
        <Stack.Screen name='address' options={{headerShown: false}} />
    </Stack>
  )
}

export default Authlayout;

const styles = StyleSheet.create({})