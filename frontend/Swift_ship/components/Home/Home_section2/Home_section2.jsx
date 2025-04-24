import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React, { useContext } from 'react'
import Input from '../../Input/Input';
import Search from "../../../assets/images/search3.svg";
import Dark_search from "../../../assets/images/dark_search.svg";
import Filter from "../../../assets/images/filter.svg";
import Card from "../../../assets/images/card.png";
import Master from "../../../assets/images/master.png";
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { router, Link } from "expo-router";
import ThemeContext from '../../../theme/ThemeContext';

const Home_section2 = () => {
    const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  return (
    <View>
        {/* <TouchableOpacity style={[styles.input_container, {backgroundColor:theme.cardbg2}]} onPress={() => router.push('(screens)/search_page')}>
        {darkMode? <Dark_search style={styles.search} /> : <Search style={styles.search} />}
        <Text style={[styles.placeholder, {color:theme.color}]}>Entrez le numéro d'identification du suivi</Text>
        <Filter style={styles.filter} />
      </TouchableOpacity>
        <TouchableOpacity style={styles.card_container} onPress={() => {router.push('(screens)/my_wallet')}}>
            <Image source={Card} style={styles.card} alt='image' />
            <View style={styles.top_row}>
                <View style={styles.top_row_left}>
                    <Text style={styles.heading}>Solde actuel</Text>
                    <Text style={styles.balance}>€5,750,202</Text>
                </View>
                <Image style={styles.master} source={Master} />
            </View>
            <View style={styles.bottom_row}>
                <Text style={styles.card_no}>5282 3456 7890 1289</Text>
                <Text style={styles.date}>09/25</Text>
            </View>
        </TouchableOpacity> */}
    </View>
  )
}

export default Home_section2;

const styles = StyleSheet.create({
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
    card_container: {
        marginTop: 20,
        marginBottom: 30,
    },
    card: {
        position: 'relative',
        height: 190,
        borderRadius: 20,
    },
    top_row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'absolute',
        top: 30,
        left: 30,
        width: '80%',
    },
    top_row_left: {

    },
    heading: {
        fontSize: 17,
        lineHeight: 21,
        fontFamily: 'Montserrat_400Regular',
        color: '#FFFFFF',
        textTransform: 'capitalize',
    },
    balance: {
        fontSize: 30,
        lineHeight: 35,
        fontFamily: 'Montserrat_700Bold',
        color: '#FFFFFF',
    },
    master: {
        width: 55,
        height: 44,
        right:20,
        top:10,
    },
    bottom_row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '80%',
        position: 'absolute',
        bottom: 30,
        left: 30,
    },
    card_no: {
        fontSize: 17,
        lineHeight: 21,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#FFFFFF',
    },
    date: {
        fontSize: 17,
        lineHeight: 21,
        fontFamily: 'Montserrat_500Medium',
        color: '#FFFFFF',
        right:20
    }
})