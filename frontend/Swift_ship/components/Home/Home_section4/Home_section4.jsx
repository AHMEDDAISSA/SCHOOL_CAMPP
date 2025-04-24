import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useContext } from 'react';
import { Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Transaction_data } from '../../Data/Data';
import { router, Link } from "expo-router";
import ThemeContext from '../../../theme/ThemeContext';

const Home_section4 = () => {
    const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <Text style={[styles.heading, {color:theme.color}]}>Transaction History</Text>
        <TouchableOpacity onPress={() => {router.push('(screens)/transaction_history')}}>
        <Text style={styles.see}>see all</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.stack_container}>
        {
            Transaction_data.map((d) => (
                <TouchableOpacity style={[styles.stack, {backgroundColor:theme.cardbg}]} key={d.id}>
                    <View style={styles.stack_left}>
                        <View style={[styles.border]}>
                            {d.icon}
                        </View>
                        <View style={styles.content}>
                            <Text style={[styles.name, {color:theme.color}]}>{d.name}</Text>
                            <Text style={[styles.text, {color:theme.color}]}>{d.text}</Text>
                        </View>
                    </View>
                    <Text style={styles.time}>{d.time}</Text>
                </TouchableOpacity>
            ))
        }
      </View> */}
    </View>
  )
}

export default Home_section4;

const styles = StyleSheet.create({
    container: {
        marginBottom: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 30,
    },
    heading: {
        fontSize: 16,
        lineHeight: 19,
        fontFamily: 'Montserrat_700Bold',
        color: '#39335E',
    },
    see: {
        fontSize: 10,
        lineHeight: 12,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#836EFE',
    },
    stack_container: {
        gap: 16,
        marginVertical: 30,
    },
    stack: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 10,
        backgroundColor: '#f6f6f6',
    },
    stack_left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    border: {
        backgroundColor: 'rgba(131, 110, 254, 0.2)',
        borderRadius: 10,
        padding: 10,
        width: 50,
        height: 50,
    },
    name: {
        fontSize: 14,
        lineHeight: 17,
        fontFamily: 'Montserrat_700Bold',
        color: '#39335E',
    },
    text: {
        fontSize: 10,
        lineHeight: 12,
        fontFamily: 'Montserrat_400Regular',
        color: '#727272',
        maxWidth: '85%',
    },
    time: {
        fontSize: 10,
        lineHeight: 12,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#836EFE',
        marginLeft: -15,
    }
})