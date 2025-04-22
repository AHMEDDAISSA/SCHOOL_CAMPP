// Import nodemailer for sending emails
import nodemailer from "nodemailer";

// Function to create a test transporter
const createTestTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();

  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // True for 465, false for other ports
    auth: {
      user: testAccount.user, // Fake email user
      pass: testAccount.pass, // Fake email password
    },
  });
};

// Function to send an email
const sendEmail = async (email: string, subject: string, message: string) => {
  try {
    const transporter = await createTestTransporter(); // Create transporter dynamically

    const mailOptions = {
      from: `"Test Sender" <test@example.com>`, // Fake sender email
      to: email, // Receiver address
      subject, // Subject of the email
      text: message, // Plain text body
    };

    // Send email using the transporter
    const info = await transporter.sendMail(mailOptions);
    console.log(`Test Email sent to ${email}`);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info)); // Preview link

  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending email.");
  }
};

// Export the sendEmail function as default
export default sendEmail;
