import { Response, Request } from "express";
import UserModel from "../models/User";
import { IUser } from "../types/userTypes";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../services/emailService";
import { Console } from "winston/lib/winston/transports";

// Utility to generate a 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Handler to verify OTP code
export const verifyOTPHandler = async (req: Request, res: Response): Promise<void> => {
    const { userId, code } = req.body;
  
    if (!userId || !code) {
      res.status(400).json({ 
        success: false, 
        message: "User ID and verification code are required." 
      });
      return;
    }
  
    try {
      const user = await UserModel.findById(userId);
      
      if (!user) {
        res.status(404).json({ 
          success: false, 
          message: "User not found." 
        });
        return;
      }
  
      // Check if already verified
      if (user.isVerified) {
        res.status(200).json({ 
          success: true, 
          message: "Email already verified." 
        });
        return;
      }
  
      // Check verification code
      if (user.verificationCode !== code) {
        res.status(400).json({ 
          success: false, 
          message: "Invalid verification code." 
        });
        return;
      }
  
      // Mark user as verified and clear the code
      user.isVerified = true;
      user.verificationCode = '';
      await user.save();
  
      // Generate a JWT for the user if needed for immediate login
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          camp: user.camp,
          role: user.role,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "3d" }
      );
  
      res.status(200).json({ 
        success: true, 
        message: "Email verified successfully.",
        token, // Send token for auto-login
      });
    } catch (error) {
      console.error("OTP verification error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error." 
      });
    }
  };
  
  // Handler to resend OTP code
  export const resendOTPHandler = async (req: Request, res: Response): Promise<void> => {
    const { userId, email } = req.body;
  
    if (!userId) {
      res.status(400).json({ 
        success: false, 
        message: "User ID is required." 
      });
      return;
    }
  
    try {
      const user = await UserModel.findById(userId);
      
      if (!user) {
        res.status(404).json({ 
          success: false, 
          message: "User not found." 
        });
        return;
      }
  
      // Check if already verified
      if (user.isVerified) {
        res.status(400).json({ 
          success: false, 
          message: "Email already verified." 
        });
        return;
      }
  
      // Generate and save new verification code
      const newCode = generateVerificationCode();
      user.verificationCode = newCode;
      await user.save();
  
      // Send verification email
      try {
        await sendVerificationEmail(user.email, newCode);
        console.log(`New verification code sent to ${user.email}: ${newCode}`);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        res.status(500).json({ 
          success: false, 
          message: "Failed to send verification email. Please try again." 
        });
        return;
      }
  
      res.status(200).json({ 
        success: true, 
        message: "New verification code sent to your email." 
      });
    } catch (error) {
      console.error("Resend OTP error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error." 
      });
    }
  };
  
  export const registerHandler = async (req: Request, res: Response): Promise<void> => {
    // Handle both formats of data (direct or nested)
    const userData = req.body.user || req.body;
  
    const { email, first_name, last_name, phone, countryCode, camp, role = 'parent' } = userData;
  
    // Required fields check
    if (!email || !camp || !role) {
      res.status(400).json({ status: 'error', message: 'Email, camp, and role are required.' });
      return;
    }
  
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ status: 'error', message: 'Invalid email format.' });
      return;
    }
  
    // Generate verification code
    const verificationCode = generateVerificationCode();
  
    // Normalize undefined fields
    const sanitizedUserData = {
      email: email.trim().toLowerCase(),
      first_name: first_name?.trim() || '',
      last_name: last_name?.trim() || '',
      phone: phone?.trim() || '',
      countryCode: countryCode?.trim() || '',
      camp: camp.trim(),
      role: role.trim(),
      verificationCode,
      verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000), // Code expires in 10 minutes
      isVerified: false,
    };
  
    try {
      // Check if user already exists
      const existingUser = await UserModel.findOne({
        email: sanitizedUserData.email,
        camp: sanitizedUserData.camp,
      });
      if (existingUser) {
        res.status(400).json({
          status: 'error',
          message: 'User with this email and camp already exists.',
          user: { email: existingUser.email, camp: existingUser.camp },
        });
        return;
      }
  
      // Create and save new user
      const newUser = new UserModel(sanitizedUserData);
      await newUser.save();
  
      // Send verification email
      try {
        await sendVerificationEmail(sanitizedUserData.email, verificationCode, sanitizedUserData.first_name);
        console.log(`Verification code sent to ${sanitizedUserData.email}: ${verificationCode}`);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        // Optionally inform the client to retry or contact support
        res.status(201).json({
          status: 'success',
          message:
            'User registered successfully, but there was an issue sending the verification email. Please use /resend-otp to request a new code.',
          user: {
            id: newUser._id,
            email: sanitizedUserData.email,
            camp: sanitizedUserData.camp,
            role: sanitizedUserData.role,
          },
        });
        return;
      }
  
      res.status(201).json({
        status: 'success',
        message: 'User registered successfully. Please check your email for the verification code.',
        user: {
          id: newUser._id,
          email: sanitizedUserData.email,
          camp: sanitizedUserData.camp,
          role: sanitizedUserData.role,
        },
      });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
  };
  export const verifyEmailHandler = async (req: Request, res: Response): Promise<void> => {
    const { userId, code } = req.body;
  
    if (!userId || !code) {
      res.status(400).json({ status: 'error', message: 'User ID and code are required.' });
      return;
    }
  
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({ status: 'error', message: 'User not found.' });
        return;
      }
  
      if (user.isVerified) {
        res.status(400).json({ status: 'error', message: 'Email already verified.' });
        return;
      }
  
      if (user.verificationCode !== code) {
        res.status(400).json({ status: 'error', message: 'Invalid verification code.' });
        return;
      }
  
      user.isVerified = true;
      user.verificationCode = '';
      await user.save();
  
      console.log(`Email verified for user ID: ${userId}`);
      res.status(200).json({ status: 'success', message: 'Email verified successfully.' });
    } catch (error) {
      console.error('Verification error:', error);
      res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
  };

