import { Request, Response } from "express";
import Post from "../models/Post";
import { IUser } from "../types/userTypes";
import mongoose from "mongoose";

//getting post related stats like total posts, posts by category and posts by type
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const getStats = async (req: Request<{},{},{user: IUser}>, res: Response):Promise<void> => {
    try {
        if (req.body.user?.role !== "admin") {
            res.status(403).json({ message: "Admin access required" });
            return;
        }

        const totalPosts = await Post.countDocuments({});
        const postsByCategory = await Post.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "category" } },
            { $unwind: "$category" },
            { $project: { name: "$category.name", count: 1 } },
        ]);
        const postsByType = await Post.aggregate([
            { $group: { _id: "$type", count: { $sum: 1 } } },
        ]);

        const stats = {
            totalPosts,
            postsByCategory, // e.g., [{ name: "tech", count: 2 }, ...]
            postsByType,     // e.g., [{ _id: "article", count: 2 }, ...]
        };

        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: "Error fetching stats", error });
    }
};

//resetting db by achiving posts into another collection and deleting from main db
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const resetPosts = async (req: Request<{},{},{user: IUser}>, res: Response):Promise<void> => {
    try {
        // Check if user is admin (assuming authMiddleware sets req.user)
        if (req.body.user?.role !== "admin") {
            res.status(403).json({ message: "Admin access required" });
            return;
        }

        //Archive posts to a separate collection
        const posts = await Post.find({});
        if (posts.length > 0) {
            const archiveCollection = mongoose.connection.collection("archived_posts");
            await archiveCollection.insertMany(posts.map(post => post.toObject()));
            await Post.deleteMany({}); // Clear active posts after archiving
        }

        res.status(200).json({ message: "Posts reset successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error resetting posts", error });
    }
};
