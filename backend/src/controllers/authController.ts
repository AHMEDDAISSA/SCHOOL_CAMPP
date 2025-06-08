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
          canPost: user.canPost,
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
  
  // Handler to resend OTP code - UPDATED VERSION
  export const resendOTPHandler = async (req: Request, res: Response): Promise<void> => {
  const { userId, email } = req.body;

  // Check if we have at least the userId or email
  if (!userId && !email) {
    res.status(400).json({ 
      status: 'error', 
      message: "User ID or email is required." 
    });
    return;
  }

  try {
    // Initialize user variable
    let user: IUser | null = null;
    
    // First try to find by userId if provided
    if (userId) {
      user = await UserModel.findById(userId);
    }
    
    // If user not found by ID and we have an email, try to find by email
    if (!user && email) {
      user = await UserModel.findOne({ email: email.trim().toLowerCase() });
      if (!user) {
        res.status(404).json({ 
          status: 'error', 
          message: "User not found with the provided email." 
        });
        return;
      }
    } else if (!user) {
      // If we still don't have a user, return 404
      res.status(404).json({ 
        status: 'error', 
        message: "User not found." 
      });
      return;
    }

    // Check if already verified
    if (user.isVerified) {
      res.status(400).json({ 
        status: 'error', 
        message: "Email already verified." 
      });
      return;
    }

    // Generate new verification code
    const newCode = generateVerificationCode();
    
    // Update user with new code - Using updateOne instead of save()
    await UserModel.updateOne(
      { _id: user._id },
      { 
        $set: { 
          verificationCode: newCode,
          verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiration
        } 
      }
    );

    // Send verification email
    try {
      // Use first_name if available for personalized emails
      await sendVerificationEmail(user.email, newCode, user.first_name || '');
      console.log(`New verification code sent to ${user.email}: ${newCode}`);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      res.status(500).json({ 
        status: 'error', 
        message: "Failed to send verification email. Please try again." 
      });
      return;
    }

    res.status(200).json({ 
      status: 'success', 
      message: "New verification code sent to your email." 
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ 
      status: 'error', 
      message: "Internal server error." 
    });
  }
};
  
  export const registerHandler = async (req: Request, res: Response): Promise<void> => {
  // Handle both formats of data (direct or nested)
  const userData = req.body.user || req.body;

  const { email, first_name, last_name, phone, countryCode, camp, role } = userData;

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

  // **NOUVEAU : Gérer l'image de profil uploadée**
  const uploadedFile = req.file as Express.Multer.File;
  let profileImageData = {};
  
  if (uploadedFile) {
    profileImageData = {
      profileImage: uploadedFile.filename
    };
  }

  // Normalize undefined fields
  const sanitizedUserData = {
    email: email.trim().toLowerCase(),
    first_name: first_name?.trim() || '',
    last_name: last_name?.trim() || '',
    phone: phone?.trim() || '',
    countryCode: countryCode?.trim() || '',
    camp: camp.trim(),
    role: role.trim(),
    lastUpdated: new Date().toISOString(),
    // *** AJOUT : Définir canPost selon le rôle ***
    canPost: role.trim() === 'parent' ? false : true, // Les parents doivent être approuvés, les autres rôles peuvent poster
    ...profileImageData // **NOUVEAU : Ajouter les données d'image**
  };

  try {
    // Check if user already exists
    const existingUser = await UserModel.findOne({
      email: sanitizedUserData.email,
      camp: sanitizedUserData.camp,
    });
    
    if (existingUser) {
      // Update existing user
      const updateData = {
        first_name: sanitizedUserData.first_name,
        last_name: sanitizedUserData.last_name,
        phone: sanitizedUserData.phone,
        countryCode: sanitizedUserData.countryCode,
        lastUpdated: sanitizedUserData.lastUpdated,
        isVerified: true,
        role: sanitizedUserData.role,
        // *** AJOUT : Préserver canPost existant ou mettre à jour selon le rôle ***
        canPost: sanitizedUserData.role === 'parent' ? existingUser.canPost : true,
        // **NOUVEAU : Mettre à jour l'image si fournie**
        ...(uploadedFile && { profileImage: uploadedFile.filename })
      };

      const updatedUser = await UserModel.findOneAndUpdate(
        { 
          email: sanitizedUserData.email,
          camp: sanitizedUserData.camp 
        },
        { $set: updateData },
        { new: true }
      );

      // **NOUVEAU : Construire l'URL complète de l'image**
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const userResponse = updatedUser?.toObject();
      
      if (userResponse?.profileImage) {
        userResponse.profileImageUrl = `${baseUrl}/uploads/${userResponse.profileImage}`;
      }
      
      res.status(200).json({
        status: 'success',
        message: 'User updated successfully.',
        user: {
          id: updatedUser?._id,
          email: sanitizedUserData.email,
          camp: sanitizedUserData.camp,
          role: updatedUser?.role,
          isVerified: updatedUser?.isVerified,
          canPost: updatedUser?.canPost, // *** AJOUT ***
          profileImage: updatedUser?.profileImage,
          profileImageUrl: userResponse?.profileImageUrl
        },
      });
      return;
    }

    // For new users
    const verificationCode = generateVerificationCode();
    const newUserData = {
      ...sanitizedUserData,
      verificationCode,
      verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
      isVerified: false,
    };

    const newUser = new UserModel(newUserData);
    await newUser.save();

    // **NOUVEAU : Construire l'URL complète de l'image pour nouveau utilisateur**
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const userObj = newUser.toObject();
    
    if (userObj.profileImage) {
      userObj.profileImageUrl = `${baseUrl}/uploads/${userObj.profileImage}`;
    }

    // Send verification email
    try {
      await sendVerificationEmail(newUserData.email, verificationCode, newUserData.first_name);
      console.log(`Verification code sent to ${newUserData.email}: ${verificationCode}`);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      res.status(201).json({
        status: 'success',
        message: 'User registered successfully, but there was an issue sending the verification email.',
        user: {
          id: newUser._id,
          email: newUserData.email,
          camp: newUserData.camp,
          role: newUserData.role,
          canPost: newUser.canPost, // *** AJOUT ***
          profileImage: newUser.profileImage,
          profileImageUrl: userObj.profileImageUrl
        },
      });
      return;
    }

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully. Please check your email for the verification code.',
      user: {
        id: newUser._id,
        email: newUserData.email,
        camp: newUserData.camp,
        role: newUserData.role,
        canPost: newUser.canPost, // *** AJOUT ***
        profileImage: newUser.profileImage,
        profileImageUrl: userObj.profileImageUrl
      },
    });
  } catch (error) {
    console.error('Error registering/updating user:', error);
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

// *** HANDLER DE CONNEXION MODIFIÉ AVEC VÉRIFICATION CANPOST ***
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

    const user = await UserModel.findOne(query).populate('camp');
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
        errorType: "EMAIL_NOT_VERIFIED"
      });
      return;
    }

    // *** VÉRIFICATION CANPOST - POINT CLÉ ***
    if (user.canPost === false) {
      res.status(403).json({
        status: "error",
        message: "Votre compte est en attente de validation par l'administrateur. Veuillez patienter.",
        errorType: "ACCOUNT_PENDING_VALIDATION",
        canPost: false
      });
      return;
    }

    // Generate JWT - Si canPost est true, continuer avec la connexion normale
    const token = jwt.sign(
      {
        userId: user._id,
        _id: user._id, // Ajouter _id aussi pour compatibilité
        email: user.email,
        camp: user.camp,
        role: user.role,
        canPost: user.canPost,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "3d" }
    );

    // Construire l'URL de l'image de profil
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const userObj = user.toObject();
    
    if (userObj.profileImage) {
      userObj.profileImageUrl = `${baseUrl}/uploads/${userObj.profileImage}`;
    }

    res.status(200).json({
      status: "success",
      message: "User logged in successfully",
      token,
      user: {
        id: user._id,
        _id: user._id,
        email: user.email,
        camp: user.camp,
        role: user.role,
        canPost: user.canPost,
        isVerified: user.isVerified,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        profileImage: user.profileImage,
        profileImageUrl: userObj.profileImageUrl,
        fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim()
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ 
      status: "error", 
      message: "Internal server error." 
    });
  }
};

