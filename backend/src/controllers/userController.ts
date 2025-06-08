import { Response, Request } from "express";
import UserModel from "../models/User";
import { IUser } from "../types/userTypes";
import User from '../models/user1'; 
import path from "path";
import fs from "fs";

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

        if (!email) {
            res.status(400).json({ message: "Please provide an email" });
            return;
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await UserModel.findOne({ 
            email: email.toLowerCase(),
            camp: camp 
        });
        
        if (existingUser) {
            res.status(400).json({ message: "User already exists for this camp" });
            return;
        }

        // CORRECTION : Gérer correctement l'upload de fichier
        const uploadedFile = req.file as Express.Multer.File;
        
        let profileImageData = {};
        
        if (uploadedFile) {
            console.log('File uploaded:', {
                filename: uploadedFile.filename,
                originalname: uploadedFile.originalname,
                path: uploadedFile.path,
                size: uploadedFile.size
            });
            
            profileImageData = {
                profileImage: uploadedFile.filename
            };
        }

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
            ...profileImageData
        };

        console.log('Creating user with data:', newUserData);

        const newUser = new UserModel(newUserData);
        await newUser.save();

        // CORRECTION : Construire l'URL complète de l'image
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const userObj = newUser.toObject();
        
        if (userObj.profileImage) {
            userObj.profileImageUrl = `${baseUrl}/uploads/${userObj.profileImage}`;
            console.log('Profile image URL created:', userObj.profileImageUrl);
        }

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

        const userObj = user.toObject();
        
        // CORRECTION : Utiliser la fonction utilitaire
        userObj.profileImageUrl = getProfileImageUrl(req, userObj.profileImage);
        userObj.fullName = `${userObj.first_name || ''} ${userObj.last_name || ''}`.trim();

        res.status(200).json(userObj);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user", error });
    }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).populate('camp');
    
    const transformedUsers = users.map(user => {
        const userObj = user.toObject();
        
        // Construire l'URL de l'image de profil
        userObj.profileImageUrl = getProfileImageUrl(req, userObj.profileImage);
        userObj.fullName = `${userObj.first_name || ''} ${userObj.last_name || ''}`.trim();
        
        // Déterminer le statut basé sur canPost et isVerified
        if (!userObj.isVerified) {
          userObj.status = 'pending';
        } else if (userObj.canPost) {
          userObj.status = 'approved';
        } else {
          userObj.status = 'rejected';
        }
        
        return userObj;
    });
    
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
    
    console.log('Attempting to delete user with ID:', id);
    
    // Vérifier que l'ID est valide
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        message: "ID utilisateur invalide"
      });
      return;
    }
    
    const result = await User.findByIdAndDelete(id);
    
    if (!result) {
      res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
      return;
    }
    
    console.log('User deleted successfully:', result.email);
    
    res.status(200).json({
      success: true,
      message: "Utilisateur supprimé avec succès",
      deletedUser: {
        _id: result._id,
        email: result.email,
        first_name: result.first_name,
        last_name: result.last_name
      }
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de l'utilisateur",
      error: (error as Error).message
    });
  }
};

export const approveUser = async (req: Request<{id: string}>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
      return;
    }
    
    // Vérifier que c'est un parent
    if (user.role !== 'parent') {
      res.status(400).json({
        success: false,
        message: "Seuls les utilisateurs parents peuvent être approuvés/rejetés"
      });
      return;
    }
    
    // Approuver l'utilisateur : canPost = true, isVerified = true
    user.canPost = true;
    user.isVerified = true;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: "Utilisateur parent approuvé avec succès",
      user: {
        _id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        canPost: user.canPost,
        isVerified: user.isVerified,
        role: user.role,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'approbation de l'utilisateur",
      error: (error as Error).message
    });
  }
};

export const rejectUser = async (req: Request<{id: string}>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
      return;
    }
    
    // Vérifier que c'est un parent
    if (user.role !== 'parent') {
      res.status(400).json({
        success: false,
        message: "Seuls les utilisateurs parents peuvent être approuvés/rejetés"
      });
      return;
    }
    
    // Rejeter l'utilisateur : canPost = false (empêche publications et contact)
    user.canPost = false;
    user.isVerified = true; // Toujours vérifié mais sans droits de publication
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: "Utilisateur parent rejeté avec succès",
      user: {
        _id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        canPost: user.canPost,
        isVerified: user.isVerified,
        role: user.role,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error("Error rejecting user:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du rejet de l'utilisateur",
      error: (error as Error).message
    });
  }
};

const getProfileImageUrl = (req: Request, profileImage: string | undefined): string | null => {
    if (!profileImage) return null;
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // Si c'est déjà une URL complète, la retourner
    if (profileImage.startsWith('http')) {
        return profileImage;
    }
    
    // CORRECTION : Vérifier le chemin correct des uploads
    const uploadsPath = path.join(__dirname, '..', 'uploads');
    const filePath = path.join(uploadsPath, profileImage);
    
    console.log('Checking file path:', filePath);
    console.log('File exists:', fs.existsSync(filePath));
    
    if (fs.existsSync(filePath)) {
        const imageUrl = `${baseUrl}/uploads/${profileImage}`;
        console.log('Generated image URL:', imageUrl);
        return imageUrl;
    }
    
    console.log(`Profile image not found: ${filePath}`);
    return null;
};

export const getUserByEmail = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.query;
    
    try {
      if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
      }
      
      const user = await User.findOne({ 
          email: { $regex: new RegExp(`^${email}$`, 'i') } 
        }).populate('camp');
      
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const userObj = user.toObject();
      
      // CORRECTION : Construire l'URL de l'image de profil
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      if (userObj.profileImage) {
        userObj.profileImageUrl = `${baseUrl}/uploads/${userObj.profileImage}`;
      }
      
      userObj.fullName = `${userObj.first_name || ''} ${userObj.last_name || ''}`.trim();
      
      console.log('Sending user data with image URL:', userObj.profileImageUrl);
      
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