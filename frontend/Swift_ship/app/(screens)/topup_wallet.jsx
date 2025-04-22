import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import React, {useContext, useState} from 'react';
import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import { Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import Otp from '../../components/OTP/Otp';
import Button from '../../components/Button/Button';
import Topup_wallet_section2 from '../../components/Topup_wallet/Topup_wallet_section2';
import { router, Link } from "expo-router";
import ThemeContext from '../../theme/ThemeContext';

const Topup_wallet = () => {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
    const [modalVisible8, setModalVisible8] = useState(false);
    const openModal8 = () => {
        setTimeout(() => setModalVisible8(true), 300);
    };
    const closeModal8 = () => setModalVisible8(false);
  return (
    <View style={[styles.container, {backgroundColor:theme.background}]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {router.push('(screens)/pay_method')}}>
       {darkMode? <Dark_back /> : <Back />}
        </TouchableOpacity>
        <Text style={[styles.heading, {color:theme.color}]}>Top up Wallet</Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.text, {color:theme.color}]}>Enter your PIN to confirm top up</Text>
        <Otp />
      </View>
      <Button buttonText="Continue" onPress={openModal8} />
      <Topup_wallet_section2 
      modalVisible8={modalVisible8}
      closeModal8={closeModal8}
      />
    </View>
  )
}

export default Topup_wallet;

const styles = StyleSheet.create({
    container: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 250,
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
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '98%',
    },
    text: {
        fontSize: 16,
        lineHeight: 20,
        fontFamily: 'Montserrat_500Medium',
        color: '#39335E',
        textAlign: 'center',
    }
})