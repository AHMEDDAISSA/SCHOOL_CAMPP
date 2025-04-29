// types/userTypes.ts
import { Document, Types } from 'mongoose';

export interface IUser {
    _id?: Types.ObjectId;
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    countryCode?: string; // Optional, as per reference solution
    camp: string;
    role: string;
    canPost?: boolean;
    verificationCode?: string | null;
    verificationCodeExpires?: Date; 
    isVerified: boolean;
    // Add other fields as needed
  }