import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useContext } from 'react';
import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import { router, Link } from "expo-router";
import Input from '../../components/Input/Input';
import Search from '../../assets/images/search2.svg';
import Filter from "../../assets/images/filter.svg";
import { Montserrat_700Bold, Montserrat_500Medium, Montserrat_600SemiBold  } from '@expo-google-fonts/montserrat';
import Box from "../../assets/images/box.svg";
import ThemeContext from '../../theme/ThemeContext';

const Track_search = () => {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  return (
    <View style={[styles.container, {backgroundColor:theme.background}]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {router.push('my_orders')}}>
       {darkMode? <Dark_back /> : <Back />}
       </TouchableOpacity>
        <Text style={[styles.heading, {color:theme.color}]}>Track Order</Text>
      </View>
       <View style={styles.input_container}>
        <Input placeholder="Track Id Number" Icon={Search} />
        <Filter style={styles.filter} />
        </View>
        <Text style={[styles.result, {color:theme.color}]}>Results for <Text style={styles.value}> “VK3728732”</Text></Text>
        <TouchableOpacity style={[styles.stack, {backgroundColor:theme.cardbg}]} onPress={() => {router.push('(screens)/track_order')}}>
              <View style={styles.stack_left}>
                <View style={styles.border}>
                  <Box />
                </View>
                <View style={styles.content}>
                  <Text style={[styles.no, {color:theme.color}]}>VK3728732</Text>
                  <Text style={[styles.text, {color:theme.color3}]}>On the way to deslivery</Text>
                </View>
              </View>
              <View style={styles.button}>
                <Text style={styles.process}>On process</Text>
              </View>
            </TouchableOpacity>
    </View>
  )
}

export default Track_search;

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 60,
  },
  heading: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: 'Montserrat_700Bold',
    color: '#39335E',
    textTransform: 'capitalize',
  },
  input_container: {
    position: 'relative',
},
filter: {
    position: 'absolute',
    bottom: 20,
    right: 10,
},
result: {
  fontSize: 16,
  lineHeight: 19,
  fontFamily: 'Montserrat_700Bold',
  color: '#39335E',
  marginVertical: 30,
},
value: {
  fontSize: 16,
  lineHeight: 19,
  fontFamily: 'Montserrat_700Bold',
  color: '#836EFE',
},
stack: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 20,
  borderRadius: 20,
  backgroundColor: '#ffffff',
},
stack_left: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
},
border: {
  backgroundColor: 'rgba(26, 22, 51, 0.20)',
  borderRadius: 10,
  padding: 10,
  alignItems: 'center',
  justifyContent: 'center',
},
content: {
  gap: 6,
},
no: {
  fontSize: 16,
  lineHeight: 19,
  fontFamily: 'Montserrat_700Bold',
  color: '#39335E',
},
status: {
  fontSize: 14,
  lineHeight: 17,
  fontFamily: 'Montserrat_500Medium',
  color: '#39335E',
},
button: {
  backgroundColor: 'rgba(10, 40, 18, 0.20)',
  borderRadius: 6,
  padding: 5,
},
process: {
  fontSize: 10,
  lineHeight: 12,
  fontFamily: 'Montserrat_600SemiBold',
  color: '#34C759',
}
})