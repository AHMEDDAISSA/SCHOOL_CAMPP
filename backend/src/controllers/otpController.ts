// controllers/otpController.ts
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { generateOTP, verifyOTP } from '../utils/otpUtils';
import OtpModel from '../models/Otp';

/**
 * Request OTP generation
 * This function generates and sends an OTP to the authenticated user
 */
export const requestOTP = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Ensure user is authenticated
        if (!req.user || !req.user._id) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }

        const userId = req.user._id.toString();
        const userIp = req.ip || '127.0.0.1';

        // Delete any existing OTP for this user
        await OtpModel.deleteMany({ userId });

        // Generate a new OTP
        const otp = await generateOTP(userId);

        // Store the OTP with user info and IP
        await OtpModel.create({
            userId,
            otp,
            attempts: 0,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
            userIp
        });

        if (process.env.NODE_ENV === 'development') {
            res.status(200).json({
                success: true,
                message: 'OTP generated successfully',
                otp
            });
        } else {
            res.status(200).json({
                success: true,
                message: 'OTP sent to your email'
            });
        }
    } catch (error) {
        console.error('Request OTP error:', error);
        res.status(500).json({ success: false, message: 'Server error generating OTP' });
    }
};

/**
 * Verify OTP provided by user
 */
export const verifyOTPHandler = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || !req.user._id) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }

        const userId = req.user._id.toString();
        const { enteredOTP } = req.body;

        if (!enteredOTP) {
            res.status(400).json({ success: false, message: 'OTP is required' });
            return;
        }

        const isValid = await verifyOTP(userId, enteredOTP);

        if (isValid) {
            res.status(200).json({
                success: true,
                message: 'OTP verified successfully'
            });
        } else {
            const otpRecord = await OtpModel.findOne({ userId });
            if (otpRecord) {
                const attemptsRemaining = Math.max(0, 3 - (otpRecord.attempts || 0));
                res.status(400).json({
                    success: false,
                    message: `Invalid OTP. Attempts remaining: ${attemptsRemaining}`,
                    attemptsRemaining
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'OTP is invalid or expired'
                });
            }
        }
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ success: false, message: 'Server error verifying OTP' });
    }
};

/**
 * ✅ Request OTP by email (public route)
 */
export const requestOTPByEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        const userIp = req.ip || '127.0.0.1';

        if (!email) {
            res.status(400).json({ success: false, message: 'Email is required' });
            return;
        }

        const userId = email.toLowerCase(); // Use email as identifier

        await OtpModel.deleteMany({ userId });

        const otp = await generateOTP(userId);

        await OtpModel.create({
            userId,
            otp,
            attempts: 0,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
            userIp,
        });

        // TODO: Send OTP via email (e.g., nodemailer)

        res.status(200).json({
            success: true,
            message: 'OTP sent to email',
            otp: process.env.NODE_ENV === 'development' ? otp : undefined
        });
    } catch (error) {
        console.error('Public OTP request error:', error);
        res.status(500).json({ success: false, message: 'Server error generating OTP' });
    }
};
