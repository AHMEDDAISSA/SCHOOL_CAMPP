"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTPHandler = exports.requestOTP = void 0;
const otpService_1 = require("../services/otpService");
const User_1 = __importDefault(require("../models/User"));
const emailService_1 = __importDefault(require("../services/emailService")); // Function to send emails
// Function to handle OTP request
const requestOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield User_1.default.findOne({ email });
        // Check if user exists
        if (!user) {
            res.status(404).json({ msg: 'User not found' });
            return;
        }
        // Generate OTP for the user
        const otp = yield (0, otpService_1.generateOTP)(user._id.toString());
        // Send OTP to user's email
        yield (0, emailService_1.default)(user.email, 'Your OTP Code', `Your OTP is ${otp}. It expires in 5 minutes.`);
        res.json({ msg: 'OTP sent successfully.' });
    }
    catch (error) {
        res.status(500).json({ msg: 'Server error', error });
    }
});
exports.requestOTP = requestOTP;
// Function to handle OTP verification
const verifyOTPHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp } = req.body;
        const user = yield User_1.default.findOne({ email });
        // Check if user exists
        if (!user) {
            res.status(404).json({ msg: 'User not found' });
            return;
        }
        const isValid = yield (0, otpService_1.verifyOTP)(user._id.toString(), otp);
        if (!isValid) {
            res.status(400).json({ msg: 'Invalid or expired OTP' });
            return;
        }
        res.json({ msg: "OTP verified. You can now post ads." });
    }
    catch (error) {
        res.status(500).json({ msg: "Server error", error });
    }
});
exports.verifyOTPHandler = verifyOTPHandler;
