import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import React, { useContext } from 'react';
// import Phone from "../../../assets/images/phone.svg";
// import { call_data } from '../../Data/Data';
import { Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import ThemeContext from '../../../theme/ThemeContext';

const Inbox_section2 = () => {
    const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  return (
    <View>
      {/* <View style={styles.stack_container}>
        {
            call_data.map((d) => (
                <TouchableOpacity style={[styles.stack, {backgroundColor:theme.cardbg}]} key={d.id}>
                    <View style={styles.stack_left}>
                        <Image style={styles.image} source={d.image} />
                        <View style={styles.content}>
                            <Text style={[styles.name, {color:theme.color}]}>{d.name}</Text>
                            <Text style={[styles.type, {color:theme.color}]}>{d.call_type}  |  {d.date}</Text>
                        </View>
                    </View>
                    <Phone />
                </TouchableOpacity>
            ))
        }
      </View> */}
    </View>
  )
}

export default Inbox_section2;

const styles = StyleSheet.create({
    stack_container: {
        gap: 16,
        marginVertical: 30,
    },
    stack: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 10,
        backgroundColor: '#f6f6f6',
    },
    stack_left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    image: {
        width: 60,
        height: 60,
    },
    name: {
        fontSize: 16,
        lineHeight: 19,
        fontFamily: 'Montserrat_700Bold',
        color: '#39335E',
        textTransform: 'capitalize',
    },
    type: {
        fontSize: 14,
        lineHeight: 17,
        fontFamily: 'Montserrat_500Medium',
        color: '#39335E',
    }
})