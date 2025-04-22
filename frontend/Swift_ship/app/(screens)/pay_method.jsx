import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, {useContext, useState} from 'react';
import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { pay_method } from '../../components/Data/Data';
import CheckCircle from '../../components/Check_Circle/Check_Circle';
import Button from '../../components/Button/Button';
import { router, Link } from "expo-router";
import ThemeContext from '../../theme/ThemeContext';

const Pay_method = () => {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
    const [activeBox, setActiveBox] = useState(pay_method[0]?.id || null);
    const handleBoxPress = (id) => {
      setActiveBox(id);
    };
  return (
    <View style={[styles.container, {backgroundColor:theme.background}]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {router.push('(screens)/topup')}}>
       {darkMode? <Dark_back /> : <Back />}
       </TouchableOpacity>
        <Text style={[styles.heading, {color:theme.color}]}>Payment Method</Text>
      </View>
      <View style={styles.stack_container}>
        {
            pay_method.map((d) =>(
                <TouchableOpacity style={[[styles.stack, {backgroundColor:theme.cardbg}], activeBox === d.id, styles.activeBox]} key={d.id} onPress={() => {handleBoxPress(d.id)}}>
                    <View style={styles.stack_left}>
                        {d.icon}
                        <Text style={[styles.stack_text, {color:theme.color}]}>{d.text}</Text>
                    </View>
                    <CheckCircle 
                      checked={activeBox === d.id}
                      onPress={() => handleBoxPress(d.id)}
                      />
                </TouchableOpacity>
            ))
        }
      </View>
      <Button buttonText="Continue" onPress={() => {router.push('(screens)/topup_wallet')}} />
    </View>
  )
}

export default Pay_method;

const styles = StyleSheet.create({
    container: {
        paddingTop: 50,
        paddingBottom: 80,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 50,
    },
    heading: {
        fontSize: 20,
        lineHeight: 24,
        fontFamily: 'Montserrat_700Bold',
        color: '#39335E',
        textTransform: 'capitalize',
    },
    stack_container: {
        gap: 16,
        marginVertical: 30,
        marginBottom: 300,
    },
    stack: {
        backgroundColor: '#F6F6F6',
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 60,
        maxHeight: 60,
    },
    stack_left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
})