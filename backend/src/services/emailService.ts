import nodemailer from 'nodemailer';
import winston from 'winston';
import dotenv from "dotenv";

// Create the transporter
const createTransporter = async () => {
  if (process.env.NODE_ENV === "development") {
    // Create a test account for Ethereal
    const testAccount = await nodemailer.createTestAccount();

    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  // For production or staging, use real SMTP credentials
  return nodemailer.createTransport({
    service: "gmail", // Change based on your provider (e.g., SendGrid, Outlook)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Function to send an email
const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string // Optional HTML version of the message
): Promise<void> => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html, // If undefined, it'll be ignored
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`Email sent to ${to}`);
    if (process.env.NODE_ENV === "development") {
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Error sending email");
  }
};

// Generate a 6-digit verification code
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email with 6-digit code
export const sendVerificationEmail = async (
  to: string,
  code: string,
  firstName: string = ""
): Promise<void> => {
  const subject = "Vérification de votre adresse email";
  
  const text = `Bonjour ${firstName || ""},\n\n` +
    `Votre code de vérification est: ${code}\n\n` +
    `Ce code expirera dans 5 minutes.\n\n` +
    `Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email.\n\n` +
    `Merci,\n` +
    `L'équipe d'application`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #836EFE; text-align: center;">Vérification d'Email</h2>
      <p>Bonjour ${firstName || ""},</p>
      <p>Merci de vous être inscrit. Pour confirmer votre adresse email, veuillez saisir le code de vérification à 6 chiffres ci-dessous:</p>
      <div style="text-align: center; margin: 30px 0;">
        <div style="font-size: 24px; letter-spacing: 5px; font-weight: bold; color: #333; background-color: #f5f5f5; padding: 15px; border-radius: 5px; display: inline-block;">
          ${code}
        </div>
      </div>
      <p style="font-size: 14px; color: #666;">Ce code expirera dans <strong>5 minutes</strong>.</p>
      <p>Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email.</p>
      <p style="margin-top: 30px; font-size: 14px; color: #888; text-align: center;">
        &copy; ${new Date().getFullYear()} Votre Application. Tous droits réservés.
      </p>
    </div>
  `;
  
  await sendEmail(to, subject, text, html);
};

export default sendEmail;
