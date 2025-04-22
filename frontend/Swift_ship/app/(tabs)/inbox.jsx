import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import React, { useContext, useState } from 'react';
import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import Search from "../../assets/images/search2.svg";
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { inbox_tab_data } from '../../components/Data/Data';
import { SourceSansPro_700Bold } from '@expo-google-fonts/source-sans-pro';
import Inbox_section2 from '../../components/Inbox/Inbox_section2/Inbox_section2';
import Inbox_section3 from '../../components/Inbox/Inbox_section3/Inbox_section3';
import ThemeContext from '../../theme/ThemeContext';
import { router, Link } from "expo-router";

const Inbox = () => {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  const [activetab, setActivetab] =useState(inbox_tab_data[0].id);
  const press = (id) => {
    setActivetab(id);
  }
  const back = () => {
    router.push('/home');
  };
  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <View style={[styles.header]}>
      <TouchableOpacity onPress={back}>
          {darkMode ? <Dark_back /> : <Back />}
        </TouchableOpacity>
        <Text style={[styles.heading, {color:theme.color}]}>Inbox</Text>
        <Search />
      </View>
      <View style={styles.tab_container}>
        {
          inbox_tab_data.map((d) => (
            <TouchableOpacity style={[styles.tab, activetab === d.id && styles.activetab]} key={d.id} onPress={() => {press(d.id)}}>
              <Text style={[styles.tab_text, activetab === d.id && styles.activetab_text]}>{d.text}</Text>
            </TouchableOpacity>
          ))
        }
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
      {activetab === 1 ? <Inbox_section3 /> : <Inbox_section2 />}
      </ScrollView>
    </View>
  )
}

export default Inbox;

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: 'Montserrat_700Bold',
    color: '#39335E',
    textTransform: 'capitalize',
  },
  tab_container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
    gap: 20,
  },
  tab: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#836EFE',
    paddingVertical: 10,
    paddingHorizontal: 25,
    minWidth: 150,
    maxWidth: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tab_text: {
    fontSize: 18,
    lineHeight: 28,
    fontFamily: 'SourceSansPro_700Bold',
    color: '#836EFE',
    textTransform: 'capitalize',
  },
  activetab: {
    backgroundColor: '#836EFE',
  },
  activetab_text: {
    color: '#ffffff',
  }
})