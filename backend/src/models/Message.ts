// models/Message.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  conversationId: string;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  content: string;
  messageType: 'text' | 'image' | 'file';
  timestamp: Date;
  isRead: boolean;
  isDelivered: boolean;
  attachments?: {
    type: string;
    url: string;
    name: string;
  }[];
}

const MessageSchema: Schema = new Schema({
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  attachments: [{
    type: String,
    url: String,
    name: String
  }]
}, {
  timestamps: true
});

export default mongoose.model<IMessage>('Message', MessageSchema);
