import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import React, { useContext } from 'react';
import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import { router, Link } from "expo-router";
import Input from '../../components/Input/Input';
import Search from '../../assets/images/search2.svg';
import Filter from "../../assets/images/filter.svg";
import { Montserrat_700Bold, Montserrat_500Medium, Montserrat_600SemiBold  } from '@expo-google-fonts/montserrat';
import Box from "../../assets/images/box.svg";
import Search_img from "../../assets/images/search_page_image.png";
import ThemeContext from '../../theme/ThemeContext';

const Search_page = () => {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  return (
    <View style={[styles.container, {backgroundColor:theme.background}]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {router.push('home')}}>
       {darkMode? <Dark_back /> : <Back />}
        </TouchableOpacity>
        <Text style={[styles.heading, {color:theme.color}]}>search</Text>
      </View>
       <View style={styles.input_container}>
        <Input placeholder="Track Id Number" Icon={Search} />
        <Filter style={styles.filter} />
        </View>
        <View style={styles.image_container}>
            <Image source={Search_img} alt='image' style={styles.image} />
        </View>
    </View>
  )
}

export default Search_page;

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 105,
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
image_container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 118,
},
image: {
    width: 320,
    height: 290,
}
})