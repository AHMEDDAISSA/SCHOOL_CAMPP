import express from "express";
import { 
    getUsers, 
    getUser, 
    getUserByEmail, 
    addUser, 
    getAllUsers,  // Add these new functions
    updateUserStatus,
    deleteUser
} from "../controllers/userController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

// Existing routes
router.post("/", addUser);
router.get("/add-user", getUserByEmail);
router.post('/get-users', getUsers);
router.post('/get-user', authenticateToken, getUser);

// New admin routes for user management
router.get("/all-users", getAllUsers);
router.put("/update-status/:id", authenticateToken, updateUserStatus); // Update user status (approve/reject)
router.delete("/delete/:id", authenticateToken, deleteUser); // Delete user

export default router;