import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useContext } from 'react';
import Box from "../../../assets/images/box.svg";
import { Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { track_stack } from '../../Data/Data';
import { router, Link } from "expo-router";
import ThemeContext from '../../../theme/ThemeContext';

const My_orders_section3 = () => {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  return (
    <View style={styles.container}>
      <View style={styles.stack_container}>
        {
          track_stack.map((d) => (
            <TouchableOpacity style={[styles.stack, {backgroundColor:theme.cardbg}]} key={d.id} onPress={() => {router.push('(screens)/track_order')}}>
              <View style={styles.stack_left}>
                <View style={[styles.border, {backgroundColor:theme.cardbg3}]}>
                  <Box />
                </View>
                <View style={styles.content}>
                  <Text style={[styles.no, {color:theme.color}]}>{d.track_no}</Text>
                  <Text style={[styles.text, {color:theme.color}]}>{d.status}</Text>
                </View>
              </View>
              <View style={styles.button}>
                <Text style={styles.process}>{d.process}</Text>
              </View>
            </TouchableOpacity>
          ))
        }
      </View>
    </View>
  );
}

export default My_orders_section3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 250,
  },
  stack_container: {
    gap: 16,
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
});
