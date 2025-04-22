// OTP Interface
import mongoose, { Document } from "mongoose";
export interface IOtp extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  otp: string;
  attempts: number,
  expiresAt: Date;
  userIp: string
}

export default IOtp;
