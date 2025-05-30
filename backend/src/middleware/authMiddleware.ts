import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

export interface AuthRequest extends Request {
    user?: {
        _id: string | Types.ObjectId;
        email: string;
        id?: string; // Parfois JWT utilise 'id' au lieu de '_id'
        [key: string]: any;
    };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ 
            success: false, 
            error: 'Token d\'accès requis'
        });
        return;
    }
    
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }
        
        const decoded = jwt.verify(token, secret) as any;
        
        // Normaliser l'ID utilisateur
        req.user = {
            ...decoded,
            _id: decoded._id || decoded.id || decoded.userId
        };
        
        // Debug log pour voir la structure du token
        console.log('Token décodé:', {
            decoded,
            userId: req.user?._id,
            hasId: !!req.user?._id, // Utiliser '?' pour éviter les erreurs si req.user est undefined
        });
        
        next();
    } catch (error) {
        console.error('Erreur de vérification du token:', error);
        res.status(403).json({ 
            success: false, 
            error: 'Token invalide ou expiré'
        });
        return;
    }
};
