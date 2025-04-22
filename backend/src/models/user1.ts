import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
}

const userSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  // Add other fields if needed
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;

