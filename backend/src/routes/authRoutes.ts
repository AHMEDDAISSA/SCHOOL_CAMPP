// authentification routes
import express from "express";
import { requestOTP, verifyOTPHandler } from "../controllers/otpController";
import { authenticateToken } from '../middleware/authMiddleware';
import { loginHandler, registerHandler } from "../controllers/authController";
import { requestOTPByEmail } from "../controllers/otpController";

const router = express.Router();

// Public routes
router.post('/register', registerHandler);
router.post('/login', loginHandler);  // This route is fine as is, no change needed
router.post('/request-otp', authenticateToken, requestOTP);
router.post('/verify-otp', authenticateToken, verifyOTPHandler);
router.post('/signup/email', requestOTPByEmail);

// Add these routes if you need email verification functionality
router.post('/verify-email', (req, res) => {
    // This would be implemented in an appropriate controller
    res.status(501).json({ status: "error", message: "Not implemented yet" });
});

router.post('/resend-verification', (req, res) => {
    // This would be implemented in an appropriate controller
    res.status(501).json({ status: "error", message: "Not implemented yet" });
});

export default router;