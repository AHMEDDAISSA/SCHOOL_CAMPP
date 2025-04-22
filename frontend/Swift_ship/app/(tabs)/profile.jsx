import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Switch, Modal, StatusBar } from 'react-native';
import React, { useContext, useState } from 'react';
import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import Search from "../../assets/images/search2.svg";
import ThemeContext from '../../theme/ThemeContext';
import { router } from "expo-router";
import Profile_section2 from '../../components/Profile_section/Profile_section2';
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat';

const Profile = () => {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  const back = () => {
    router.push('home');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={back}>
          {darkMode ? <Dark_back /> : <Back />}
        </TouchableOpacity>
        <Text style={[styles.heading, { color: theme.color }]}>Profile</Text>
        <Search />
      </View>
      <Profile_section2 />
    </View>
  )
}

export default Profile;

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: {
    fontSize: 24,
    lineHeight: 34,
    fontFamily: 'Montserrat_700Bold',
    color: '#121212',
    textTransform: 'capitalize',
  },
  
});
