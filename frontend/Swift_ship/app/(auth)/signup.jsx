import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React, { useContext } from 'react';
import Head from "../../assets/images/sch.svg";
import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import { Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import Login_section2 from '../../components/Login/Login_section2/Login_section2';
import Button from '../../components/Button/Button';
import { router, Link } from "expo-router";
import Log_method from '../../components/Log_method/Log_method';
import Signup_section2 from '../../components/Signup/Signup_section2/Signup_section2';
import ThemeContext from '../../theme/ThemeContext';
import Toast from 'react-native-toast-message';



const toastConfig = {
  success: ({ text1, text2, ...rest }) => (
    <BaseToast
      {...rest}
      style={{ borderLeftColor: '#2ecc71', borderLeftWidth: 5 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1={text1}
      text2={text2}
      text1Style={{
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily: 'Montserrat_700Bold',
      }}
      text2Style={{
        fontSize: 13,
        fontFamily: 'Montserrat_500Medium',
      }}
    />
  ),
  error: ({ text1, text2, ...rest }) => (
    <BaseToast
      {...rest}
      style={{ borderLeftColor: '#e74c3c', borderLeftWidth: 5 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1={text1}
      text2={text2}
      text1Style={{
        fontSize: 30,
        fontWeight: 'bold',
        fontFamily: 'Montserrat_700Bold',
      }}
      text2Style={{
        fontSize: 13,
        fontFamily: 'Montserrat_500Medium',
      }}
    />
  ),
};

const signup = () => {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  const back = () => {
    router.push('lets');
  };
  return (
    <View style={[styles.container, {backgroundColor:theme.background}]}>
      <TouchableOpacity onPress={back}>
      {darkMode? <Dark_back /> : <Back />}
      </TouchableOpacity>
      <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.head_content}>
        <Head />
        <Text style={[styles.heading, {color:theme.color}]}>Créez votre compte ! </Text>
        <Text style={[styles.heading_text, {color:theme.color3}]}>Inscrivez-vous dès maintenant pour bénéficier de réductions réservées aux membres et de recommandations personnalisées rien que pour vous.</Text>
      </View>
      <Signup_section2 />
      <View style={styles.bottom_row}>
        <View style={styles.line}></View>
        <Text style={styles.or}>Ou continuez avec</Text>
        <View style={styles.line}></View>
      </View>
      <Log_method />
      <Text style={styles.bottom_text}>Vous avez déjà un compte<Link href='/login' style={styles.link}> S'identifier</Link></Text>
      </ScrollView>
      <Toast/>
    </View>
  )
}

export default signup;

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  head_content: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },
  heading: {
    fontSize: 24,
    lineHeight: 34,
    fontFamily: 'Montserrat_700Bold',
    color: '#39335E',
    textTransform: 'capitalize',
    textAlign: 'center',
    marginTop: 20,
  },
  heading_text: {
    fontSize: 12,
    lineHeight: 24,
    fontFamily: 'Montserrat_500Medium',
    color: '#727272',
    textAlign: 'center',
  },
  bottom_text: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 24,
    fontFamily: 'Montserrat_400Regular',
    color: '#727272',
    marginVertical: 30,
    paddingBottom: 20,
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
    width: '35%',
    paddingTop: 2,
},
or: {
    fontSize: 12,
    lineHeight: 15,
    fontFamily: 'Montserrat_400Regular',
    color: '#9C9C9C',
}
})