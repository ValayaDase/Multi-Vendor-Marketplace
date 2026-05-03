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

    productTitle: {
      type: String,
      default: "",
    },

    productName: {
      type: String,
      default: "",
    },

    productImage: {
      type: String,
      default: "",
    },

    imageUrl: {
      type: String,
      default: "",
    },

    productCategory: {
      type: String,
      default: "",
    },

    billingName: String,
    billingEmail: String,
    billingPhone: String,
    billingAddress: String,
    billingPincode: String,

    paymentRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "rejected",
        "cancelled",
        "refunded",
        "seller_deleted",
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
