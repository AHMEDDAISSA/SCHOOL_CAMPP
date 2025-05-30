import { Request, Response } from "express";
import Post from "../models/Post";
import Category from "../models/Category";
import Camp from "../models/Camp";
import { PostType } from "../types/postTypes";




const checkPostOwnership = async (req: Request, res: Response, postId: string, userEmail: string) => {
    try {
        console.log("Checking ownership for post:", postId, "user:", userEmail);
        
        const post = await Post.findById(postId);
        if (!post) {
            console.log("Post not found");
            return { authorized: false, message: "Post not found" };
        }
        
        console.log("Post email:", post.email);
        console.log("User email:", userEmail);
        
        // Normaliser les emails pour la comparaison (supprimer espaces, mettre en minuscules)
        const postEmail = post.email?.trim().toLowerCase();
        const requestUserEmail = userEmail?.trim().toLowerCase();
        
        if (postEmail !== requestUserEmail) {
            console.log("Email mismatch - Post:", postEmail, "User:", requestUserEmail);
            return { authorized: false, message: "Vous n'êtes pas autorisé à modifier cette annonce" };
        }
        
        console.log("Ownership verified successfully");
        return { authorized: true, post };
    } catch (error) {
        console.error("Error in checkPostOwnership:", error);
        return { authorized: false, message: "Erreur lors de la vérification" };
    }
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const createPost = async (req: Request<{}, {}, PostType>, res: Response) => {
    try {
        const { 
            email, 
            title, 
            description, 
            category, 
            published_by, 
            camp, 
            is_published = true, 
            contact_info, 
            type, 
            price,
            duration,
            // Nouveaux champs de contact
            preferredContact = 'email',
            contactEmail,
            contactPhone,
            contactName,
            showName = false,
            showPhone = false,
            showEmail = true
        } = req.body;
        
        const uploadedFiles = req.files as Express.Multer.File[] || [];
        const imageFilenames = uploadedFiles.map((file) => file.filename);
        
        const newPost = new Post({ 
            email, 
            title, 
            description, 
            category, 
            published_by, 
            camp,
            is_published, 
            contact_info, 
            type, 
            images: imageFilenames,
            price,
            duration,
            // Champs de contact
            preferredContact,
            contactEmail: contactEmail || email, // Utiliser l'email principal si pas d'email de contact
            contactPhone,
            contactName,
            showName,
            showPhone,
            showEmail
        });

        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (error) {
        console.error("Error in createPost:", error);
        res.status(500).json({ message: "Error creating post", error });
    }
};

interface TransformedPost {
    _id: string;
    email: string;
    title: string;
    description?: string;
    contact_info?: string;
    is_published: boolean;
    category: string;
    type: string;
    camp: string;
    published_by?: any;
    images: string[];
    imageUrl?: string; 
    [key: string]: any; 
}

export const getPosts = async (req: Request, res: Response) => {
    try {
        // Récupérer les paramètres de requête, mais ignorer la pagination
        const { search, category, camp } = req.query;
        
        // Construire la requête de filtrage
        const filter: any = {};
        
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (category) {
            filter.category = category;
        }
        
        if (camp) {
            filter.camp = camp;
        }
        
        // Récupérer TOUTES les annonces (sans skip/limit)
        const posts = await Post.find(filter)
            .sort({ createdAt: -1 }); // Trier par date de création (plus récent d'abord)
        
        // Compter le nombre total d'annonces
        const total = posts.length;
        
        // Transformer les données pour inclure les URL complètes des images
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        
        const transformedPosts = posts.map(post => {
            const postObj = post.toObject();
            
            // Transformer les images en URLs complètes
            if (postObj.images && Array.isArray(postObj.images)) {
                postObj.images = postObj.images.map((imageName: string) => 
                    `${baseUrl}/uploads/${imageName}`
                );
                
                // Définir aussi imageUrl pour la compatibilité
                if (postObj.images.length > 0) {
                    postObj.imageUrl = postObj.images[0];
                }
            }
            
            return postObj;
        });
        
        res.status(200).json({
            success: true,
            totalCount: total,
            posts: transformedPosts
        });
        
    } catch (error) {
        console.error("Erreur dans getPosts:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching posts", 
            error
        });
    }
};

// CORRECTION: getPostById
export const getPostById = async (req: Request<{id: string}, {}, {}>, res: Response): Promise<void> => {
    try {
        const post = await Post.findById(req.params.id).populate("published_by");
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }
        res.status(200).json(post);
    } catch (error) {
        console.error("Error in getPostById:", error);
        res.status(500).json({ message: "Error fetching post", error });
    }
};

