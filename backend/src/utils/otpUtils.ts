// utils/otpUtils.ts
import crypto from "crypto";
import OtpModel from "../models/Otp";

/**
 * Generate a 6-digit OTP and store it in the database
 * @param userId The ID of the user to generate an OTP for
 * @returns The generated OTP
 */
export const generateOTP = async (userId: string): Promise<string> => {
    // Generate a random 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Store the OTP in the database with an expiration time
    await OtpModel.create({
        userId,
        otp,
        attempts: 0,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // OTP expires in 5 minutes
        userIp: '127.0.0.1' // This should be replaced with the actual IP in the controller
    });

    return otp; // Return the generated OTP
};

/**
 * Verify OTP for a user
 * @param userId The ID of the user to verify OTP for
 * @param enteredOTP The OTP entered by the user
 * @returns A boolean indicating whether the OTP is valid
 */
export const verifyOTP = async (userId: string, enteredOTP: string): Promise<boolean> => {
    // Find the OTP record in the database
    const otpRecord = await OtpModel.findOne({ userId });

    // Check if the OTP record exists
    if (!otpRecord) {
        return false; // OTP record not found
    }

    // Check if the OTP is expired
    if (otpRecord.expiresAt < new Date()) {
        // Delete the expired OTP
        await OtpModel.deleteOne({ _id: otpRecord._id });
        return false; // OTP is expired
    }

    // Check if maximum attempts reached
    if (otpRecord.attempts && otpRecord.attempts >= 3) {
        // Delete the OTP if max attempts reached
        await OtpModel.deleteOne({ _id: otpRecord._id });
        return false; // Too many attempts
    }

    // Check if the OTP matches
    if (otpRecord.otp !== enteredOTP) {
        // Increment attempts count
        await OtpModel.updateOne(
            { _id: otpRecord._id },
            { $inc: { attempts: 1 } }
        );
        return false; // OTP doesn't match
    }

    // OTP is valid - delete it after successful verification
    await OtpModel.deleteOne({ _id: otpRecord._id });
    return true; // OTP is valid
};