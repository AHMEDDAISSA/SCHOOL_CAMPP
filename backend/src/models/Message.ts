import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  content: string;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  timestamp: Date;
  isRead: boolean;
}

const messageSchema: Schema<IMessage> = new Schema({
  content: { type: String, required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // ✅ NOUVEAU
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

export default mongoose.model<IMessage>('Message', messageSchema);
