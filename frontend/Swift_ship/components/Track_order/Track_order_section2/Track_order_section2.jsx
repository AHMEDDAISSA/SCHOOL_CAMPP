import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import React, { useContext } from 'react';
import Map from "../../../assets/images/map.png";
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import Track_order_section3 from '../Track_order_section3/Track_order_section3';
import ThemeContext from '../../../theme/ThemeContext';

const Track_order_section2 = () => {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  return (
    <View>
        <View style={[styles.image_container, {backgroundColor:theme.background}]}>
      <Image source={Map} alt='image' style={styles.map} />
      <View style={[styles.modal, {backgroundColor:theme.background}]}>
        
        <Text style={[styles.heading, {color:theme.color}]}>Your package is in the Way</Text>
        <Text style={[styles.time, {color:theme.color3}]}>Arriving at pick up points in 3 mins</Text>
        <Track_order_section3 />
        
      </View>
      </View>
    </View>
  )
}

export default Track_order_section2;

const styles = StyleSheet.create({
    image_container: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    map: {
        borderRadius: 20,
    },
    modal: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
        position: 'absolute',
        padding: 35,
        width: '100%',
        alignItems: 'center',
    },
    heading: {
        fontSize: 20,
        lineHeight: 30,
        color: '#151515',
        fontFamily: 'Montserrat_700Bold',
        textAlign: 'center',
    },
    time: {
        fontSize: 14,
        lineHeight: 24,
        fontFamily: 'Montserrat_400Regular',
        color: '#727272',
    }
})