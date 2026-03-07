import express from "express";
import {
  createOrder,
  getBuyerOrders,
  getSellerOrders,
  updateOrderStatus,
  cancelOrder
} from "../controllers/orderController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

// BUY NOW
router.post("/create", auth, createOrder);

// BUYER ORDERS
router.get("/buyer", auth, getBuyerOrders);

// SELLER ORDERS
router.get("/seller/:id", auth, getSellerOrders);

// UPDATE STATUS (SELLER)
router.post("/update-status", auth, updateOrderStatus);

// CANCEL ORDER (BUYER)
router.post("/cancel", auth, cancelOrder);

export default router;
