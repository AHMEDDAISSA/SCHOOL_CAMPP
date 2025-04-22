import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useContext } from 'react'
import Input from '../../Input/Input';
import Gallery from "../../../assets/images/gallery.svg";
import Mic from "../../../assets/images/mic2.svg";
import ThemeContext from '../../../theme/ThemeContext';

const Chat_screen_section3 = () => {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  return (
    <View>
      <View style={styles.row}>
        <View style={styles.input_container}>
            <Input placeholder="Message" />
            <Gallery style={styles.gallery} />
        </View>
        <TouchableOpacity>
        <Mic style={styles.mic} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Chat_screen_section3;

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '40%',
    },
    input_container: {
        position: 'relative',
        width: '80%',
    },
    gallery: {
        position: 'absolute',
        bottom: 20,
        right: 10,
    },
    mic: {
        marginBottom: -25,
    }
})