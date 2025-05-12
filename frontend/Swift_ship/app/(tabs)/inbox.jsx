import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';
import React, { useContext, useState } from 'react';
import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import Search from "../../assets/images/search2.svg";
import Filter from "../../assets/images/filter.svg"; // Ajout d'un icône de filtre
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { inbox_tab_data } from '../../components/Data/Data';
import { SourceSansPro_700Bold } from '@expo-google-fonts/source-sans-pro';
import Inbox_section2 from '../../components/Inbox/Inbox_section2/Inbox_section2';
import Inbox_section3 from '../../components/Inbox/Inbox_section3/Inbox_section3';
import ThemeContext from '../../theme/ThemeContext';
import { router, Link } from "expo-router";

const Inbox = () => {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  const [activetab, setActivetab] = useState(inbox_tab_data[0].id);
  const [searchVisible, setSearchVisible] = useState(false);
  
  const press = (id) => {
    setActivetab(id);
  }
  
  const back = () => {
    router.push('/home');
  };
  
  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
  }
  
  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <View style={[styles.header]}>
        <TouchableOpacity onPress={back}>
          {darkMode ? <Dark_back /> : <Back />}
        </TouchableOpacity>
        <Text style={[styles.heading, {color:theme.color}]}>Messages</Text>
        <TouchableOpacity onPress={toggleSearch}>
          <Search />
        </TouchableOpacity>
      </View>
      
      {searchVisible && (
        <View style={styles.searchContainer}>
          <TextInput 
            style={[styles.searchInput, {backgroundColor: theme.cardbg, color: theme.color}]}
            placeholder="Rechercher un message..." 
            placeholderTextColor={theme.placeholderColor}
          />
          <TouchableOpacity style={styles.filterButton}>
            <Filter />
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.tab_container}>
        {
          inbox_tab_data.map((d) => (
            <TouchableOpacity 
              style={[styles.tab, activetab === d.id && styles.activetab]} 
              key={d.id} 
              onPress={() => {press(d.id)}}
            >
              <Text style={[styles.tab_text, activetab === d.id && styles.activetab_text]}>
                {d.text}
              </Text>
              {d.count > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{d.count}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        }
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {activetab === 1 ? 
          <Inbox_section3 /> : 
          <Inbox_section2 />
        }
        
        {/* Message informatif pour l'utilisateur */}
        {(activetab === 1 || activetab === 2) && (
          <View style={[styles.infoCard, {backgroundColor: theme.cardbg}]}>
            <Text style={[styles.infoText, {color: theme.secondaryColor}]}>
              Les messages sont visibles pendant 30 jours après la dernière activité de l'annonce
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* Bouton flottant pour créer un nouveau message */}
      <TouchableOpacity 
        style={styles.newMessageButton}
        onPress={() => router.push('(screens)/new_message')}
      >
        <Text style={styles.newMessageButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

export default Inbox;

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: 'Montserrat_700Bold',
    color: '#39335E',
    textTransform: 'capitalize',
  },
  searchContainer: {
    flexDirection: 'row',
    marginTop: 15,
    marginBottom: 5,
  },
  searchInput: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    fontSize: 14,
  },
  filterButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#836EFE',
  },
  tab_container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
    gap: 20,
  },
  tab: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#836EFE',
    paddingVertical: 10,
    paddingHorizontal: 25,
    minWidth: 150,
    maxWidth: 150,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tab_text: {
    fontSize: 18,
    lineHeight: 28,
    fontFamily: 'SourceSansPro_700Bold',
    color: '#836EFE',
    textTransform: 'capitalize',
  },
  activetab: {
    backgroundColor: '#836EFE',
  },
  activetab_text: {
    color: '#ffffff',
  },
  countBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoCard: {
    padding: 15,
    borderRadius: 8,
    marginVertical: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#836EFE',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  newMessageButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#836EFE',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  newMessageButtonText: {
    color: 'white',
    fontSize: 30,
  }
})  