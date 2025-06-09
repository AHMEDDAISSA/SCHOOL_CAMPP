import express from 'express'
import { getStats, resetPosts } from '../controllers/adminController';
import { resetSystemAnnual } from "../controllers/adminController";


const router = express.Router();
router.get("/stats", getStats);
router.get("/reset", resetPosts);

router.post("/reset-annual", resetSystemAnnual);

export default router;
