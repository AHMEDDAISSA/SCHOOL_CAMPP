import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import React, { useContext, useState } from 'react';
import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import ThemeContext from '../../theme/ThemeContext';
import { router } from "expo-router";
import { Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
// Importez vos icônes ici

const Support = () => {
  const { theme, darkMode } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('faq');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  
  const back = () => {
    router.back();
  };
  
  const handleSendMessage = () => {
    // Logique pour envoyer le message
    alert('Message envoyé ! Nous vous répondrons bientôt.');
    setMessage('');
  };
  
  const faqItems = [
    { 
      question: 'Comment modifier mon profil ?',
      answer: 'Pour modifier votre profil, accédez à la page Profil et appuyez sur le bouton "Modifier" à côté de vos informations personnelles.'
    },
    { 
      question: 'Comment contacter le support technique ?',
      answer: 'Vous pouvez nous contacter en utilisant le formulaire de contact dans l\'onglet "Contact" de cette page ou par email à ahmedaissa575@gmail.com.'
    },
    {
      question: 'L\'application est-elle disponible sur iOS et Android ?',
      answer: 'Oui, notre application est disponible sur les deux plateformes. Vous pouvez la télécharger sur l\'App Store pour iOS et sur Google Play pour Android.'
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={back} style={styles.backButton}>
          {darkMode ? <Dark_back /> : <Back />}
        </TouchableOpacity>
        <Text style={[styles.heading, { color: theme.color }]}>Support</Text>
        <View style={{width: 24}} />
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'faq' && styles.activeTab,
            { backgroundColor: activeTab === 'faq' ? '#836EFE' : (darkMode ? '#333' : '#f0f0f0') }
          ]} 
          onPress={() => setActiveTab('faq')}
        >
          <Text style={[
            styles.tabText, 
            { color: activeTab === 'faq' ? '#fff' : (darkMode ? '#fff' : '#333') }
          ]}>
            FAQ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'contact' && styles.activeTab,
            { backgroundColor: activeTab === 'contact' ? '#836EFE' : (darkMode ? '#333' : '#f0f0f0') }
          ]}
          onPress={() => setActiveTab('contact')}
        >
          <Text style={[
            styles.tabText, 
            { color: activeTab === 'contact' ? '#fff' : (darkMode ? '#fff' : '#333') }
          ]}>
            Contact
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'resources' && styles.activeTab,
            { backgroundColor: activeTab === 'resources' ? '#836EFE' : (darkMode ? '#333' : '#f0f0f0') }
          ]}
          onPress={() => setActiveTab('resources')}
        >
          <Text style={[
            styles.tabText, 
            { color: activeTab === 'resources' ? '#fff' : (darkMode ? '#fff' : '#333') }
          ]}>
            Ressources
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'faq' && (
          <View style={styles.faqContainer}>
            {faqItems.map((item, index) => (
              <View 
                key={index} 
                style={[
                  styles.faqItem, 
                  { backgroundColor: darkMode ? '#333' : '#f0f0f0' }
                ]}
              >
                <Text style={[styles.question, { color: theme.color }]}>
                  {item.question}
                </Text>
                <Text style={[styles.answer, { color: theme.color4 }]}>
                  {item.answer}
                </Text>
              </View>
            ))}
          </View>
        )}
        
        {activeTab === 'contact' && (
          <View style={styles.contactContainer}>
            <Text style={[styles.contactText, { color: theme.color }]}>
              Nous sommes là pour vous aider. Envoyez-nous votre question et nous vous répondrons dans les plus brefs délais.
            </Text>
            
            <TextInput 
              style={[
                styles.input, 
                { 
                  backgroundColor: darkMode ? '#333' : '#f0f0f0',
                  color: theme.color 
                }
              ]}
              placeholder="Votre email"
              placeholderTextColor={darkMode ? '#aaa' : '#888'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            
            <TextInput 
              style={[
                styles.textArea, 
                { 
                  backgroundColor: darkMode ? '#333' : '#f0f0f0',
                  color: theme.color 
                }
              ]}
              placeholder="Décrivez votre problème ou posez votre question..."
              placeholderTextColor={darkMode ? '#aaa' : '#888'}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            
            <TouchableOpacity 
              style={[styles.sendButton, { 
                backgroundColor: '#836EFE',
                opacity: (message && email) ? 1 : 0.6
              }]}
              onPress={handleSendMessage}
              disabled={!message || !email}
            >
              <Text style={styles.sendButtonText}>Envoyer</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {activeTab === 'resources' && (
          <View style={styles.resourcesContainer}>
            <Text style={[styles.resourcesTitle, { color: theme.color }]}>
              Centre d'aide
            </Text>
            
            <TouchableOpacity 
              style={[styles.resourceItem, { backgroundColor: darkMode ? '#333' : '#f0f0f0' }]}
              onPress={() => {/* Navigation vers la documentation */}}
            >
              <Text style={[styles.resourceName, { color: theme.color }]}>Documentation utilisateur</Text>
              <Text style={[styles.resourceDesc, { color: theme.color4 }]}>Guide complet d'utilisation de l'application</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.resourceItem, { backgroundColor: darkMode ? '#333' : '#f0f0f0' }]}
              onPress={() => {/* Navigation vers les tutoriels */}}
            >
              <Text style={[styles.resourceName, { color: theme.color }]}>Tutoriels vidéo</Text>
              <Text style={[styles.resourceDesc, { color: theme.color4 }]}>Apprenez à utiliser toutes les fonctionnalités</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.resourceItem, { backgroundColor: darkMode ? '#333' : '#f0f0f0' }]}
              onPress={() => {/* Navigation vers les questions fréquentes */}}
            >
              <Text style={[styles.resourceName, { color: theme.color }]}>Questions fréquentes</Text>
              <Text style={[styles.resourceDesc, { color: theme.color4 }]}>Réponses aux questions les plus posées</Text>
            </TouchableOpacity>
            
            <Text style={[styles.resourcesTitle, { color: theme.color, marginTop: 25 }]}>
              Nous contacter
            </Text>
            
            <TouchableOpacity 
              style={[styles.resourceItem, { backgroundColor: darkMode ? '#333' : '#f0f0f0' }]}
              onPress={() => {/* Ouvrir l'email */}}
            >
              <Text style={[styles.resourceName, { color: theme.color }]}>Email</Text>
              <Text style={[styles.resourceDesc, { color: '#836EFE' }]}>ahmedaissa575@gmail.com</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.resourceItem, { backgroundColor: darkMode ? '#333' : '#f0f0f0' }]}
              onPress={() => {/* Ouvrir l'appel téléphonique */}}
            >
              <Text style={[styles.resourceName, { color: theme.color }]}>Téléphone</Text>
              <Text style={[styles.resourceDesc, { color: '#836EFE' }]}>+44 96339287</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Ajouter un espace en bas pour le scroll */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

export default Support;

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
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  heading: {
    fontSize: 24,
    lineHeight: 34,
    fontFamily: 'Montserrat_700Bold',
    color: '#121212',
    textTransform: 'capitalize',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-between',
    borderRadius: 10,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#836EFE',
  },
  tabText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  // Styles pour la section FAQ
  faqContainer: {
    gap: 15,
  },
  faqItem: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  question: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 16,
    marginBottom: 8,
  },
  answer: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
    lineHeight: 22,
  },
  // Styles pour la section Contact
  contactContainer: {
    gap: 15,
  },
  contactText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 5,
  },
  input: {
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
  },
  textArea: {
    borderRadius: 10,
    padding: 16,
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
    minHeight: 120,
  },
  sendButton: {
    backgroundColor: '#836EFE',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 16,
  },
  // Styles pour la section Ressources
  resourcesContainer: {
    gap: 12,
  },
  resourcesTitle: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 18,
    marginBottom: 5,
  },
  resourceItem: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  resourceName: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 15,
    marginBottom: 4,
  },
  resourceDesc: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 13,
  },
});