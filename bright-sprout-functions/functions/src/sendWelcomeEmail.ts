import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as nodemailer from "nodemailer";

// Configure the email transporter using environment variables
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error("Email user or password not configured.");
}

const transporter = nodemailer.createTransport({
  service: "gmail", // or your email service
  auth: {
    user: EMAIL_USER as string,
    pass: EMAIL_PASS as string,
  },
});

interface WelcomeEmailData {
  email: string;
  firstName: string;
}

export const sendWelcomeEmail = onCall<WelcomeEmailData>(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Only authenticated users can send welcome emails.",
    );
  }

  const {email, firstName} = request.data;

  if (!email || !firstName) {
    throw new HttpsError(
      "invalid-argument",
      "The function must be called with 'email' and 'firstName'.",
    );
  }

  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: "Welcome to BrightSprout!",
    html: `
      <h1>Welcome, ${firstName}!</h1>
      <p>Thank you for signing up for BrightSprout. We're excited 
      to have you on board.</p>
      <p>Explore our features and start your learning journey today!</p>
      <p>Best regards,</p>
      <p>The BrightSprout Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Welcome email sent to:", email);
    return {success: true, message: "Welcome email sent successfully!"};
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    throw new HttpsError(
      "internal",
      "Failed to send welcome email.",
      error.message,
    );
  }
});
