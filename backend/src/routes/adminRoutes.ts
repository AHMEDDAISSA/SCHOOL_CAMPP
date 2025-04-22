import express from 'express'
import { getStats, resetPosts } from '../controllers/adminController';


const router = express.Router();
router.get("/stats", getStats);
router.get("/reset", resetPosts);

export default router;
