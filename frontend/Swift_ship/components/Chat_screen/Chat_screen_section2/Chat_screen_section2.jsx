import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { others_chat, your_chat, your_chat2 } from '../../Data/Data';
import ThemeContext from '../../../theme/ThemeContext';

const Chat_screen_section2 = ({ postId }) => {
  const { theme, darkMode } = useContext(ThemeContext);
  const [postStatus, setPostStatus] = useState('available');
  
  // Récupérer le statut de l'annonce liée à cette conversation
  useEffect(() => {
    if (postId) {
      // Appel API pour récupérer le statut de l'annonce
      const fetchPostStatus = async () => {
        try {
          const response = await fetch(`/api/posts/${postId}/status`);
          const data = await response.json();
          if (response.ok && data.status) {
            setPostStatus(data.status);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération du statut:", error);
        }
      };
      
      fetchPostStatus();
    }
  }, [postId]);

  // Badge de statut de l'annonce
  const ConversationStatusBadge = ({ status }) => {
    // Déterminer le style et le texte du badge en fonction du statut de l'annonce
    const getBadgeStyle = (status) => {
      switch(status) {
        case 'in_contact':
          return { backgroundColor: '#FF9800', text: 'En cours' };
        case 'reserved':
          return { backgroundColor: '#9C27B0', text: 'Réservé' };
        case 'sold':
          return { backgroundColor: '#F44336', text: 'Vendu' };
        default:
          return { backgroundColor: '#4CAF50', text: 'Disponible' };
      }
    };
    
    const { backgroundColor, text } = getBadgeStyle(status);
    
    return (
      <View style={[styles.statusBadge, { backgroundColor }]}>
        <Text style={styles.statusBadgeText}>{text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Afficher le badge de statut en haut de la conversation */}
      {postId && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Statut de l'annonce:</Text>
          <ConversationStatusBadge status={postStatus} />
        </View>
      )}
      
      <ScrollView style={styles.chat_container} showsVerticalScrollIndicator={false}>
        <View style={styles.you_chat_container}>
          {your_chat.map((d) => (
            <TouchableOpacity style={styles.your_chat} key={d.id}>
              <Text style={styles.your_chat_text}>{d.chat}</Text>
              <Text style={styles.your_chat_time}>{d.time}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.others_chat_container}>
          {others_chat.map((d) => (
            <TouchableOpacity style={styles.others_chat} key={d.id}>
              <Text style={styles.others_chat_text}>{d.chat}</Text>
              <Text style={styles.others_chat_time}>{d.time}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.you_chat_container}>
          {your_chat2.map((d) => (
            <TouchableOpacity style={styles.your_chat} key={d.id}>
              <Text style={styles.your_chat_text}>{d.chat}</Text>
              <Text style={styles.your_chat_time}>{d.time}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default Chat_screen_section2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    marginBottom: 15,
  },
  statusLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    marginRight: 6,
  },
  chat_container: {
    gap: 20,
    marginTop: 20,
  },
  you_chat_container: {
    gap: 20,
    alignItems: 'flex-end',
    marginTop: 20,
  },
  your_chat: {
    padding: 20,
    backgroundColor: '#836EFE',
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '90%',
    gap: 15,
  },
  your_chat_text: {
    fontSize: 14,
    lineHeight: 17,
    fontFamily: 'Montserrat_500Medium',
    color: '#FFFFFF',
    maxWidth: '75%',
  },
  your_chat_time: {
    fontSize: 14,
    lineHeight: 17,
    fontFamily: 'Montserrat_400Regular',
    color: '#FFFFFF',
  },
  others_chat_container: {
    gap: 20,
    alignItems: 'flex-start',
    marginTop: 20,
  },
  others_chat: {
    padding: 20,
    backgroundColor: '#f6f6f6',
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '90%',
    gap: 15,
  },
  others_chat_text: {
    fontSize: 14,
    lineHeight: 17,
    fontFamily: 'Montserrat_500Medium',
    color: '#39335E',
    maxWidth: '75%',
  },
  others_chat_time: {
    fontSize: 14,
    lineHeight: 17,
    fontFamily: 'Montserrat_400Regular',
    color: '#39335E',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
  },
});
