import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useContext } from 'react';
import Profile from "../../../assets/images/stack_profile.svg";
import Star from "../../../assets/images/star.svg";
import Chat from "../../../assets/images/chat_icon.svg";
import Phone from "../../../assets/images/phone4.svg";
import { Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import Track_order_section4 from '../Track_order_section4/Track_order_section4';
import ThemeContext from '../../../theme/ThemeContext';

const Track_order_section3 = () => {
    const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  return (
    <View>
      <TouchableOpacity style={styles.row}>
        <View style={styles.row_left}>
        <Profile />
        <View style={styles.content}>
            <Text style={[styles.name, {color:theme.color}]}>Brooklyn Simmons</Text>
            <View style={styles.bottom}>
                <Star />
                <Text style={[styles.rating, {color:theme.color3}]}>4.7</Text>
            </View>
        </View>
        </View>
        <View style={styles.right}>
            <Chat />
            <Phone />
        </View>
      </TouchableOpacity>
      <Track_order_section4 />
    </View>
  )
}

export default Track_order_section3;

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginVertical: 30,
    },
    row_left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    content: {
       gap: 2,
    },
    name: {
        fontSize: 16,
        lineHeight: 19,
        fontFamily: 'Montserrat_700Bold',
        color: '#39335E',
    },
    bottom: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    rating: {
        fontSize: 12,
        lineHeight: 14,
        fontFamily: 'Montserrat_500Medium',
        color: '#727272',
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    }
})