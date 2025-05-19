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
  
  
export const addUser = async (req: Request<{}, {}, { email: string }>, res: Response): Promise<void> => {
    try {
        // Extract the email from the request body
        const { email } = req.body;

        // Check if email is provided
        if (!email) {
            res.status(400).json({ message: "Please provide an email" });
            return;
        }

        // Check if the email already exists in the database
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "Email is already in use" });
            return;
        }

        // Create a new user with just the email
        const newUser = new UserModel({
            email
        });

        // Save the user to the database
        await newUser.save();

        // Respond with a success message
        res.status(201).json({ message: "User added successfully", user: newUser });
    } catch (error) {
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
        const user = await UserModel.findById(req.body.userId).populate('camp');
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user", error });
    }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if the user is an admin (if you have auth middleware)
    // Uncomment if you have auth middleware and want to check admin status
    // if (req.user?.role !== "admin") {
    //     res.status(403).json({ message: "Admin access required" });
    //     return;
    // }

    const users = await User.find().sort({ createdAt: -1 }).populate('camp');
    
    // Transform the data as needed
    const transformedUsers = users.map(user => ({
      _id: user._id,
      email: user.email,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      fullName: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email.split('@')[0],
      phone: user.phone || "",
      camp: user.camp,
      role: user.role,
      canPost: user.canPost,
      isVerified: user.isVerified,
      status: user.isVerified ? "active" : "pending", // Map isVerified to status for frontend
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
    
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
        });
      
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      res.status(200).json(user);
    } catch (error: any) {
      console.error('Error fetching user:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
};