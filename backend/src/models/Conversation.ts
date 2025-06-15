import mongoose, { Schema, Document } from 'mongoose';

export enum ConversationType {
  Private = 'private',
  Group = 'group'
}

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  advertId?: mongoose.Types.ObjectId;
  lastMessage?: {
    content: string;
    timestamp: Date;
    senderId: mongoose.Types.ObjectId;
  };
  unreadCount: Record<string, number>;
  conversationType: ConversationType;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema<IConversation>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  advertId: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  },
  lastMessage: {
    content: { type: String, required: false },
    timestamp: { type: Date, default: Date.now },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: false }
  },
  unreadCount: {
    type: Schema.Types.Mixed,
    default: {}
  },
  conversationType: {
    type: String,
    enum: Object.values(ConversationType),
    default: ConversationType.Private,
    required: true
  }
}, {
  timestamps: true
});

ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ advertId: 1 });

export default mongoose.model<IConversation>('Conversation', ConversationSchema);
