import User from "../models/User.js";
import dotenv from "dotenv";
import { sendOtp } from "../utils/sendOtp.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
dotenv.config();

//================== SIGNUP ==================

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let existing = await User.findOne({ email });
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

    res.json({
      msg: "Signup successful! Please verify OTP sent to your email.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

//================= VERIFY OTP =================

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

//================ RESEND OTP ===================

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

//================= LOGIN ======================

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.json({ msg: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.json({ msg: "Invalid credentials" });
    }

    // Create JWT token
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

//================= FORGOT PASSWORD ======================
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

//================= RESET PASSWORD ======================
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

//================= GET PROFILE ======================
export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user);
};

import fs from "fs";
import path from "path";

// ================= DELETE BUYER ACCOUNT ======================
export const deleteBuyerAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });
    if (user.role !== "buyer") {
      return res.status(403).json({ msg: "Only buyers can delete account" });
    }

    // 1. Keep normal orders but hide buyer info
    await Order.updateMany(
      { buyer: userId },
      {
        billingName: "Deleted User",
        billingEmail: "deleted@user.com",
      },
    );

    // 2. Handle custom orders
    const customOrders = await CustomOrder.find({ buyer: userId });

    for (const order of customOrders) {
      // If order is completed - keep it
      if (order.status === "completed" || order.status === "in-progress") {
        // Just mark as deleted, keep images
        order.buyerDeleted = true;
        await order.save();
      }
      // If order is pending - delete everything
      else {
        // Delete images
        if (order.referenceImage) {
          const imgPath = order.referenceImage.replace("/", "");
          fs.unlink(imgPath, () => {});
        }
        if (order.previewImage) {
          const imgPath = order.previewImage.replace("/", "");
          fs.unlink(imgPath, () => {});
        }
        // Delete order
        await CustomOrder.findByIdAndDelete(order._id);
      }
    }

    // 3. Delete cart and saved items
    await Cart.deleteMany({ user: userId });
    await Product.updateMany(
      { savedBy: userId },
      { $pull: { savedBy: userId } },
    );

    // 4. Delete user account
    await User.findByIdAndDelete(userId);

    res.json({ msg: "Your account has been deleted successfully." });
  } catch (err) {
    console.error("Delete Buyer Account Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ================= DELETE SELLER ACCOUNT ======================
export const deleteSellerAccount = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const user = await User.findById(sellerId);
    if (!user) return res.status(404).json({ msg: "User not found" });
    if (user.role !== "seller") {
      return res
        .status(403)
        .json({ msg: "Only sellers can delete this account" });
    }

    // 1. Delete seller sample image
    if (user.sellerSampleImage) {
      const imgPath = user.sellerSampleImage.replace("/", "");
      fs.unlink(imgPath, () => {});
    }

    // 2. Delete studio and studio images
    const studio = await Studio.findOne({ seller: sellerId });
    if (studio && studio.artworks) {
      for (let art of studio.artworks) {
        const imgPath = art.image.replace("/", "");
        fs.unlink(imgPath, () => {});
      }
    }
    await Studio.findOneAndDelete({ seller: sellerId });

    // 3. Keep products but mark unavailable
    await Product.updateMany(
      { seller: sellerId },
      { stock: 0, available: false },
    );

    // 4. Keep normal orders but mark seller deleted
    await Order.updateMany(
      { seller: sellerId },
      { orderStatus: "seller_deleted" },
    );

    // 5. Handle custom orders
    const customOrders = await CustomOrder.find({ seller: sellerId });

    for (const order of customOrders) {
      // If order is completed - keep it
      if (order.status === "completed" || order.status === "in-progress") {
        order.status = "seller_deleted";
        await order.save();
      }
      // If order is pending - delete everything
      else {
        // Delete images
        if (order.referenceImage) {
          const imgPath = order.referenceImage.replace("/", "");
          fs.unlink(imgPath, () => {});
        }
        if (order.previewImage) {
          const imgPath = order.previewImage.replace("/", "");
          fs.unlink(imgPath, () => {});
        }
        // Delete order
        await CustomOrder.findByIdAndDelete(order._id);
      }
    }

    // 6. Delete seller account
    await User.findByIdAndDelete(sellerId);

    res.json({ msg: "Your seller account has been deleted permanently." });
  } catch (err) {
    console.error("Delete Seller Account Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
