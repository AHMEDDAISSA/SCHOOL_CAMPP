import { Request, Response } from "express";
import Post from "../models/Post";
import Category from "../models/Category";
import Camp from "../models/Camp";
import { PostType } from "../types/postTypes";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const createPost = async (req: Request<{}, {}, PostType>, res: Response) => {
    try {
        const { email, title, description, category, published_by,camp,is_published= true,contact_info ,type} = req.body;
        const uploadedFiles = req.files as Express.Multer.File[] || [];
        const imageFilenames = uploadedFiles.map((file) => file.filename);
        const newPost = new Post({ email, title, description, category, published_by,camp,is_published,contact_info,type,images: imageFilenames });

        await newPost.save();

        res.status(201).json(newPost);

    } catch (error) {
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


// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const getPostById = async (req: Request<{id: string}, {}, {}>, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id).populate("published_by");
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Error fetching post", error });
  }
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const updatePost = async (req: Request <{},{},{id:string}>, res: Response): Promise<void>=> {
    try {
        const updatedPost = await Post.findByIdAndUpdate(req.body.id, req.body, { new: true });
        if (!updatedPost)  res.status(404).json({ message: "Post not found" });
        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: "Error updating post", error });
    }
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const deletePost = async (
    req: Request<{ id: string }, {}, {}>,
    res: Response
):Promise<void> => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (!deletedPost)  res.status(404).json({ message: "Post not found" });
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.log(req.params.id);
        
        res.status(500).json({ message: "Error deleting post", error });
    }
};
