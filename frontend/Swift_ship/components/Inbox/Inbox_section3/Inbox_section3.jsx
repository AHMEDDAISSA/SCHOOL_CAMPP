import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native'
import React, { useContext } from 'react'
import { message_data } from '../../Data/Data'
import { Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
import { router, Link } from "expo-router";
import ThemeContext from '../../../theme/ThemeContext';

const Inbox_section3 = () => {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  return (
    <View>
      <View style={styles.stack_container}>
        {
          message_data.map((d) => (
            <TouchableOpacity style={[styles.stack, {backgroundColor:theme.cardbg}]} onPress={() => {router.push('(screens)/chat_screen')}} key={d.id}>
                <View style={styles.stack_left}>
                  {d.image}
                  <View style={styles.content}>
                    <Text style={[styles.name, {color:theme.color}]}>{d.name}</Text>
                    <Text style={[styles.message, {color:theme.color}]}>{d.message}</Text>
                  </View>
                </View>
                <View style={styles.content_right}>
                {d.noof && (
                <View style={styles.circle}>
                  <Text style={styles.noof}>{d.noof}</Text>
                </View>
              )}
                  <Text style={[styles.time, {color:theme.color}]}>{d.time}</Text>
                </View>
            </TouchableOpacity>
          ))
        }
      </View>
    </View>
  )
}

export default Inbox_section3;

const styles = StyleSheet.create({
  stack_container: {
    gap: 15,
    marginBottom: 15,
  },
  stack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 8,
    backgroundColor: '#ffffff',
    borderRadius: 20,
  },
  stack_left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  name: {
    fontSize: 16,
    lineHeight: 19,
    fontFamily: 'Montserrat_700Bold',
    color: '#39335E',
  },
  message: {
    fontSize: 14,
    lineHeight: 17,
    fontFamily: 'Montserrat_500Medium',
    color: '#39335E',
  },
  content_right: {
    alignItems: 'center',
  },
  circle: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#836EFE',
    minWidth: 30,
    minHeight: 24,
    borderRadius: 50,
  },
  noof: {
    fontSize: 11,
    lineHeight: 13,
    fontFamily: 'Montserrat_500Medium',
    color: "#ffffff",
  },
  time: {
    fontSize: 14, 
    lineHeight: 17,
    fontFamily: 'Montserrat_500Medium',
    color: '#39335E',
  }
})