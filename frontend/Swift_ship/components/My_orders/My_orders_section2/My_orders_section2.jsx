import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native'
import React, { useContext, useState } from 'react'
import { track_tab } from '../../Data/Data';
import { Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import My_orders_section3 from '../My_orders_section3/My_orders_section3';
import My_orders_section4 from '../My_orders_section4/My_orders_section4';
import ThemeContext from '../../../theme/ThemeContext';

const My_orders_section2 = () => {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
    const [activetab, setActivetab] = useState(track_tab[0].id);
    const press = (id) => {
        setActivetab(id);
    };
  return (
    <View style={styles.container}>
      <View style={styles.tab_container}>
        {
          track_tab.map((d) => (
            <TouchableOpacity style={[styles.tab, activetab === d.id && styles.active_tab]} onPress={() => {press(d.id)}} key={d.id}>
                <Text style={[styles.tab_text, activetab === d.id && styles.active_tab_text]}>{d.text}</Text>
            </TouchableOpacity>
          ))
        }
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
     {activetab === 1 ? <My_orders_section3 /> : <My_orders_section4 />}
      </ScrollView>
    </View>
  )
}

export default My_orders_section2;

const styles = StyleSheet.create({
    container: {
    
    },
    tab_container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 30,
    },
    tab: {
        borderBottomColor: '#A8A8A8',
        borderBottomWidth: 2,
        paddingVertical: 16,
        paddingHorizontal: 15,
        minWidth: '50%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    active_tab: {
      borderBottomColor: '#836EFE',  
    },
    tab_text: {
        fontSize: 14,
        lineHeight: 17,
        fontFamily: 'Montserrat_600SemiBold',
        color: '#A8A8A8',
    },
    active_tab_text: {
        color: '#836EFE',
    }
})