import crypto from "crypto";
import OtpModel from "../models/Otp";


export const generateOTP = async (userId: string): Promise<string> => {
    
    const otp = crypto.randomInt(100000, 999999).toString();

    
    await OtpModel.create({
        userId,
        otp,
        expiresAt: new Date(Date.now() + 3 * 60 * 1000) // Changé de 5 à 3 minutes
    });

    return otp; 
};


export const verifyOTP = async (userId: string, enteredOTP: string): Promise<boolean> => {
    // Find the OTP record in the database
    const otpRecord = await OtpModel.findOne({ userId, otp: enteredOTP });

    
    if (!otpRecord || otpRecord.expiresAt < new Date()) {
        return false; // OTP is invalid or expired
    }

    
    await OtpModel.deleteOne({ _id: otpRecord._id });
    return true; // Return true if OTP is valid
};
