import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useContext } from 'react';
import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import Track_order_section2 from '../../components/Track_order/Track_order_section2/Track_order_section2';
import ThemeContext from '../../theme/ThemeContext';
import { router, Link } from "expo-router";

const Track_order = () => {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  return (
    <View style={[styles.main_container, {backgroundColor:theme.background}]}>
        <View style={[styles.container, {backgroundColor:theme.background}]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {router.push('my_orders')}}>
           {darkMode? <Dark_back /> : <Back />}
           </TouchableOpacity>
            <Text style={[styles.result, {color:theme.color}]}>Results for <Text style={styles.value}> “VK3728732”</Text></Text>
      </View>
      </View>
      <Track_order_section2 />
    </View>
  )
}

export default Track_order;

const styles = StyleSheet.create({
    container: {
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 30,
    },
    result: {
        fontSize: 16,
        lineHeight: 19,
        fontFamily: 'Montserrat_700Bold',
        color: '#39335E',
        marginVertical: 30,
      },
      value: {
        fontSize: 16,
        lineHeight: 19,
        fontFamily: 'Montserrat_700Bold',
        color: '#836EFE',
      }
})