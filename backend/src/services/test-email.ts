import { config } from 'dotenv';
import * as nodemailer from 'nodemailer'; // Import entire module
import { Transporter } from 'nodemailer'; // Named import for Transporter type

config(); // Load environment variables

async function testEmail(): Promise<void> {
  const transporter: Transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    logger: true,
    debug: true,
  });

  console.log('SMTP sages');
  // Verify SMTP connection
  transporter.verify((error: Error | null) => {
    if (error) {
      console.error('SMTP connection error:', error);
    } else {
      console.log('SMTP server is ready to take messages');
    }
  });

  const mailOptions = {
    from: `"Test App" <${process.env.EMAIL_USER}>`,
    to: 'your-personal-email@example.com', // Replace with an accessible email
    subject: 'Test Email',
    text: 'This is a test email from Nodemailer.',
    html: '<p>This is a <b>test email</b> from Nodemailer.</p>',
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
  } catch (error: any) {
    console.error('Error sending test email:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  }
}

testEmail();