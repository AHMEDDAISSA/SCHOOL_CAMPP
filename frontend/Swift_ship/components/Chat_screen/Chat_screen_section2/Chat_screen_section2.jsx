import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native'
import React, { useContext } from 'react'
import { Montserrat_400Regular, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import { others_chat, your_chat, your_chat2 } from '../../Data/Data';
import ThemeContext from '../../../theme/ThemeContext';

const Chat_screen_section2 = () => {
    const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  return (
    <View style={styles.container}> 
    <ScrollView style={styles.chat_container} showsVerticalScrollIndicator={false}>
      <View style={styles.you_chat_container}>
        {
            your_chat.map((d) => (
                <TouchableOpacity style={styles.your_chat} key={d.id}>
                <Text style={styles.your_chat_text}>{d.chat}</Text>
                <Text style={styles.your_chat_time}>{d.time}</Text>
           </TouchableOpacity>
            ))
        }
      </View>
      <View style={styles.others_chat_container}>
        {
            others_chat.map((d) => (
                <TouchableOpacity style={styles.others_chat} key={d.id}>
                <Text style={styles.others_chat_text}>{d.chat}</Text>
                <Text style={styles.others_chat_time}>{d.time}</Text>
           </TouchableOpacity>
            ))
        }
      </View>
      <View style={styles.you_chat_container}>
        {
            your_chat2.map((d) => (
                <TouchableOpacity style={styles.your_chat} key={d.id}>
                <Text style={styles.your_chat_text}>{d.chat}</Text>
                <Text style={styles.your_chat_time}>{d.time}</Text>
           </TouchableOpacity>
            ))
        }
      </View>
       </ScrollView>
    </View>
  )
}

export default Chat_screen_section2;

const styles = StyleSheet.create({
    chat_container: {
        gap: 20,
        marginTop: 20,
    },
    you_chat_container: {
        gap: 20,
        alignItems: 'flex-end',
        marginTop: 20,
    },
    your_chat: {
        padding: 20,
        backgroundColor: '#836EFE',
        borderTopLeftRadius: 14,
        borderBottomLeftRadius: 14,
        borderBottomRightRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '90%',
        gap: 15,
    },
    your_chat_text: {
        fontSize: 14,
        lineHeight: 17,
        fontFamily: 'Montserrat_500Medium',
        color: '#FFFFFF',
        maxWidth: '75%',
    },
    your_chat_time: {
        fontSize: 14,
        lineHeight: 17,
        fontFamily: 'Montserrat_400Regular',
        color: '#FFFFFF',
    },
    others_chat_container: {
        gap: 20,
        alignItems: 'flex-start',
        marginTop: 20,
    },
    others_chat: {
        padding: 20,
        backgroundColor: '#f6f6f6',
        borderTopRightRadius: 14,
        borderBottomLeftRadius: 14,
        borderBottomRightRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '90%',
        gap: 15,
    },
    others_chat_text: {
        fontSize: 14,
        lineHeight: 17,
        fontFamily: 'Montserrat_500Medium',
        color: '#39335E',
        maxWidth: '75%',
    },
    others_chat_time: {
        fontSize: 14,
        lineHeight: 17,
        fontFamily: 'Montserrat_400Regular',
        color: '#39335E',
    },
})