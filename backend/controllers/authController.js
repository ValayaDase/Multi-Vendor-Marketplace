import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { sendOtp } from "../utils/sendOtp.js";

dotenv.config();

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.json({ msg: "User with this email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await User.create({
      name,
      email,
      password: hashed,
      otp,
    });

    await sendOtp(email, otp);

    res.json({ msg: "Signup successful! Please verify OTP sent to your email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.json({ msg: "User not found" });

    if (user.otp !== otp) {
      return res.json({ msg: "Invalid OTP" });
    }

    user.verified = true;
    user.otp = null;
    await user.save();

    res.json({ msg: "User verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.json({ msg: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    await user.save();

    await sendOtp(email, otp);

    res.json({ msg: "A new OTP has been sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.json({ msg: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      msg: "Login successful",
      token,
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const forgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.json({ msg: "No account found with this email" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    await user.save();

    await sendOtp(email, otp);

    res.json({ msg: "OTP sent to your email for password reset", email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.json({ msg: "User not found" });

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    user.otp = null;
    await user.save();

    res.json({ msg: "Password updated successfully. Please log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user);
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.name = req.body.name?.trim() || user.name;

    if (req.body.location) {
      user.location = {
        city: req.body.location.city?.trim() || "",
        state: req.body.location.state?.trim() || "",
        country: req.body.location.country?.trim() || "India",
        pincode: req.body.location.pincode?.trim() || "",
      };
    }

    await user.save();
    res.json({ msg: "Profile updated", user });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ msg: "Failed to update profile" });
  }
};

export const deleteBuyerAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });
    if (user.role !== "buyer") {
      return res.status(403).json({ msg: "Only buyers can delete account" });
    }

    await Order.updateMany(
      { buyer: userId },
      {
        billingName: "Deleted User",
        billingEmail: "deleted@user.com",
      },
    );

    await Cart.deleteMany({ user: userId });
    await Product.updateMany(
      { savedBy: userId },
      { $pull: { savedBy: userId } },
    );

    await User.findByIdAndDelete(userId);

    res.json({ msg: "Your account has been deleted successfully." });
  } catch (err) {
    console.error("Delete Buyer Account Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const deleteSellerAccount = async (req, res) => {
  try {
    return requestSellerDeletion(req, res);
  } catch (err) {
    console.error("Delete Seller Account Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const requestSellerDeletion = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const terminalStatuses = ["delivered", "cancelled", "refunded", "rejected", "seller_deleted"];

    const user = await User.findById(sellerId);
    if (!user) return res.status(404).json({ msg: "User not found" });
    if (user.role !== "seller" || (user.status && user.status !== "active")) {
      return res.status(403).json({ msg: "Only active sellers can request account deletion" });
    }

    if (user.deletionStatus === "pending") {
      return res.status(400).json({ msg: "Your deletion request is already pending admin review." });
    }

    const activeOrders = await Order.countDocuments({
      seller: sellerId,
      orderStatus: { $nin: terminalStatuses },
    });

    const hasBlockingOrders = activeOrders > 0;
    const rejectionReason = "Active orders exist";

    user.deletionRequest = !hasBlockingOrders;
    user.deletionStatus = hasBlockingOrders ? "rejected" : "pending";
    user.deletionRequestedAt = new Date();
    user.deletionReviewedAt = hasBlockingOrders ? new Date() : null;
    user.deletionReason = hasBlockingOrders ? rejectionReason : "";
    await user.save();

    if (hasBlockingOrders) {
      return res.status(400).json({
        msg: "You cannot delete your account until all orders are completed.",
        reason: rejectionReason,
      });
    }

    res.json({
      msg: "Your account deletion request has been submitted for admin review.",
      status: user.deletionStatus,
    });
  } catch (err) {
    console.error("Request Seller Deletion Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
