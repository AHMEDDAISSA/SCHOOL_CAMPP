import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React, { useContext } from 'react';
import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import My_wallet_section2 from '../../components/My_Wallet/My_wallet_section2/My_wallet_section2';
import My_wallet_section3 from '../../components/My_Wallet/My_wallet_section3/My_wallet_section3';
import ThemeContext from '../../theme/ThemeContext';
import { router, Link } from "expo-router";

const My_wallet = () => {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  return (
    <View style={[styles.container, {backgroundColor:theme.background}]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {router.push('home')}}>
       {darkMode? <Dark_back /> : <Back />}
       </TouchableOpacity>
        <Text style={[styles.heading, {color:theme.color}]}>my wallet</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
      <My_wallet_section2 />
      <My_wallet_section3 />
      </ScrollView>
    </View>
  )
}

export default My_wallet;

const styles = StyleSheet.create({
    container: {
        paddingTop: 50,
        paddingHorizontal: 20,
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 80,
    },
    heading: {
        fontSize: 20,
        lineHeight: 24,
        fontFamily: 'Montserrat_700Bold',
        color: '#39335E',
        textTransform: 'capitalize',
    }
})