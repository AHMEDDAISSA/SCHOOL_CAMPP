import express from "express";
import { createPost, getPosts } from "../controllers/postController";
import { getPostById , updatePost, deletePost} from "../controllers/postController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/add",  createPost);
router.get("/get", getPosts);
router.get("/get/:id", getPostById);
//router.get("/get",authenticateToken, getPostById);
router.put("/update/:id", updatePost);
router.delete("/delete/:id", deletePost);


export default router;
