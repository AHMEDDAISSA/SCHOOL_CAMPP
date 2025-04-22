import express from "express";
import { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory } from "../controllers/categoryController";

const router = express.Router();

router.post("/add", createCategory);
router.get("/get", getCategories);
router.get("/get/", getCategoryById);
router.put("/put/", updateCategory);
router.delete("/del/", deleteCategory);

export default router;
