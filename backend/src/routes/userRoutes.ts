import express from "express";
import { getUsers, getUser} from "../controllers/userController";
import { authenticateToken } from "../middleware/authMiddleware";
import { getUserByEmail } from "../controllers/userController";
import { addUser } from "../controllers/userController";
const router = express.Router();

router.post("/", addUser);

// Route to add a user (with only email)
router.get("/add-user", getUserByEmail);
router.post('/get-users', getUsers);
router.post('/get-user',authenticateToken, getUser);

export default router;
