// // controllers/contactController.js
// import { Request, Response } from "express";
// import Contact from "../models/Contact";
// import Post from "../models/Post";
// import getContactInfo from "../models/Contact"

// export const initiateContact = async (req: Request, res: Response) => {
//   try {
//     const { postId, buyerEmail, contactMethod } = req.body;
//     const post = await Post.findById(postId);
    
//     if (!post) {
//       return res.status(404).json({ message: "Annonce non trouvée" });
//     }
    
//     const existingContact = await Contact.findOne({ 
//       postId, 
//       buyerId: buyerEmail, 
//       status: { $in: ['active', 'initiated'] } 
//     });
    
//     if (existingContact) {
//       return res.status(200).json({ 
//         message: "Contact déjà initié", 
//         contact: existingContact 
//       });
//     }
    
//     // Créer un nouveau contact
//     const newContact = new Contact({
//       postId,
//       buyerId: buyerEmail,
//       sellerId: post.email,
//       contactMethod,
//       status: 'active'
//     });
    
//     await newContact.save();
    
//     // Mettre à jour le statut de l'annonce
//     await Post.findByIdAndUpdate(postId, { 
//       $push: { activeContacts: newContact._id }, 
//       contactStatus: 'in_contact' 
//     });
    
//     res.status(201).json({ 
//       message: "Contact initié avec succès", 
//       contact: newContact, 
//       contactInfo: getContactInfo(post, contactMethod)
//     });
//   } catch (error) {
//     console.error("Erreur lors de l'initiation du contact:", error);
//     res.status(500).json({ message: "Erreur serveur" });
//   }
// };