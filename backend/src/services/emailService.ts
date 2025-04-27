import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  logger: true,
  debug: process.env.NODE_ENV !== 'production',
});

// Verify connection configuration on startup
transporter.verify((error) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to take messages');
  }
});

export const sendVerificationEmail = async (email: string, code: string, firstName = ''): Promise<any> => {
  console.log(`Attempting to send verification email to: ${email} with code: ${code}`);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #836EFE; text-align: center;">Email Verification</h2>
      <p>Hello ${firstName || 'User'},</p>
      <p>Thank you for registering. To confirm your email address, please enter the 6-digit verification code below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <div style="font-size: 28px; letter-spacing: 5px; font-weight: bold; color: #333; background-color: #f5f5f5; padding: 15px; border-radius: 5px; display: inline-block;">
          ${code}
        </div>
      </div>
      <p style="font-size: 14px; color: #666;">This code will expire in <strong>10 minutes</strong>.</p>
      <p>If you didn't request this code, you can safely ignore this email.</p>
      <p style="margin-top: 30px; font-size: 14px; color: #888; text-align: center;">
        © ${new Date().getFullYear()} Your App. All rights reserved.
      </p>
    </div>
  `;

  const mailOptions = {
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email',
    html,
    text: `Hello ${firstName || 'User'},\n\nYour verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, you can safely ignore this email.`,
  };

  // Retry mechanism (up to 3 attempts)
  let attempts = 0;
  const maxAttempts = 3;
  while (attempts < maxAttempts) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Verification email sent to ${email}: ${info.messageId}`);
      return info;
    } catch (error) {
      attempts++;
      console.error(`Attempt ${attempts} failed to send email:`, error);
      if (attempts === maxAttempts) {
        console.error('Max attempts reached. Email sending failed.');
        throw new Error(`Failed to send verification email after ${maxAttempts} attempts: ${error}`);
      }
      // Wait 1 second before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};