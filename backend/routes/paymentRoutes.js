import express from "express";
import auth from "../middleware/authMiddleware.js";
import {
  createProductPayment,
  payAdvance,
  payFinal,
  createBulkCartPayment,
  getMyPayments,
  getAllPayments,
    refundPayment
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/product", auth, createProductPayment);
router.post("/advance", auth, payAdvance);
router.post("/final", auth, payFinal);
router.post("/bulk-cart", auth, createBulkCartPayment);
router.get("/my", auth, getMyPayments);
router.get("/all", auth, getAllPayments);
router.post("/:paymentId/refund", auth, refundPayment);


export default router;
