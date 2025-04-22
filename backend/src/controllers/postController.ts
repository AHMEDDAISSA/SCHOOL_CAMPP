import { Request, Response } from "express";
import Post from "../models/Post";
import Category from "../models/Category";
import Camp from "../models/Camp";
import { PostType } from "../types/postTypes";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const createPost = async (req: Request<{}, {}, PostType>, res: Response) => {
    try {
        const { email, title, description, category, published_by,camp,is_published= true,contact_info ,type} = req.body;
        const newPost = new Post({ email, title, description, category, published_by,camp,is_published,contact_info,type });

        await newPost.save();

        res.status(201).json(newPost);

    } catch (error) {
        res.status(500).json({ message: "Error creating post", error });

    }

};

export const getPosts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { search, category, camp, page = "1", limit = "10" } = req.query;
        const query: any = {};
        if (search) {
            const searchWords = (search as string).split(" "); // Split search into words
            const wordConditions = searchWords.map(word => ({
                $or: [
                    { title: { $regex: word, $options: "i" } },
                    { description: { $regex: word, $options: "i" } },
                ],
            }));
            query.$and = wordConditions; // All words must match somewhere
        }
        // Filter by category
        if (category) {
            const categoryDoc = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, "i") } });
            if (!categoryDoc) {
                res.status(404).json({ message: "Category not found" });
                return;
            }
            query.category = categoryDoc._id;
        }

        // Filter by camp
        if (camp) {
            const campDoc = await Camp.findOne({ type: { $regex: new RegExp(`^${camp}$`, "i") } });
            if (!campDoc) {
                res.status(404).json({ message: "Camp not found" });
                return;
            }
            query.camp = campDoc._id;
        }
        // Pagination
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        const posts = await Post.find(query)
            .populate("published_by")
            .populate("category")
            .populate("camp")
            .skip(skip)
            .limit(limitNum);

        const totalPosts = await Post.countDocuments(query);

        res.status(200).json({
            posts,
            totalPosts,
            currentPage: pageNum,
            totalPages: Math.ceil(totalPosts / limitNum),
        });
    } catch (error) {
        console.log({ message: "Error fetching posts", error });
    }
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const getPostById = async (req: Request<{},{},{id:string}>, res: Response): Promise<void> => {
    try {
        const post = await Post.findById(req.body.id).populate("published_by");
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
export const deletePost = async (req: Request<{},{},{id:string}>, res: Response):Promise<void> => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.body.id);
        if (!deletedPost)  res.status(404).json({ message: "Post not found" });
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting post", error });
    }
};
