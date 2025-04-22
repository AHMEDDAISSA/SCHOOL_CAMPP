import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import React, { useContext } from 'react'
import { Action_data } from '../../Data/Data';
import { Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import ThemeContext from '../../../theme/ThemeContext';

const Home_section3 = () => {
    const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  return (
    <View>
      <View style={styles.tab_container}>
        {
            Action_data.map((d) => (
                <TouchableOpacity style={[styles.tab, {backgroundColor:theme.cardbg}]} key={d.id}>
                    <View style={[styles.icon_box]}>
                        {d.icon}
                    </View>
                    <Text style={[styles.tab_text, {color:theme.color}]}>{d.text}</Text>
                </TouchableOpacity>
            ))
        }
      </View>
    </View>
  )
}

export default Home_section3;

const styles = StyleSheet.create({
    tab_container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    tab: {
        borderRadius: 20,
        backgroundColor:'#F6F6F6',
        paddingVertical: 20,
        paddingHorizontal: 10,
        alignItems: 'center',
        gap: 16,
        minWidth: 140,
        minHeight: 120,
    },
    icon_box: {
        backgroundColor: 'rgba(131, 110, 254, 0.2)',
        borderRadius: 10,
        padding: 10,
    },
    tab_text: {
        fontSize: 14,
        lineHeight: 17,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#39335E',
    }
})