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
// Import nodemailer for sending emails
const nodemailer_1 = __importDefault(require("nodemailer"));
// Import dotenv to load environment variables
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
// Create a Nodemailer transporter
const transporter = nodemailer_1.default.createTransport({
    service: "gmail", // Use your email provider
    auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email password or App password
    },
});
// Function to send an email
const sendEmail = (email, subject, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender address
            to: email, // Receiver address
            subject, // Subject of the email
            text: message, // Plain text body
        };
        // Send email using the transporter
        yield transporter.sendMail(mailOptions);
        console.log(`OTP Email sent to ${email}`);
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Error sending email.");
    }
});
// Export the sendEmail function as default
exports.default = sendEmail;
