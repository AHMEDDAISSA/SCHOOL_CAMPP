// models/Contact.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const ContactSchema = new mongoose.Schema({
    postId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Post',
        required: true 
    },
    sellerEmail: {  // Corrigé : était 'sellerId'
        type: String,
        required: true 
    },
    buyerEmail: {   // Corrigé : était 'buyerId'
        type: String,
        required: true 
    },
    contactMethod: {
        type: String,
        enum: ['app', 'email', 'phone'],
        default: 'app'
    },
    messages: [{
        senderEmail: String,  // Corrigé : était 'senderId'
        content: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        read: {
            type: Boolean,
            default: false
        }
    }],
    status: {
        type: String,
        enum: ['active', 'closed', 'completed'],
        default: 'active'
    },
    // Nouveau : informations sur l'annonce pour l'affichage
    postTitle: String,
    postImage: String
}, { timestamps: true });

const Contact = mongoose.model('Contact', ContactSchema);

export default Contact;
