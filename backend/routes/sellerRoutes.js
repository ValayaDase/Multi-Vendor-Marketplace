import express from "express";
import {
  sendSellerRequest,
  getSellerDetails,
  getStats,
} from "../controllers/sellerController.js";
import { deleteSellerAccount } from "../controllers/authController.js";
import { upload } from "../middleware/upload.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/request", upload.single("sampleImage"), sendSellerRequest);
router.get("/stats", auth, getStats);
router.get("/:id", getSellerDetails);
router.delete("/delete-seller-account", auth, deleteSellerAccount); // present in auth controller

export default router;
