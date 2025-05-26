import { Response, Request } from "express";
import UserModel from "../models/User";
import { IUser } from "../types/userTypes";
import User from '../models/user1';
//get all users
// eslint-disable-next-line @typescript-eslint/no-empty-object-type

// In userController.ts
// export const getUserByEmail = async (req: Request, res: Response): Promise<void> => {
//     // For GET requests, the email is in req.query
//     const { email } = req.query;
//     console.log('Getting user by email:', email);
    
//     try {
//       if (!email) {
//         res.status(400).json({ message: 'Email is required' });
        
//         return;
//       }
//       console.log(email)
// // Make email comparison case-insensitive
// const user = await User.findOne({ 
//     email: { $regex: new RegExp(`^${email}$`, 'i') } 
//   });
//         if (!user) {
//         res.status(404).json({ message: 'User not found' });
//         return;
//       }
      
  
//       res.status(200).json(user);
//     } catch (error: any) {
//       console.error('Error fetching user:', error.message);
//       res.status(500).json({ message: 'Server error' });
//     }
//   };
  
  
export const addUser = async (req: Request<{}, {}, any>, res: Response): Promise<void> => {
    try {
        // Extract all fields from the request body
        const { 
            email, 
            first_name, 
            last_name, 
            phone, 
            camp, 
            role, 
            canPost,
            verificationCode,
            isVerified 
        } = req.body;

        // Check if email is provided
        if (!email) {
            res.status(400).json({ message: "Please provide an email" });
            return;
        }

        // Check if the email already exists in the database
        const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(400).json({ message: "Email is already in use" });
            return;
        }

        // Handle profile image upload
        const uploadedFiles = req.files as Express.Multer.File[] || [];
        const uploadedFile = req.file as Express.Multer.File; // For single file upload
        
        let profileImageData = {};
        
        // Check if there's an uploaded profile image
        if (uploadedFile) {
            profileImageData = {
                profileImage: uploadedFile.filename
            };
        } else if (uploadedFiles.length > 0) {
            // If using array upload, take the first image as profile image
            profileImageData = {
                profileImage: uploadedFiles[0].filename
            };
        }

        // Create a new user with all provided data
        const newUserData = {
            email: email.toLowerCase(),
            first_name: first_name || '',
            last_name: last_name || '',
            phone: phone || '',
            camp,
            role,
            canPost: canPost || false,
            verificationCode: verificationCode || null,
            isVerified: isVerified !== undefined ? isVerified : true,
            ...profileImageData // Add profile image data if available
        };

        const newUser = new UserModel(newUserData);

        // Save the user to the database
        await newUser.save();

        // Transform the response to include full image URL
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const userObj = newUser.toObject();
        
        if (userObj.profileImage) {
            userObj.profileImageUrl = `${baseUrl}/uploads/${userObj.profileImage}`;
        }

        // Respond with a success message
        res.status(201).json({ 
            message: "User added successfully", 
            user: userObj 
        });
    } catch (error) {
        console.error("Error in addUser:", error);
        res.status(500).json({ message: "Error adding user", error });
    }
};


export const getUsers = async (req: Request<{},{},{user:IUser}>, res: Response): Promise<void> => {
    try {
        if (req.body.user?.role !== "admin") {
            res.status(403).json({ message: "Admin access required" });
            return;
        }
        const users = await UserModel.find().populate('camp');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error });
    }
};

