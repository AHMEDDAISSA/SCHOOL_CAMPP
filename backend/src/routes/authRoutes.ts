// authentification routes
import express from "express";
import { requestOTP, verifyOTPHandler } from "../controllers/otpController";
import { authenticateToken } from '../middleware/authMiddleware';
import { loginHandler, registerHandler ,  verifyEmailHandler, 
    resendOTPHandler } from "../controllers/authController";
import { requestOTPByEmail } from "../controllers/otpController";
import upload from "../middleware/upload";


const router = express.Router();
router.post('/resend-otp', resendOTPHandler);


router.post('/resend-verification', resendOTPHandler);
router.post("/register", upload.single('profileImage'), registerHandler);


// Public routes
router.post('/register', registerHandler);
router.post('/login', loginHandler);  // This route is fine as is, no change needed
router.post('/verify-email', verifyEmailHandler); // Keep existing endpoint if needed
router.post('/verify-otp', verifyOTPHandler);    // Add new endpoint for OTP verification
router.post('/resend-otp', resendOTPHandler);
router.post('/signup/email', requestOTPByEmail);


export default router;