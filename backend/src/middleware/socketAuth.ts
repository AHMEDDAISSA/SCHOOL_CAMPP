import jwt from 'jsonwebtoken';
import User from '../models/User';

export const socketAuth = async (socket: any, next: any) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Token manquant'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await User.findById(decoded.userId || decoded.id);
    
    if (!user) {
      return next(new Error('Utilisateur non trouvé'));
    }

    socket.user = user;
    socket.userId = user._id.toString();
    next();
  } catch (error) {
    console.error('Erreur d\'authentification Socket:', error);
    next(new Error('Token invalide'));
  }
};