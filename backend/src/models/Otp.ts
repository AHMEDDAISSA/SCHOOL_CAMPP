import mongoose, { Schema } from "mongoose";
import IOtp from "../types/otpType";

const OtpSchema = new Schema<IOtp>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  otp: { type: String, required: true },
  attempts:{ type: Number , required: true} ,
  expiresAt: { type: Date, required: true} ,
  userIp: {type: String, required: true}
});


OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 300 });

export default mongoose.model<IOtp>("Otp", OtpSchema);
