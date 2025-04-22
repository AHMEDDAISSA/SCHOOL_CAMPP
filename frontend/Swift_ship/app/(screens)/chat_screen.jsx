import { StyleSheet, Text, View, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import React, { useContext } from 'react';
import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import Profile from "../../assets/images/Chat1.svg";
import Call from "../../assets/images/phone2.svg";
import Video from "../../assets/images/Video.svg";
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import Chat_screen_section2 from '../../components/Chat_screen/Chat_screen_section2/Chat_screen_section2';
import Chat_screen_section3 from '../../components/Chat_screen/Chat_screen_section3/Chat_screen_section3';
import { router, Link } from "expo-router";
import ThemeContext from '../../theme/ThemeContext';

const Chat_screen = () => {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  return (
    <View style={[styles.container, {backgroundColor:theme.background}]}>
         <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={darkMode? "light-content" : 'dark-content'}
      />
      <View style={styles.header}>
        <View style={styles.head_left}>
          <TouchableOpacity onPress={() => {router.push('inbox')}}>
         {darkMode? <Dark_back /> : <Back />}
         </TouchableOpacity>
          <Profile />
        </View>
        <Text style={[styles.name, {color:theme.color}]}>Leslie Alexander</Text>
        <View style={styles.head_right}>
          <Call onPress={() => {router.push('(screens)/inbox_call')}}  />
          <Video />
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} >
      <Chat_screen_section2 />
      <Chat_screen_section3 />
      </ScrollView>
    </View>
  )
}

export default Chat_screen;

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
  head_left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 18,
    lineHeight: 20,
    fontFamily: 'Montserrat_700Bold',
    color: '#39335E',
  },
  head_right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  }
})