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
exports.loginHandler = exports.registerHandler = void 0;
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Handler function for registering a new user
const registerHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, first_name, last_name, phone, camp, role } = req.body;
    // Required fields check
    if (!email || !camp || !role) {
        res.status(400).json({ status: "error", message: "Email, camp, and role are required." });
        return;
    }
    // Normalize undefined fields to empty strings
    const sanitizedUserData = {
        email: email.trim().toLowerCase(),
        first_name: (first_name === null || first_name === void 0 ? void 0 : first_name.trim()) || "",
        last_name: (last_name === null || last_name === void 0 ? void 0 : last_name.trim()) || "",
        phone: phone || "",
        camp: camp,
        role,
    };
    try {
        // Check if user already exists
        const existingUser = yield User_1.default.findOne({ email: sanitizedUserData.email, camp: sanitizedUserData.camp });
        if (existingUser) {
            res.status(400).json({
                status: "error",
                message: "User with this email and camp already exists.",
                user: { email: existingUser.email, camp: existingUser.camp }
            });
            return;
        }
        // Create and save new user
        const newUser = new User_1.default(sanitizedUserData);
        yield newUser.save();
        res.status(201).json({
            status: "success",
            message: "User registered successfully. Awaiting admin approval.",
            user: { email: sanitizedUserData.email, camp: sanitizedUserData.camp, role: sanitizedUserData.role }
        });
    }
    catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ status: "error", message: "Internal server error." });
    }
});
exports.registerHandler = registerHandler;
// Handler function for logging in a user
const loginHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, camp } = req.body;
    if (!email || !camp) {
        res.status(400).send('Email and camp are required');
        return;
    }
    try {
        // Find user by email and camp
        const user = yield User_1.default.findOne({ email, camp });
        if (!user) {
            res.status(400).send('User not found');
            return;
        }
        // Generate a JWT
        const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email }, // payload
        process.env.JWT_SECRET, // secret key
        { expiresIn: '1h' } // options
        );
        res.status(200).json({
            status: "success",
            message: "User logged in successfully",
            token: token, // send the token to the client
            user: user
        });
    }
    catch (error) {
        console.log("Error logging in user:", error);
        res.status(500).send('Error logging in user');
    }
});
exports.loginHandler = loginHandler;
