import express from "express";
import auth from "../middleware/authMiddleware.js";
import {
  addToCart,
  getCartItems,
  removeFromCart,
  updateQuantity,
  getCartCount,
} from "../controllers/cartController.js";

const router = express.Router();

router.post("/add", auth, addToCart);

router.get("/", auth, getCartItems);

router.get("/count", auth, getCartCount);

router.delete("/:itemId", auth, removeFromCart);

router.put("/:itemId", auth, updateQuantity);

export default router;
