import { Response, Request } from "express";
import UserModel from "../models/User";
import { IUser } from "../types/userTypes";
import User from '../models/user1';
//get all users
// eslint-disable-next-line @typescript-eslint/no-empty-object-type

// In userController.ts
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


export const getUsers = async (req: Request<{},{},{user:IUser}>, res: Response):Promise<void> =>{
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
}

//get one user with id
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
