// authentification routes
import express from "express";
import { requestOTP, verifyOTPHandler } from "../controllers/otpController";
import { authenticateToken } from '../middleware/authMiddleware';
import { loginHandler, registerHandler } from "../controllers/authController";
import { requestOTPByEmail } from "../controllers/otpController";

const router = express.Router();

// Public routes
router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.post('/request-otp', authenticateToken, requestOTP);
router.post('/verify-otp', authenticateToken, verifyOTPHandler);
router.post('/signup/email', requestOTPByEmail);



export default router;
