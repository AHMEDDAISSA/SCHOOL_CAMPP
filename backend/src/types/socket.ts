export interface MessageData {
  senderId: string;
  receiverId: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'audio' | 'video';
  conversationId?: string;
  timestamp: Date;
  isRead?: boolean;
}

export interface TypingData {
  receiverId: string;
  conversationId: string;
}

export interface ReadData {
  conversationId: string;
  senderId: string;
}

export interface SocketResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface UserStatus {
  userId: string;
  isOnline: boolean;
  lastSeen?: Date;
}