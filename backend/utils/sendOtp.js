import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export async function sendOtp(email, otp) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}.`
    });

    console.log("OTP email sent to:", email);
  } catch (error) {
    console.error("Email sending failed:", error);
  }
}