// *** NOUVELLE FONCTION : LOGIN SIMPLE AVEC EMAIL SEULEMENT ***
export const loginWithEmailOnly = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  
  if (!email) {
    res.status(400).json({ 
      success: false,
      message: "Email is required." 
    });
    return;
  }

  try {
    // Rechercher l'utilisateur par email uniquement
    const user = await UserModel.findOne({ 
      email: { $regex: new RegExp(`^${email.trim()}$`, 'i') } 
    }).populate('camp');

    if (!user) {
      res.status(404).json({ 
        success: false,
        message: "User not found. Please check your email or register." 
      });
      return;
    }

    // Vérifier si l'email est vérifié
    if (!user.isVerified) {
      res.status(403).json({
        success: false,
        message: "Email not verified. Please verify your email to log in.",
        errorType: "EMAIL_NOT_VERIFIED"
      });
      return;
    }

    // *** VÉRIFICATION CANPOST PRINCIPALE ***
    if (user.canPost === false) {
      res.status(403).json({
        success: false,
        message: "Votre compte est en attente de validation par l'administrateur. Veuillez patienter.",
        errorType: "ACCOUNT_PENDING_VALIDATION",
        canPost: false
      });
      return;
    }

    // Générer le token JWT
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const token = jwt.sign(
      { 
        _id: user._id,
        userId: user._id,
        email: user.email,
        role: user.role,
        canPost: user.canPost,
        camp: user.camp
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Construire l'URL de l'image de profil
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const userObj = user.toObject();
    
    if (userObj.profileImage) {
      userObj.profileImageUrl = `${baseUrl}/uploads/${userObj.profileImage}`;
    }

    res.status(200).json({
      status: "success",
      success: true,
      message: "Connexion réussie",
      token,
      user: {
        ...userObj,
        id: user._id,
        fullName: `${userObj.first_name || ''} ${userObj.last_name || ''}`.trim()
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: "Erreur serveur lors de la connexion" 
    });
  }
};