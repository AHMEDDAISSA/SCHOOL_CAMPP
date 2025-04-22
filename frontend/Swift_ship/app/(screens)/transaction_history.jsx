import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React, { useContext } from 'react';
import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import Transaction_history_section2 from '../../components/Transaction_history/Transaction_history_section2';
import ThemeContext from '../../theme/ThemeContext';
import { router, Link } from "expo-router";

const Transaction_history = () => {
    const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => { router.push('home') }}>
                    {darkMode ? <Dark_back /> : <Back />}
                </TouchableOpacity>
                <Text style={[styles.heading, {color:theme.color}]}>Transaction History</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Transaction_history_section2 />
            </ScrollView>
        </View>
    )
}

export default Transaction_history;

const styles = StyleSheet.create({
    container: {
        paddingTop: 50,
        paddingHorizontal: 20,
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 40,
    },
    heading: {
        fontSize: 20,
        lineHeight: 24,
        fontFamily: 'Montserrat_700Bold',
        color: '#39335E',
        textTransform: 'capitalize',
    }
})