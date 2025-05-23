import express from "express";
import { createPost, getPosts } from "../controllers/postController";
import { getPostById, updatePost, deletePost } from "../controllers/postController";
import { authenticateToken } from "../middleware/authMiddleware";
import upload from "../middleware/upload";

const router = express.Router();

router.post("/add", upload.array('images'), createPost);
router.get("/get", getPosts);
// CORRECTION: Déplacer cette route à la fin des routes GET
router.put("/update/:id", upload.array('images'), updatePost);
router.delete("/delete/:id", deletePost);
router.get("/get/:id", getPostById); // <- Déplacer ici

export default router;
