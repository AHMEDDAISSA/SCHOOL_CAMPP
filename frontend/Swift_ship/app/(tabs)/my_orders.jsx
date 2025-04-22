import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useContext } from 'react';
import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import Input from '../../components/Input/Input';
import Filter from '../../assets/images/filter.svg';
import Search from "../../assets/images/search2.svg";
import My_orders_section2 from '../../components/My_orders/My_orders_section2/My_orders_section2';
import { router } from "expo-router";
import ThemeContext from '../../theme/ThemeContext';

const My_orders = () => {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  const back = () => {
    router.push('home');
  };
  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <View style={styles.header}>
      <TouchableOpacity onPress={back}>
          {darkMode ? <Dark_back /> : <Back />}
        </TouchableOpacity>
        <Text style={[styles.heading, {color:theme.color}]}> Ma commande</Text>
      </View>
      <TouchableOpacity style={[styles.input_container, {backgroundColor:theme.cardbg2}]} onPress={() => router.push('(screens)/track_search')}>
        <Search style={styles.search} />
        <Text style={styles.placeholder}>Entrez le numéro d'identification du suivi </Text>
        <Filter style={styles.filter} />
      </TouchableOpacity>
      <My_orders_section2 />
    </View>
  )
}

export default My_orders;

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
  },
  input_container: {
    position: 'relative',
    marginTop: 30,
    borderRadius: 10,
    backgroundColor: '#F5F4F8',
    paddingVertical: 12,
    paddingHorizontal: 36,
    minHeight: 60,
    justifyContent: 'center',
  },
  search: {
    position: 'absolute',
    left: 15,
    bottom: 20,
  },
  filter: {
    position: 'absolute',
    bottom: 20,
    right: 10,
  },
  placeholder: {
    marginLeft: 40,
    color: '#A8A8A8',
  },
})
