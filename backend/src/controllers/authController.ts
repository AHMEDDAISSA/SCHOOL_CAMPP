import { Response, Request } from "express";
import UserModel from "../models/User";
import { IUser } from "../types/userTypes";
import jwt from "jsonwebtoken";

// Handler function for registering a new user
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const registerHandler = async (req: Request<{},{},{user:IUser}>, res: Response): Promise<void> => {
    const { email, first_name, last_name, phone, camp, role = "parent" } = req.body.user;

    // Required fields check
    if (!email || !camp || !role) {
        res.status(400).json({ status: "error", message: "Email, camp, and role are required." });
        return;
    }

    // Normalize undefined fields to empty strings
    const sanitizedUserData = {
        email: email.trim().toLowerCase(),
        first_name: first_name?.trim() || "",
        last_name: last_name?.trim() || "",
        phone: phone || "",
        camp: camp,
        role,
    };

    try {
        // Check if user already exists
        const existingUser = await UserModel.findOne({ email: sanitizedUserData.email, camp: sanitizedUserData.camp });
        if (existingUser) {
            res.status(400).json({
                status: "error",
                message: "User with this email and camp already exists.",
                user: { email: existingUser.email, camp: existingUser.camp }
            });
            return;
        }

        // Create and save new user
        const newUser = new UserModel(sanitizedUserData);
        await newUser.save();

        res.status(201).json({
            status: "success",
            message: "User registered successfully.",
            user: { email: sanitizedUserData.email, camp: sanitizedUserData.camp, role: sanitizedUserData.role }
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ status: "error", message: "Internal server error." });
    }
};
// Handler function for logging in a user
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const loginHandler = async (req: Request<{},{},{user:IUser}>, res: Response): Promise<void> => {
    const { email, camp } = req.body.user;
    if(!email || !camp) {
        res.status(400).send('Email and camp are required');
        return;
    }
    try {
        // Find user by email and camp
        const user = await UserModel.findOne({ email, camp });
        if (!user) {
            res.status(400).send('User not found');
            return;
        }

        // Generate a JWT with the user's actual role
        const token = jwt.sign(
            { userId: user._id, email: user.email, camp: user.camp, role: user.role,  canPost: user.canPost },
            process.env.JWT_SECRET as string,
            { expiresIn: '3d' }
        );

        res.status(200).json({
            status: "success",
            message: "User logged in successfully",
            token: token,
            user: {
                ...user.toObject(),
                role: user.role,
                canPost: user.canPost
            }
        });
    } catch (error) {
        console.log("Error logging in user:", error);
        res.status(500).send('Error logging in user');
    }
};
