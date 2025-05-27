import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React, { useContext } from 'react';
import Call from "../../assets/images/inbox_call.png";
import { call_row_data } from '../../components/Data/Data';
import ThemeContext from '../../theme/ThemeContext';

const Inbox_call = () => {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  return (
    <View>
      {/* <Image source={Call} alt='image' style={styles.image} />
      <View style={styles.row}>
        {call_row_data.map((d) => {
          let backgroundColor;
          switch (d.id) {
            case 1:
              backgroundColor = '#FF708A';
              break;
            case 2:
              backgroundColor = '#55F5D2';
              break;
            default:
              backgroundColor = '#FEB147';
          }
          return (
            <TouchableOpacity style={[styles.circle, { backgroundColor }]} key={d.id}>
              {d.icon}
            </TouchableOpacity>
          );
        })}
      </View> */}
    </View>
  );
};

export default Inbox_call;

const styles = StyleSheet.create({
  image: {
    position: 'relative',
  },
  row: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
    bottom: '20%',
    gap: 30,
  },
  circle: {
    borderRadius: 60,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'transparent',
  },
});
