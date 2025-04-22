import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import React, { useContext } from 'react';
import Profile_img from "../../assets/images/profil33.png";
import Notification from "../../assets/images/notification.svg";
import Dark_Notification from "../../assets/images/dark_notification.svg";
import { Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import Home_section2 from '../../components/Home/Home_section2/Home_section2';
import Home_section3 from '../../components/Home/Home_section3/Home_section3';
import Home_section4 from '../../components/Home/Home_section4/Home_section4';
import { router, Link } from "expo-router";
import ThemeContext from '../../theme/ThemeContext';

const Home = () => {
    const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  return (
    <View style={[styles.container, {backgroundColor:theme.background}]}>
         <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={darkMode? "light-content" : 'dark-content'}
      />
      <View style={styles.header}>
        <View style={styles.header_left}>
        <Image source={Profile_img} style={styles.profile} alt='image' />
        <View style={styles.content}>
            <Text style={styles.heading_text}>Bienvenue à l’école de La Brillaz! 👋🏻</Text>
            <Text style={[styles.heading, {color:theme.color}]}> Ahmed Aissa</Text>
        </View>
        </View>
        <TouchableOpacity style={styles.notification_box} onPress={() => {router.push('(screens)/notification')}}>
        { darkMode? <Dark_Notification style={styles.notification} /> : <Notification  style={styles.notification} />}
            <TouchableOpacity style={styles.circle} onPress={() => {router.push('(screens)/notification')}} >
                <Text style={styles.notification_count}>3</Text>
            </TouchableOpacity>
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
      <Home_section2 />
      <Home_section3 />
      <Home_section4 />
      </ScrollView>
    </View>
  )
}

export default Home;

const styles = StyleSheet.create({
    container: {
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems:'center',
        justifyContent: 'space-between',
    },
    header_left:{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    profile: {
        width: 65,
        height: 65,
    },
    heading_text: {
        fontSize: 12,
        lineHeight: 14,
        fontFamily: 'Montserrat_500Medium',
        color: '#727272',
        textTransform: 'capitalize',
    },
    heading: {
        fontSize: 18,
        lineHeight: 22,
        fontFamily: 'Montserrat_700Bold',
        color: '#39335E',
        textTransform: 'capitalize',
    },
    notification_box: {

    },
    notification: {
        position:'relative',
    },
    circle: {
        position: 'absolute',
        width: 15,
        height: 15,
        alignItems:'center',
        justifyContent: 'center',
        backgroundColor: '#EB001B',
        borderRadius: 50,
        right: -3,
        top: -3,
    },
    notification_count: {
        fontSize: 8,
        lineHeight: 12,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#FFFFFF',
    }
})