// Handler function for resending verification code
// export const resendVerificationCodeHandler = async (req: Request, res: Response): Promise<void> => {
//   const { email, camp } = req.body;

//   // Required fields check
//   if (!email || !camp) {
//     res.status(400).json({ status: "error", message: "Email and camp are required." });
//     return;
//   }

//   try {
//     const user = await UserModel.findOne({ email: email.trim().toLowerCase(), camp: camp.trim() });
//     if (!user) {
//       res.status(404).json({ status: "error", message: "User not found." });
//       return;
//     }

//     if (user.isVerified) {
//       res.status(400).json({ status: "error", message: "Email already verified." });
//       return;
//     }

//     // Generate and save new verification code
//     const newCode = generateVerificationCode();
//     user.verificationCode = newCode;
//     await user.save();

//     // Send new verification email
//     await sendVerificationEmail(user.email, newCode);

//     res.status(200).json({ status: "success", message: "New verification code sent." });
//   } catch (error) {
//     console.error("Resend code error:", error);
//     res.status(500).json({ status: "error", message: "Internal server error." });
//   }
// };

// Handler function for logging in a user
export const loginHandler = async (req: Request, res: Response): Promise<void> => {
  const { email, camp } = req.body;
  // Check if email exists
  if (!email) {
    res.status(400).json({ status: "error", message: "Email is required." });
    return;
  }

  try {
    // Query for user
    let query: any = { email: email.trim().toLowerCase() };
    if (camp) {
      query.camp = camp.trim();
    }

    const user = await UserModel.findOne(query);
    if (!user) {
      res.status(404).json({
        status: "error",
        message: "User not found. Please check your email or register.",
      });
      return;
    }

    // Check if user is verified
    if (!user.isVerified) {
      res.status(403).json({
        status: "error",
        message: "Email not verified. Please verify your email to log in.",
      });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        camp: user.camp,
        role: user.role,
        canPost: user.canPost,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "3d" }
    );

    res.status(200).json({
      status: "success",
      message: "User logged in successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        camp: user.camp,
        role: user.role,
        canPost: user.canPost,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ status: "error", message: "Internal server error." });
  }
};