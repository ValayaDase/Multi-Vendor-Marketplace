import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      default: 1,
    },

    price: {
      type: Number,
      required: true,
    },

    // ⭐ NEW — Billing details (entered in checkout)
    billingName: String,
    billingEmail: String,
    billingPhone: String,
    billingAddress: String,

    // ⭐ NEW — Payment Link (from Payment model)
    paymentRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    // ⭐ NEW — Payment Status
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },

    // ⭐ NEW — Order Status (admin/seller modifications)
    orderStatus: {
      type: String,
      enum: [
        "pending", // order created but no payment yet
        "confirmed", // payment done
        "processing", // seller preparing product
        "shipped", // seller shipped it
        "delivered", // completed
        "cancelled",
        "refunded",
        "seller_deleted", // seller deleted their account
      ],
      default: "pending",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
