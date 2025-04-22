import { StyleSheet, Text, View, ScrollView } from 'react-native';
import React, { useContext } from 'react';
import Checked from "../../../assets/images/checked.svg";
import { map_modal } from '../../Data/Data';
import { Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import ThemeContext from '../../../theme/ThemeContext';

const Track_order_section4 = () => {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  return (
    <View>
        <ScrollView showsVerticalScrollIndicator={false} >
      <View style={styles.column}>
        {
          map_modal.map((d, index) => (
            <View style={styles.rowContainer} key={d.id}>
              <View style={styles.row}>
                <Checked />
                <View style={styles.content}>
                  <Text style={[styles.location, {color:theme.color}]}>{d.location}</Text>
                  <Text style={[styles.date, {color:theme.color3}]}>{d.date}</Text>
                </View>
              </View>
              {index < map_modal.length -1 && (
                <View style={styles.column_line}></View>
              )}
            </View>
          ))
        }
      </View>
      </ScrollView>
    </View>
  )
}

export default Track_order_section4;

const styles = StyleSheet.create({
  column: {
    position: 'relative',
    paddingBottom: 80,
  },
  rowContainer: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 10,
  },
  location: {
    fontSize: 14,
    lineHeight: 19,
    fontFamily: 'Montserrat_700Bold',
    color: '#39335E',
  },
  date: {
    fontSize: 12,
    lineHeight: 22,
    fontFamily: 'Montserrat_500Medium',
    color: '#727272',
  },
  column_line: {
    position: 'absolute',
    top: '56%',
    left: 12, 
    width: 2,
    height: 48, 
    backgroundColor: '#836EFE',
    alignSelf: 'center',
  },
  content: {
    flex: 1,
  },
});
