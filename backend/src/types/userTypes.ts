// types/userTypes.ts
import { Document, Types } from 'mongoose';

export interface IUser extends Document {
    email: string
    first_name?: string
    last_name?: string
    phone?: number
    camp: string
    role: 'viewer' | 'poster' | 'admin'
}
