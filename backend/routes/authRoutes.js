import express from "express";
import { signup, verifyOtp, login, resendOtp, forgotPasswordOtp, resetPassword, getProfile, deleteBuyerAccount } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.delete("/delete-account", authMiddleware, deleteBuyerAccount);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password-otp", forgotPasswordOtp);
router.post("/reset-password", resetPassword);
router.get("/me", authMiddleware, getProfile);



export default router;
