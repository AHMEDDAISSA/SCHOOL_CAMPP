import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import React, { useContext } from 'react';
import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import { Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import Map from "../../assets/images/map.png";
import Button from '../../components/Button/Button';
import Location from "../../assets/images/location.svg";
import Location2 from "../../assets/images/location2.svg";
import Search from "../../assets/images/search2.svg";
import Input from '../../components/Input/Input';
import ThemeContext from '../../theme/ThemeContext';
import { router, Link } from "expo-router";

const Address = () => {
    const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
    const back = () => {
        router.push('profile_setup');
    };
  return (
    <View style={[styles.container, {backgroundColor:theme.background}]}>
    <View style={styles.header}>
        <TouchableOpacity onPress={back}>
       {darkMode? <Dark_back /> : <Back />}
       </TouchableOpacity>
        <Text style={[styles.heading, {color:theme.color}]}>Pin You Location</Text>
    </View>
    <View style={styles.image_container}>
        <TouchableOpacity style={styles.content}>
            <View style={styles.location_row}>
                <Location />
                <View style={styles.column}>
                    <Text style={styles.head_text}>Location</Text>
                    <Text style={styles.head_text2}>New York, United States</Text>
                </View>
            </View>
            <Input placeholder="Search" Icon={Search} />
        </TouchableOpacity>
        <Image source={Map} alt='image'  style={styles.map} />
        <Location2 style={styles.location2} />
    </View>
    <View style={styles.button_box}>
    <Button buttonText="continue" onPress={() => {router.push('home')}} />
    </View>
    </View>
  )
}

export default Address;

const styles = StyleSheet.create({
    container: {
        paddingTop: 50,
        paddingHorizontal: 20,
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 50,
    },
    heading: {
        fontSize: 20,
        lineHeight: 24,
        fontFamily: 'Montserrat_700Bold',
        color: '#39335E',
    },
    image_container: {
        alignItems: 'center',
        marginTop: 30,
    },
    map: {
        position:'relative',
        width: '100%',
        borderRadius: 20,
        height: '90%',
    },
    location2: {
        position: 'absolute',
        left: '45%',
        bottom: '50%',
    },
    button_box: {
        position: 'absolute',
        bottom: 30,
        width: '100%',
        marginHorizontal: 20,
    },
    content: {
        position: 'absolute',
        top: 50,
        left: "5%",
        padding: 20,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 100,
        width: '90%',
    },
    location_row: {
        flexDirection: 'row',
        alignItems:'center',
        gap: 20,
    },
    head_text: {
        fontSize: 12,
        lineHeight: 24,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#39335E',
        textTransform: 'capitalize',
    },
    head_text2: {
        fontSize: 14,
        lineHeight: 24,
        fontFamily: 'Montserrat_700Bold',
        color: '#836EFE',
    }
})