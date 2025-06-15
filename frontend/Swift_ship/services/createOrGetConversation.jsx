import AsyncStorage from '@react-native-async-storage/async-storage';
import { findOrCreateConversation } from './api';
import { getUserByEmailApi } from './api' 

const API_BASE_URL = 'http://192.168.1.21:3001'; // Remplacez par votre URL

export const createOrGetConversation = async (receiverEmail, advertId) => {
  try {
    console.log('=== CREATE OR GET CONVERSATION SERVICE ===');
    console.log('receiverEmail:', receiverEmail);
    console.log('advertId:', advertId);

    if (!receiverEmail || !advertId) {
      throw new Error('Email du destinataire et ID de l\'annonce requis');
    }

    // D'abord, récupérer l'utilisateur par email pour obtenir son ID
    console.log('🔍 Recherche de l\'utilisateur par email...');
    const receiverData = await getUserByEmailApi(receiverEmail);
    
    if (!receiverData || !receiverData._id) {
      throw new Error('Destinataire non trouvé');
    }

    console.log('✅ Receiver ID trouvé:', receiverData._id);

    // Utiliser la fonction API existante
    console.log('🔄 Création/récupération de la conversation...');
    const result = await findOrCreateConversation(receiverData._id, advertId);
    
    console.log('✅ Résultat conversation:', result);
    return result;

  } catch (error) {
    console.error('❌ Erreur createOrGetConversation:', error);
    throw error;
  }
};