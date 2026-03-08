// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   name: String,
//   email: { type: String, unique: true },
//   password: String,
//   role: { type: String, default: "buyer" },  // buyer/seller/admin
//   otp: String,
//   verified: { type: Boolean, default: false },
//   sellerRequest: {
//   type: String,
//   enum: ["none", "pending", "approved","rejected"],
//   default: "none"
//   },
//   sellerSampleImage: { type: String }
// });

// export default mongoose.model("User", userSchema);

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },

    // Roles: buyer (default), seller, admin
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer",
    },

    // Verification & Auth
    otp: String,
    verified: { type: Boolean, default: false },

    // --- SELLER SPECIFIC FIELDS ---
    sellerRequest: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },

    // Business Info (Sirf tab bhari jayegi jab user seller banne ke liye apply karega)
    businessDetails: {
      businessName: { type: String, default: "" },
      gstin: { type: String, default: "" },
      description: { type: String, default: "" }, // Studio/Art description
      studioImage: { type: String, default: "" }, // Path to uploaded image
    },

    // Bank Info (For Payouts/Earnings)
    bankDetails: {
      accountNumber: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
      bankName: { type: String, default: "" },
    },

    // Stats (Optional: Trust build karne ke liye)
    sellerRating: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
