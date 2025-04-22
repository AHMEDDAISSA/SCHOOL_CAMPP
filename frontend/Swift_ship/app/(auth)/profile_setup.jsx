import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import React, { useContext } from 'react';
import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import Profile from "../../assets/images/profil33.png";
import Edit from "../../assets/images/Edit.svg";
import Profile_setup_section2 from '../../components/Profile_setup/Profile_setup_section2';
import ThemeContext from '../../theme/ThemeContext';
import { router, Link } from "expo-router";

const profile_setup = () => {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  const back = () => {
    router.push('signup');
  };
  return (
    <View style={[styles.container, {backgroundColor:theme.background}]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={back}>
       {darkMode? <Dark_back /> : <Back />}
       </TouchableOpacity>
        <Text style={[styles.heading, {color:theme.color}]}>Fill Your Profile</Text>
      </View>
      <View style={styles.image_container}>
        <Image style={styles.image} source={Profile} alt='image' />
        <Edit style={styles.edit} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
      <Profile_setup_section2 />
      </ScrollView>
    </View>
  )
}

export default profile_setup;

const styles = StyleSheet.create({
    container: {
        paddingTop: 50,
        paddingHorizontal: 20,
        flex: 1,
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
    image_container: {
        alignItems:'center',
        justifyContent: 'center',
        marginVertical: 30,
    },
    image: {
        position: 'relative',
        width: 140,
        height: 140,
    },
    edit: {
        position: 'absolute',
        right: 100,
        bottom: 20,
    }
})