import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  buyerName: { type: String, required: true },
  buyerEmail: { type: String, required: true },

  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  customOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CustomOrder",
    default: null,
  },

  amount: { type: Number, required: true },
  type: { type: String, enum: ["product", "advance", "final"], required: true },

  paymentStatus: {
    type: String,
    enum: ["received", "refunded"],
    default: "received",
  },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Payment", paymentSchema);
