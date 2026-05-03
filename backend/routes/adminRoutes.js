import express from "express";
import { 
  approveSeller, 
  rejectSeller, 
  getSellerRequests, 
  getSellerDeletionRequests,
  removeSeller, 
  suspendSeller,
  restoreSeller,
  approveSellerDeletionRequest,
  rejectSellerDeletionRequest,
  getAllSellers, 
  getStatCounts, 
  getAllOrders,
  approveProduct,
  rejectProduct,
  getPendingProducts 
} from "../controllers/adminController.js";
import {
  getDeletedProducts,
  hardDeleteProduct,
  restoreProduct,
  updateProduct,
} from "../controllers/productController.js";
import { productUpload } from "../middleware/productUpload.js";
import auth from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js"; //  Import the admin middleware

const router = express.Router();

// Add auth and isAdmin to ALL admin routes
router.get("/seller-requests", auth, isAdmin, getSellerRequests);
router.get("/seller-deletion-requests", auth, isAdmin, getSellerDeletionRequests);
router.post("/approve-seller", auth, isAdmin, approveSeller);
router.post("/reject-seller", auth, isAdmin, rejectSeller);
router.patch("/approve-seller-deletion/:id", auth, isAdmin, approveSellerDeletionRequest);
router.patch("/reject-seller-deletion/:id", auth, isAdmin, rejectSellerDeletionRequest);
router.patch("/suspend-seller/:id", auth, isAdmin, suspendSeller);
router.patch("/restore-seller/:id", auth, isAdmin, restoreSeller);
router.delete("/remove-seller/:id", auth, isAdmin, removeSeller);
router.get("/sellers", auth, isAdmin, getAllSellers);
router.get("/stat-counts", auth, isAdmin, getStatCounts);
router.get("/orders", auth, isAdmin, getAllOrders); 
router.put("/approve-product/:id", auth, isAdmin, approveProduct);
router.patch("/reject-product/:id", auth, isAdmin, rejectProduct);
router.get("/pending", auth, isAdmin, getPendingProducts);
router.get("/products/deleted", auth, isAdmin, getDeletedProducts);
router.patch("/products/restore/:id", auth, isAdmin, restoreProduct);
router.put("/products/update/:id", auth, isAdmin, productUpload.array("images", 5), updateProduct);
router.delete("/products/hard-delete/:id", auth, isAdmin, hardDeleteProduct);

export default router;
