import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { generateOTP, verifyOTP } from '../utils/otpUtils';
import OtpModel from '../models/Otp';
import UserModel from '../models/User'; // Assuming you have a User model
import { sendEmail } from '../utils/emailUtils'; // Assuming you have an email utility

/**
 * Request a new OTP for authenticated user
 */
export const requestOTP = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const userId = req.user._id.toString();
    const userIp = req.ip || '127.0.0.1';

    // Get user email
    const user = await UserModel.findById(userId);
    if (!user || !user.email) {
      res.status(404).json({ success: false, message: 'User email not found' });
      return;
    }

    // Delete existing OTPs for this user
    await OtpModel.deleteMany({ userId });

    // Generate new OTP
    const otp = await generateOTP(userId);

    // Save OTP
    await OtpModel.create({
      userId,
      otp,
      attempts: 0,
      expiresAt: new Date(Date.now() + 3 * 60 * 1000), // 3 minutes
      userIp,
    });

    // Send email with OTP
    try {
      await sendEmail({
        to: user.email,
        subject: 'Your Verification Code',
        text: `Your verification code is: ${otp}. This code will expire in 3 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333;">Email Verification</h2>
            <p>Your verification code is:</p>
            <h1 style="font-size: 32px; letter-spacing: 5px; text-align: center; margin: 30px 0; color: #4a90e2;">${otp}</h1>
            <p>This code will expire in 3 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      res.status(500).json({ success: false, message: 'Failed to send OTP email' });
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      res.status(200).json({
        success: true,
        message: 'OTP generated successfully and sent to your email',
        otp,
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'OTP sent to your email',
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
        message: 'OTP verified successfully',
      });
    } else {
      const otpRecord = await OtpModel.findOne({ userId });
      if (otpRecord) {
        // Increment attempts
        otpRecord.attempts = (otpRecord.attempts || 0) + 1;
        await otpRecord.save();
        
        const attemptsRemaining = Math.max(0, 3 - otpRecord.attempts);
        res.status(400).json({
          success: false,
          message: `Invalid OTP. Attempts remaining: ${attemptsRemaining}`,
          attemptsRemaining,
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'OTP is invalid or expired',
        });
      }
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error verifying OTP' });
  }
};

/**
 * Request OTP by email (public endpoint)
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

    // Delete existing OTPs
    await OtpModel.deleteMany({ userId });

    // Generate new OTP
    const otp = await generateOTP(userId);

    // Save OTP
    await OtpModel.create({
      userId,
      otp,
      attempts: 0,
      expiresAt: new Date(Date.now() + 3 * 60 * 1000), // 3 minutes
      userIp,
    });

    // Send email with OTP
    try {
      await sendEmail({
        to: email,
        subject: 'Your Verification Code',
        text: `Your verification code is: ${otp}. This code will expire in 3 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333;">Email Verification</h2>
            <p>Your verification code is:</p>
            <h1 style="font-size: 32px; letter-spacing: 5px; text-align: center; margin: 30px 0; color: #4a90e2;">${otp}</h1>
            <p>This code will expire in 3 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      res.status(500).json({ success: false, message: 'Failed to send OTP email' });
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      res.status(200).json({
        success: true,
        message: 'OTP sent to email',
        otp,
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'OTP sent to email',
      });
    }
  } catch (error) {
    console.error('Public OTP request error:', error);
    res.status(500).json({ success: false, message: 'Server error generating OTP' });
  }
};

/**
 * Resend OTP to user's email
 */
export const resendOTPHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, userId } = req.body;
    const userIp = req.ip || '127.0.0.1';

    // Check if we have either an email or userId
    if (!email && !userId) {
      res.status(400).json({ success: false, message: 'Email or userId is required' });
      return;
    }

    let userEmail = email;
    let userIdentifier = userId || email.toLowerCase();

    // If userId is provided but not email, get the email from the user model
    if (userId && !email) {
      const user = await UserModel.findById(userId);
      if (!user || !user.email) {
        res.status(404).json({ success: false, message: 'User email not found' });
        return;
      }
      userEmail = user.email;
    }

    // Delete existing OTPs
    await OtpModel.deleteMany({ userId: userIdentifier });

    // Generate new OTP
    const otp = await generateOTP(userIdentifier);

    // Save OTP
    await OtpModel.create({
      userId: userIdentifier,
      otp,
      attempts: 0,
      expiresAt: new Date(Date.now() + 3 * 60 * 1000), // 3 minutes
      userIp,
    });

    // Send email with OTP
    try {
      await sendEmail({
        to: userEmail,
        subject: 'Your New Verification Code',
        text: `Your new verification code is: ${otp}. This code will expire in 3 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333;">Email Verification</h2>
            <p>Your new verification code is:</p>
            <h1 style="font-size: 32px; letter-spacing: 5px; text-align: center; margin: 30px 0; color: #4a90e2;">${otp}</h1>
            <p>This code will expire in 3 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      res.status(500).json({ success: false, message: 'Failed to send OTP email' });
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      res.status(200).json({
        success: true,
        message: 'New OTP sent to email',
        otp,
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'New OTP sent to email',
      });
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error resending OTP' });
  }
};