// CORRECTION: updatePost
export const updatePost = async (req: Request<{id: string}, {}, any>, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { userEmail, ...updateFields } = req.body; // Changé ici
        
        console.log("Backend - ID:", id);
        console.log("Backend - UserEmail:", userEmail);
        console.log("Backend - UpdateFields:", updateFields);
        
        // Vérifier si l'ID est valide
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            res.status(400).json({ 
                success: false,
                message: "ID invalide" 
            });
            return;
        }

        // Vérifier si l'utilisateur est autorisé
        const ownershipCheck = await checkPostOwnership(req, res, id, userEmail);
        if (!ownershipCheck.authorized) {
            console.log("Ownership check failed:", ownershipCheck.message);
            res.status(403).json({ 
                success: false,
                message: ownershipCheck.message 
            });
            return;
        }
        
        // Vérifier si des fichiers ont été uploadés
        const uploadedFiles = req.files as Express.Multer.File[] || [];
        let updateData = { ...updateFields }; // Utiliser updateFields au lieu de req.body
        
        // Gérer les images existantes et nouvelles
        if (req.body.existingImages || uploadedFiles.length > 0) {
            let imageFilenames: string[] = [];
            
            // Ajouter les images existantes
            if (req.body.existingImages) {
                const existingImages = Array.isArray(req.body.existingImages) 
                    ? req.body.existingImages 
                    : [req.body.existingImages];
                imageFilenames = [...imageFilenames, ...existingImages];
            }
            
            // Ajouter les nouvelles images
            if (uploadedFiles.length > 0) {
                const newImageFilenames = uploadedFiles.map((file) => file.filename);
                imageFilenames = [...imageFilenames, ...newImageFilenames];
            }
            
            updateData.images = imageFilenames;
        }
        
        const updatedPost = await Post.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );
        
        if (!updatedPost) {
            res.status(404).json({ 
                success: false,
                message: "Post not found" 
            });
            return;
        }
        
        res.status(200).json({
            success: true,
            message: "Annonce mise à jour avec succès",
            post: updatedPost
        });
    } catch (error) {
        console.error("Error in updatePost:", error);
        res.status(500).json({ 
            success: false,
            message: "Erreur lors de la mise à jour de l'annonce", 
            error 
        });
    }
};

// CORRECTION: deletePost avec vérification du propriétaire
export const deletePost = async (req: Request<{ id: string }, {}, {}>, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { email: userEmail } = req.query; // Email passé en query parameter
        
        // Vérifier si l'ID est valide
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            res.status(400).json({ 
                success: false,
                message: "ID invalide" 
            });
            return;
        }

        // Vérifier si l'utilisateur est autorisé
        const ownershipCheck = await checkPostOwnership(req, res, id, userEmail as string);
        if (!ownershipCheck.authorized) {
            res.status(403).json({ 
                success: false,
                message: ownershipCheck.message 
            });
            return;
        }
        
        const deletedPost = await Post.findByIdAndDelete(id);
        
        if (!deletedPost) {
            res.status(404).json({ 
                success: false,
                message: "Post not found" 
            });
            return;
        }
        
        res.status(200).json({ 
            success: true,
            message: "Annonce supprimée avec succès",
            deletedPost: deletedPost
        });
    } catch (error) {
        console.error("Error in deletePost:", error);
        res.status(500).json({ 
            success: false,
            message: "Erreur lors de la suppression de l'annonce", 
            error 
        });
    }
};
