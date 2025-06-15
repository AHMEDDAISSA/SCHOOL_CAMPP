import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


export const createOrGetConversation = async (senderId, receiverId) => {
  try {
    const response = await axios.post(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/conversations/find-or-create`, {
      senderId,
      receiverId,
    });

    if (response.status === 200 && response.data?.conversation) {
      return response.data.conversation;
    } else {
      throw new Error("Conversation non trouvée");
    }
  } catch (error) {
    console.error("Erreur API conversation:", error);
    throw error;
  }
};
