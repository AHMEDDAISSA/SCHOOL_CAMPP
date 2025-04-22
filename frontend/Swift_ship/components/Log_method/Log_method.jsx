import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import React, { useContext } from 'react'
import { log_method } from '../Data/Data';
import { Montserrat_400Regular, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import Button from "../../components/Button/Button";
import ThemeContext from '../../theme/ThemeContext';

const Log_method = () => {
    const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  return (
    <View>
      <View style={styles.stack_container}>
            {
                log_method.map((d) => (
                    <TouchableOpacity style={[styles.stack, {backgroundColor:theme.cardbg2}]} key={d.id}>
                        {d.icon}
                        <Text style={[styles.text, {color:theme.color}]}>{d.text}</Text>
                    </TouchableOpacity>
                ))
            }
      </View>
    </View>
  )
}

export default Log_method;

const styles = StyleSheet.create({
    stack_container: {
        gap: 12,
    },
    stack: {
        flexDirection:'row',
        alignItems: 'center',
        gap: 50,
        paddingVertical: 12,
        paddingHorizontal: 19,
        backgroundColor: '#F6F6F6',
        borderRadius: 10,
    },
    text: {
        fontSize: 14,
        lineHeight: 26,
        fontFamily: 'Montserrat_500Medium',
        color: '#39335E',
    },
})