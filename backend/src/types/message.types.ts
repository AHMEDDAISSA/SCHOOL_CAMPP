export interface MessageData {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: 'text' | 'image' | 'file';
  timestamp: Date;
  isRead: boolean;
  isDelivered: boolean;
}

export interface ConversationData {
  id: string;
  participants: string[];
  lastMessage: {
    content: string;
    timestamp: Date;
    senderId: string;
  };
  unreadCount: number;
}

export interface SendMessageRequest {
  receiverId: string;
  content: string;
  messageType?: 'text' | 'image' | 'file';
}