import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
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
import Toast, { BaseToast } from 'react-native-toast-message'; // Ajout de BaseToast
import { API_URL } from '../../services/api';

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
        fontSize: 15, // Correction de la taille (30 était trop grand)
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

const Signup = () => {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  const [serverStatus, setServerStatus] = useState('checking'); 
  const [defaultValues, setDefaultValues] = useState({
    camp: '507f1f77bcf86cd799439011',
    role: 'parent',
  });

  
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const healthResponse = await fetch(`${API_URL}/health`, {
          method: 'GET',
          timeout: 5000,
        }).catch(error => {
          console.error('Erreur lors de la vérification du serveur:', error);
          return { ok: false };
        });
        
        if (healthResponse.ok) {
          setServerStatus('online');
        } else {
          // Essayer un autre endpoint comme alternative
          const altResponse = await fetch(`${API_URL}/user/test`, {
            method: 'GET',
            timeout: 5000,
          }).catch(error => {
            return { ok: false };
          });
          
          setServerStatus(altResponse.ok ? 'online' : 'offline');
        }
      } catch (error) {
        console.error('Erreur de vérification du serveur:', error);
        setServerStatus('offline');
      }
    };
    
    checkServerStatus();
  }, []);

  const back = () => {
    router.push('lets');
  };

  const showToast = (type, text1, text2) => {
    Toast.show({
      type,
      text1,
      text2,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
    });
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <TouchableOpacity onPress={back} style={styles.backButton}>
        {darkMode ? <Dark_back /> : <Back />}
      </TouchableOpacity>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.head_content}>
          <Head />
          <Text style={[styles.heading, {color: theme.color}]}>Créez votre compte !</Text>
          <Text style={[styles.heading_text, {color: theme.color3}]}>
            Inscrivez-vous dès maintenant pour bénéficier de réductions réservées aux membres et de recommandations personnalisées rien que pour vous.
          </Text>
          
        </View>
        
        {/* Passer les props nécessaires au composant d'inscription */}
        <Signup_section2 
          defaultValues={defaultValues}
          serverStatus={serverStatus}
          onToast={showToast}
        />
        
        <View style={styles.bottom_row}>
          <View style={styles.line}></View>
          <Text style={styles.or}>Ou continuez avec</Text>
          <View style={styles.line}></View>
        </View>
        
        <Log_method />
        
        <Text style={styles.bottom_text}>
          Vous avez déjà un compte
          <Link href='/login' style={styles.link}> S'identifier</Link>
        </Text>
      </ScrollView>
      
      <Toast config={toastConfig} />
    </View>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  backButton: {
    marginTop: 10,
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
    marginLeft: 5,
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
});
