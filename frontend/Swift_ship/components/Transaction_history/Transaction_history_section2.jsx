import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useContext } from 'react';
import Transaction from "../../assets/images/transaction.svg";
import Dollar from "../../assets/images/dollar.svg";
import { transaction_history } from '../Data/Data';
import { Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import ThemeContext from '../../theme/ThemeContext';

const Transaction_history_section2 = () => {
    const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  return (
    <View style={styles.container}>
      <View style={styles.stack_container}>
        {
            transaction_history.map((d) => (
                <TouchableOpacity style={[styles.stack, {backgroundColor:theme.cardbg}]} key={d.id}>
                    <View style={styles.stack_left}>
                        <View style={styles.border}>
                            {d.Name === "Payment Revers" ? <Dollar /> : <Transaction />}
                        </View>
                        <View style={styles.content}>
                            <Text style={[styles.name, {color:theme.color}]}>{d.Name}</Text>
                            <Text style={[styles.text, {color:theme.color3}]}>{d.text}</Text>
                        </View>
                    </View>
                    <Text style={styles.time}>{d.time}</Text>
                </TouchableOpacity>
            ))
        }
      </View>
    </View>
  )
}

export default Transaction_history_section2

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 20,
    },
    stack_container: {
        gap: 20,
        paddingVertical: 30,
    },
    stack: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 10,
        padding: 15,
        backgroundColor: '#f6f6f6',
    },
    stack_left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    border: {
        borderRadius: 10,
        padding: 8,
        backgroundColor: 'rgba(131, 110, 254, 0.2)',
    },
    name: {
        fontSize: 14,
        lineHeight: 17,
        fontFamily: 'Montserrat_700Bold',
        color: '#39335E',
        textTransform: 'capitalize',
    },
    text: {
        fontSize: 10,
        lineHeight: 12,
        fontFamily: 'Montserrat_400Regular',
        color: '#727272',
        maxWidth: 160,
    },
    time: {
        fontSize: 12,
        lineHeight: 14,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#836EFE',
    }
})