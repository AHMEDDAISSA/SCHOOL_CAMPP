import nodemailer from 'nodemailer';
import { config } from 'dotenv';

// Load environment variables
config();

// Define email options interface
interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
}

/**
 * Send an email using nodemailer
 * @param options Email options including recipient, subject, and content
 * @returns Promise that resolves when email is sent
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    // Get email configuration from environment variables
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.EMAIL_PORT || '587', 10);
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const from = options.from || process.env.EMAIL_FROM || 'Your App <noreply@yourapp.com>';

    // Validate email configuration
    if (!user || !pass) {
      throw new Error('Email credentials not configured');
    }

    // Create a transporter
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    // Setup email data
    const mailOptions = {
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    // Log success in development environment
    if (process.env.NODE_ENV === 'development') {
      console.log(`Email sent to: ${options.to}`);
    }
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Send a template-based email
 * @param templateName Name of the email template to use
 * @param to Recipient email address
 * @param subject Email subject
 * @param data Data to populate the template
 * @returns Promise that resolves when email is sent
 */
export const sendTemplateEmail = async (
  templateName: string,
  to: string,
  subject: string,
  data: Record<string, any>
): Promise<void> => {
  try {
    // Template rendering logic can be added here
    // For now, using a simple switch case for different templates
    let html = '';
    let text = '';

    switch (templateName) {
      case 'otp':
        text = `Your verification code is: ${data.otp}. This code will expire in ${data.expiresInMinutes || 3} minutes.`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333;">Email Verification</h2>
            <p>Your verification code is:</p>
            <h1 style="font-size: 32px; letter-spacing: 5px; text-align: center; margin: 30px 0; color: #4a90e2;">${data.otp}</h1>
            <p>This code will expire in ${data.expiresInMinutes || 3} minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        `;
        break;
      case 'welcome':
        text = `Welcome to our platform, ${data.name}!`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333;">Welcome to Our Platform</h2>
            <p>Hello ${data.name},</p>
            <p>Thank you for joining our platform. We're excited to have you on board!</p>
            <p>If you have any questions, feel free to contact our support team.</p>
          </div>
        `;
        break;
      default:
        throw new Error(`Email template '${templateName}' not found`);
    }

    // Send the email
    await sendEmail({
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error('Template email sending error:', error);
    throw new Error(`Failed to send template email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Send an OTP email
 * @param to Recipient email address
 * @param otp The OTP code
 * @param expiresInMinutes Minutes until OTP expires
 * @returns Promise that resolves when email is sent
 */
export const sendOTPEmail = async (
  to: string,
  otp: string,
  expiresInMinutes: number = 3
): Promise<void> => {
  return sendTemplateEmail('otp', to, 'Your Verification Code', { otp, expiresInMinutes });
};

export default {
  sendEmail,
  sendTemplateEmail,
  sendOTPEmail
};
