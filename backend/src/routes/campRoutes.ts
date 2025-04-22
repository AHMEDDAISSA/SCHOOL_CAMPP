// camp routes
import express from "express";
import { addCamp } from "../controllers/campController";
const router = express.Router();

router.post('/addCamp', addCamp);

export default router;
