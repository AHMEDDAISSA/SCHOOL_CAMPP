import express from "express";
import { createPost, getPosts } from "../controllers/postController";
import { getPostById , updatePost, deletePost} from "../controllers/postController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/add", authenticateToken, createPost);
router.get("/get", authenticateToken, getPosts);
router.get("/get", authenticateToken, getPostById);
router.put("/update", authenticateToken, updatePost);
router.delete("/delete", authenticateToken, deletePost);


export default router;
