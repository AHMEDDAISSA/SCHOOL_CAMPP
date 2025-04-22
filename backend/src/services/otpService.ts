import crypto from "crypto";
import OtpModel from "../models/Otp";

/**
 * Generate a 6-digit OTP and store it in the database
 */
export const generateOTP = async (userId: string): Promise<string> => {
    // Generate a random 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Store the OTP in the database with an expiration time
    await OtpModel.create({
        userId,
        otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000) // OTP expires in 5 minutes
    });

    return otp; // Return the generated OTP
};

/**
 * Verify OTP for posting ads
 */
export const verifyOTP = async (userId: string, enteredOTP: string): Promise<boolean> => {
    // Find the OTP record in the database
    const otpRecord = await OtpModel.findOne({ userId, otp: enteredOTP });

    // Check if the OTP is valid and not expired
    if (!otpRecord || otpRecord.expiresAt < new Date()) {
        return false; // OTP is invalid or expired
    }

    // Delete the OTP after successful verification
    await OtpModel.deleteOne({ _id: otpRecord._id });
    return true; // Return true if OTP is valid
};
