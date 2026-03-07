import express from "express";
import auth from "../middleware/authMiddleware.js";
import { productUpload } from "../middleware/productUpload.js";
import { createProduct, getSellerProducts, deleteProduct, getAllProducts, getProductById, toggleSaveProduct, getSavedProducts, updateProduct } from "../controllers/productController.js";

const router = express.Router();

router.post("/create", auth, productUpload.single("image"), createProduct);

router.get("/mine", auth, getSellerProducts);

router.delete("/delete/:id", auth, deleteProduct);

router.put("/update/:id", auth, productUpload.single("image"), updateProduct);

router.get("/getAll", getAllProducts);

router.post("/save", auth, toggleSaveProduct);

router.get("/saved", auth, getSavedProducts);

router.get("/:id", getProductById);






export default router;
