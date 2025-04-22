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
exports.verifyOTP = exports.generateOTP = void 0;
const crypto_1 = __importDefault(require("crypto"));
const Otp_1 = __importDefault(require("../models/Otp"));
/**
 * Generate a 6-digit OTP and store it in the database
 */
const generateOTP = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Generate a random 6-digit OTP
    const otp = crypto_1.default.randomInt(100000, 999999).toString();
    // Store the OTP in the database with an expiration time
    yield Otp_1.default.create({
        userId,
        otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000) // OTP expires in 5 minutes
    });
    return otp; // Return the generated OTP
});
exports.generateOTP = generateOTP;
/**
 * Verify OTP for posting ads
 */
const verifyOTP = (userId, enteredOTP) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the OTP record in the database
    const otpRecord = yield Otp_1.default.findOne({ userId, otp: enteredOTP });
    // Check if the OTP is valid and not expired
    if (!otpRecord || otpRecord.expiresAt < new Date()) {
        return false; // OTP is invalid or expired
    }
    // Delete the OTP after successful verification
    yield Otp_1.default.deleteOne({ _id: otpRecord._id });
    return true; // Return true if OTP is valid
});
exports.verifyOTP = verifyOTP;
