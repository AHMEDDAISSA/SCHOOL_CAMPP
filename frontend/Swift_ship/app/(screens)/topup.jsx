import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useContext } from 'react';
import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import Topup_section2 from '../../components/Topup/Topup_section2';
import ThemeContext from '../../theme/ThemeContext';
import { router, Link } from "expo-router";

const Topup = () => {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  return (
    <View style={[styles.container, {backgroundColor:theme.background}]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {router.push('(screens)/my_wallet')}}>
       {darkMode? <Dark_back /> : <Back />}
        </TouchableOpacity>
        <Text style={[styles.heading, {color:theme.color}]}>Top Up Wallet</Text>
      </View>
      <Text style={[styles.head_text,{color:theme.color}]}>Select the amount of top up</Text>
      <Topup_section2 />
    </View>
  )
}

export default Topup;

const styles = StyleSheet.create({
    container: {
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 60,
    },
    heading: {
        fontSize: 20,
        lineHeight: 24,
        fontFamily: 'Montserrat_700Bold',
        color: '#39335E',
        textTransform: 'capitalize',
    },
    head_text:{
        fontSize: 14,
        lineHeight: 17,
        fontFamily: 'Montserrat_700Bold',
        color: '#39335E',
        textAlign: 'center',
        marginVertical: 30,
    }
})