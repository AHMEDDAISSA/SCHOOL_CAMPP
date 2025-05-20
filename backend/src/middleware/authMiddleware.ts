// middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../types/userTypes';

// Extend the Request type to include a `user` property
export interface AuthRequest extends Request {
    user?: IUser;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expecting 'Bearer <token>'

    if (!token) {
        res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
        return;
    }
    
    // Verify the token
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }
        
        const decoded = jwt.verify(token, secret);
        req.user = decoded as IUser; // Attach decoded user data to the request
        next(); // Proceed to the route handler
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(403).json({ success: false, message: 'Invalid or expired token.' });
        return;
    }
};