export const getUser = async (req: Request<{},{},{userId:string}>, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.body.userId).populate('camp');
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Transformer l'URL de l'image de profil
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const userObj = user.toObject();
        
        if (userObj.profileImage) {
            userObj.profileImageUrl = `${baseUrl}/uploads/${userObj.profileImage}`;
        }

        res.status(200).json(userObj);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user", error });
    }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Débogage - vérifier l'authentification
    console.log('Auth header:', req.headers.authorization);
    
    // Récupérer tous les utilisateurs
    const users = await User.find().sort({ createdAt: -1 }).populate('camp');
    
    console.log(`Nombre d'utilisateurs trouvés: ${users.length}`);
    
    // Transformer les données pour inclure les URL complètes des images de profil
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    const transformedUsers = users.map(user => {
        const userObj = user.toObject();
        
        // Transformer l'image de profil en URL complète
        if (userObj.profileImage) {
            userObj.profileImageUrl = `${baseUrl}/uploads/${userObj.profileImage}`;
        }
        
        return userObj;
    });
    
    // Renvoyer les données
    res.status(200).json(transformedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching users", 
      error: (error as Error).message 
    });
  }
};

export const updateUserStatus = async (req: Request<{id: string}, {}, {status: string}>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['active', 'pending'].includes(status)) {
      res.status(400).json({
        success: false,
        message: "Status invalide. Utilisez 'active' ou 'pending'"
      });
      return;
    }
    
    // For our schema, 'active' maps to isVerified=true and 'pending' maps to isVerified=false
    const isVerified = status === 'active';
    
    const user = await User.findById(id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
      return;
    }
    
    user.isVerified = isVerified;
    // If you're approving a user, you might want to enable post permission
    if (isVerified) {
      user.canPost = true;
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `Statut d'utilisateur mis à jour avec succès: ${status}`,
      user: {
        _id: user._id,
        email: user.email,
        isVerified: user.isVerified,
        canPost: user.canPost,
        status: isVerified ? 'active' : 'pending',
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user status",
      error: (error as Error).message
    });
  }
};
export const deleteUser = async (req: Request<{id: string}>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const result = await User.findByIdAndDelete(id);
    
    if (!result) {
      res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: "Utilisateur supprimé avec succès"
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: (error as Error).message
    });
  }
};

// Existing functions
export const getUserByEmail = async (req: Request, res: Response): Promise<void> => {
    // For GET requests, the email is in req.query
    const { email } = req.query;
    console.log('Getting user by email:', email);
    
    try {
      if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
      }
      console.log(email)
      // Make email comparison case-insensitive
      const user = await User.findOne({ 
          email: { $regex: new RegExp(`^${email}$`, 'i') } 
        }).populate('camp');
      
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Transformer l'URL de l'image de profil
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const userObj = user.toObject();
      
      if (userObj.profileImage) {
          userObj.profileImageUrl = `${baseUrl}/uploads/${userObj.profileImage}`;
      }
      
      res.status(200).json(userObj);
    } catch (error: any) {
      console.error('Error fetching user:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
};

export const updateUserProfile = async (req: Request<{id: string}, {}, any>, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updateFields = req.body;
        
        console.log("Backend - ID:", id);
        console.log("Backend - UpdateFields:", updateFields);
        
        // Vérifier si l'ID est valide
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            res.status(400).json({ 
                success: false,
                message: "ID invalide" 
            });
            return;
        }

        // Vérifier si des fichiers ont été uploadés
        const uploadedFiles = req.files as Express.Multer.File[] || [];
        let updateData = { ...updateFields };
        
        // Gérer l'image de profil
        if (uploadedFiles.length > 0) {
            // Prendre seulement le premier fichier pour l'image de profil
            updateData.profileImage = uploadedFiles[0].filename;
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        ).populate('camp');
        
        if (!updatedUser) {
            res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
            return;
        }

        // Transformer l'URL de l'image de profil
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const userObj = updatedUser.toObject();
        
        if (userObj.profileImage) {
            userObj.profileImageUrl = `${baseUrl}/uploads/${userObj.profileImage}`;
        }
        
        res.status(200).json({
            success: true,
            message: "Profil utilisateur mis à jour avec succès",
            user: userObj
        });
    } catch (error) {
        console.error("Error in updateUserProfile:", error);
        res.status(500).json({ 
            success: false,
            message: "Erreur lors de la mise à jour du profil utilisateur", 
            error 
        });
    }
};