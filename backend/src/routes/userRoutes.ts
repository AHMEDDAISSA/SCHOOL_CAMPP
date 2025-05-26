import express from "express";
import { 
    getUsers, 
    getUser, 
    getUserByEmail, 
    addUser, 
    getAllUsers,
    updateUserStatus,
    deleteUser,
    updateUserProfile
} from "../controllers/userController";
import { authenticateToken } from "../middleware/authMiddleware";
import upload from "../middleware/upload";

const router = express.Router();

// Modified route for adding user with profile image
router.post("/", upload.single('profileImage'), addUser); 

// Existing routes
router.get("/add-user", getUserByEmail);
router.post('/get-users', getUsers);
router.post('/get-user', authenticateToken, getUser);

// Admin routes for user management
router.get("/all-users", getAllUsers);
router.put("/update-status/:id", authenticateToken, updateUserStatus);
router.delete("/delete/:id", authenticateToken, deleteUser);

// Route pour mettre à jour le profil utilisateur avec image
router.put("/update-profile/:id", upload.single('profileImage'), updateUserProfile);

export default router;