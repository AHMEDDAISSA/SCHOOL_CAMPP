import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image } from 'react-native';
import React, { useContext, useState } from 'react';
import { amount_data } from '../Data/Data';
import { Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import Bg from "../../assets/images/amount_bg.png";
import Button from '../../components/Button/Button';
import { router, Link } from "expo-router";
import ThemeContext from '../../theme/ThemeContext';

const Topup_section2 = () => {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  const [selectedAmount, setSelectedAmount] = useState(amount_data[0].amount);
  const [isEditing, setIsEditing] = useState(false);

  const handleAmountChange = (amount) => {
    setSelectedAmount(amount);
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.label}>
        <Image style={styles.bg} source={Bg} alt='bg' />
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={selectedAmount}
            onChangeText={setSelectedAmount}
            onBlur={() => setIsEditing(false)}
            keyboardType="numeric"
            autoFocus
          />
        ) : (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={styles.amount}>{selectedAmount}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.tab_container}>
        {amount_data.map((d) => (
          <TouchableOpacity
            style={[styles.tab, {backgroundColor:theme.card}]}
            key={d.id}
            onPress={() => handleAmountChange(d.amount)}
          >
            <Text style={[styles.tab_text, {color:theme.color}]}>{d.amount}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Button buttonText="Continue" onPress={() => router.push('(screens)/pay_method')} />
    </View>
  );
};

export default Topup_section2;

const styles = StyleSheet.create({
  container: {
   paddingBottom: 100,
  },
  label: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bg: {
    position: 'relative',
    width: 320,
    height: 100,
    borderRadius: 20,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    position: 'absolute',
    textAlign: 'center',
    color: '#ffffff',
    bottom: 35,
    right: -23,
  },
  input: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderColor: '#000',
    paddingVertical: 5,
  },
  tab_container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 20,
    marginBottom: 210,
  },
  tab: {
    borderRadius: 8,
    paddingVertical: 10,
    backgroundColor: 'rgba(57, 51, 94, 0.2)',
    minWidth: 90,
    maxWidth: 90,
    minHeight: 50,
    maxHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  tab_text: {
    fontSize: 18,
    lineHeight: 28,
    fontFamily: 'Montserrat_500Medium',
    color: '#39335E',
  },
});
