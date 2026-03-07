import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import User from "./models/User.js";
import productRoutes from "./routes/productRoutes.js";
// import studioRoutes from "./routes/studioRoutes.js";
// import customOrderRoutes from "./routes/customOrderRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { globalSearch } from "./controllers/searchController.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env. MONGO_URI;
const PORT = process.env.PORT || 5000;

// ================= DATABASE CONNECT =================
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// ================= AUTO CREATE ADMIN =================
async function createAdmin() {
  const adminExists = await User.findOne({ role: "admin" });
  if (adminExists) {
    console.log("Admin already exists");
    return;
  }

  const hashed = await bcrypt.hash("admin123", 10);

  await User.create({
    name: "Admin",
    email: "admin@gmail.com",
    password: hashed,
    role: "admin",
    verified: true
  });

  console.log("Admin created:  admin@gmail.com | password: admin123");
}

createAdmin();

// ================= ROUTES =================
app.use("/auth", authRoutes);
app.use("/seller", sellerRoutes);
app.use("/admin", adminRoutes);
app.use("/products", productRoutes);
// app.use("/studio", studioRoutes);
// app.use("/custom-orders", customOrderRoutes);
app.use("/orders", orderRoutes);
app.use("/cart", cartRoutes);
app.use("/payments", paymentRoutes);

// ================ STATIC FILES =================
app.use("/uploads", express.static("uploads"));

app.get("/search", globalSearch);

// ================= SERVER START =================
app.listen(PORT, () => console.log("Server running on " + PORT));