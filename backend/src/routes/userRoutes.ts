import express from "express";
import { getUsers, getUser, getUserByEmail,  addUser, getAllUsers,updateUserStatus,deleteUser,updateUserProfile,approveUser,rejectUser  }from"../controllers/userController";
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
router.put("/update-status/:id", updateUserStatus); // Enlevé authenticateToken
router.delete("/delete/:id", deleteUser); // Enlevé authenticateToken

// Route pour mettre à jour le profil utilisateur avec image
router.put("/update-profile/:id", upload.single('profileImage'), updateUserProfile);

// Routes pour approuver/rejeter (sans authentification pour simplifier)
router.put("/approve/:id", approveUser);
router.put("/reject/:id", rejectUser);

export default router;
