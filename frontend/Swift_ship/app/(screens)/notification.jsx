import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import React, { useContext } from 'react';
import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import { Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { notify_data } from '../../components/Data/Data';
import { SourceSansPro_400Regular } from '@expo-google-fonts/source-sans-pro';
import ThemeContext from '../../theme/ThemeContext';
import { router, Link } from "expo-router";

const Notification = () => {
    const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  return (
    <View style={[styles.container, {backgroundColor:theme.background}]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={()=> {router.push('home')}}>
      {darkMode? <Dark_back /> : <Back />}
        </TouchableOpacity>
        <Text style={[styles.heading, {color:theme.color}]}>Notification</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.stack_container}>
        {
            notify_data.map((d) => (
                <TouchableOpacity style={[styles.stack, {backgroundColor:theme.cardbg2}]} key={d.id}>
                    <View style={styles.stack_left}>
                        {d.icon}
                        <View style={styles.content}>
                            <Text style={[styles.name, {color:theme.color}]}>{d.name}</Text>
                            <Text style={[styles.date, {color:theme.color3}]}>{d.date} | {d.time}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.new}>new</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            ))
        }
      </View>
      </ScrollView>
    </View>
  )
}

export default Notification;

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
        textTransform: 'capitalize',
    },
    stack_container: {
        gap: 20,
        marginVertical: 30,
    },
    stack: {
        borderRadius: 10,
        backgroundColor: '#f6f6f6',
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    stack_left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    name: {
        fontSize: 13,
        lineHeight: 17,
        fontFamily: 'Montserrat_700Bold',
        color: '#39335E',
        textTransform: 'capitalize',
    },
    date: {
        fontSize: 10,
        lineHeight: 12,
        fontFamily: 'Montserrat_500Medium',
        color: '#727272',
    },
    button: {
        backgroundColor: '#242424',
        borderRadius: 5,
        paddingVertical: 4,
        paddingHorizontal: 12
    },
    new: {
        fontSize: 10,
        lineHeight: 15,
        fontFamily: 'SourceSansPro_400Regular',
        color: '#ffffff',
        textTransform: 'capitalize',
    },
    content: {
        gap: 5,
    }
})