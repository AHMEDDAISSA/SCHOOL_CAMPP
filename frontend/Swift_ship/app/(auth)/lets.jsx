import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import React, { useContext } from 'react';
import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import Lets from "../../assets/images/lets_img.png";
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import Log_method from '../../components/Log_method/Log_method';
import { router, Link } from "expo-router";
import Button from '../../components/Button/Button';
import ThemeContext from '../../theme/ThemeContext';

const lets = () => {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <View style={[styles.container, { backgroundColor: theme.background, flex: 1 }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={darkMode ? "light-content" : 'dark-content'}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        <View style={styles.image_container}>
          <Image source={Lets} style={styles.image} alt='image' />
          <Text style={[styles.heading, { color: theme.color }]}>Accédez facilement</Text>
        </View>
        <Log_method />
        <View style={styles.bottom_row}> 
          <View style={styles.line}></View>
          <Text style={styles.or}>ou</Text>
          <View style={styles.line}></View>
         </View>
        <Button buttonText="suivant" onPress={() => { router.push('signup') }} />
        <Text style={[styles.bottom_text, { color: theme.color3 }]}>
        Vous avez déjà un compte ? <Link href='/login' style={styles.link}> S'identifier</Link>
        </Text>
      </ScrollView>
    </View>
  )
}

export default lets;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 50,
  },
  image_container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    marginBottom: 30,
  },
  image: {
    width: 400,
    height: 200,
  },
  heading: {
    fontSize: 34,
    lineHeight: 41,
    fontFamily: 'Montserrat_700Bold',
    color: '#39335E',
    textTransform: 'capitalize',
    marginTop: 40,
    textAlign: 'center',
  },
  bottom_text: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 24,
    fontFamily: 'Montserrat_400Regular',
    color: '#727272',
    marginVertical: 30,
  },
  link: {
    fontFamily: 'Montserrat_700Bold',
    color: '#836EFE',
  },
  bottom_row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 20,
    marginLeft: -20,
    marginVertical: 30,
  },
  line: {
    borderBottomColor: '#9C9C9C',
    borderBottomWidth: 0.5,
    width: '50%',
    paddingTop: 2,
  },
  or: {
    fontSize: 12,
    lineHeight: 15,
    fontFamily: 'Montserrat_400Regular',
    color: '#9C9C9C',
  }
});
