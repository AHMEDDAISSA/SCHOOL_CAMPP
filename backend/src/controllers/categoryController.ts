import { Request, Response } from "express";
import Category from "../models/Category";
import { CategoryType } from "../types/categoryType";


// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const createCategory = async (req: Request<{}, {}, CategoryType>, res: Response): Promise<void> => {
    try {
        const { name } = req.body;

        if (!name) {
            res.status(400).json({ error: "Category name must be a valid string" });
            return;
        }

        const category = new Category({ name });
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: "Internal server error",error });
    }
};


export const getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const categories = await Category.find().populate("published_by");

        if (!categories.length) {
            res.status(404).json({ message: "No categories found" });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            categories,
        });
    } catch (error) {
        console.error("Error fetching categories:", error);

        res.status(500).json({
            success: false,
            message: "Error fetching categories",
            error
        });
    }
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const getCategoryById = async (req: Request<{},{},{id:string}>, res: Response): Promise<void> => {
    try {
        const category = await Category.findById(req.body.id).populate("published_by");
        if (!category) {
            res.status(404).json({ message: "Category not found" });
            return;
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: "Error fetching category", error });
    }
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const updateCategory = async (req: Request <{},{},{id:string}>, res: Response): Promise<void>=> {
    try {
        const updateCategory = await Category.findByIdAndUpdate(req.body.id, req.body, { new: true });
        if (!updateCategory)  res.status(404).json({ message: "CAtegory not found" });
        res.status(200).json(updateCategory);
    } catch (error) {
        res.status(500).json({ message: "Error updating category", error });
    }
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const deleteCategory = async (req: Request<{},{},{id:string}>, res: Response):Promise<void> => {
    try {
        const deleteCategory = await Category.findByIdAndDelete(req.body.id);
        if (!deleteCategory)  res.status(404).json({ message: "Post not found" });
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting category", error });
    }
};
