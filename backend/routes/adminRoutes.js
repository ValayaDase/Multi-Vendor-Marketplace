import express from "express";
import {
  approveSeller,
  rejectSeller,
  getSellerRequests,
  removeSeller,
  getAllSellers,
  getStatCounts,
  getAllOrders,
  approveProduct,
  rejectProduct,
  getPendingProducts,
} from "../controllers/adminController.js";
import auth from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js"; //  Import the admin middleware

const router = express.Router();

// Add auth and isAdmin to ALL admin routes
router.get("/seller-requests", auth, isAdmin, getSellerRequests);
router.post("/approve-seller", auth, isAdmin, approveSeller);
router.post("/reject-seller", auth, isAdmin, rejectSeller);
router.delete("/remove-seller/:id", auth, isAdmin, removeSeller);
router.get("/sellers", auth, isAdmin, getAllSellers);
router.get("/stat-counts", auth, isAdmin, getStatCounts);
router.get("/orders", auth, isAdmin, getAllOrders);
router.put("/approve-product/:id", auth, isAdmin, approveProduct);
router.patch("/reject-product/:id", auth, isAdmin, rejectProduct);
router.get("/pending", auth, isAdmin, getPendingProducts);

export default router;
