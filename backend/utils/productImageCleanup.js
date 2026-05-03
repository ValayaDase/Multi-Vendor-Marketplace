import fs from "fs";
import path from "path";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const PRODUCT_IMAGE_DIR = path.join(process.cwd(), "uploads", "productImages");

const normalizeImagePath = (fileName) => `/uploads/productImages/${fileName}`.replace(/\\/g, "/");

export const cleanupUnusedProductImages = async () => {
  try {
    if (!fs.existsSync(PRODUCT_IMAGE_DIR)) {
      return { deleted: 0, scanned: 0 };
    }

    const [products, orders] = await Promise.all([
      Product.find({ isDeleted: false }).select("images thumbnail"),
      Order.find().select("productImage imageUrl"),
    ]);

    const referencedImages = new Set();

    products.forEach((product) => {
      [...(product.images || []), product.thumbnail].filter(Boolean).forEach((image) => referencedImages.add(image));
    });

    orders.forEach((order) => {
      [order.productImage, order.imageUrl].filter(Boolean).forEach((image) => referencedImages.add(image));
    });

    const files = await fs.promises.readdir(PRODUCT_IMAGE_DIR);
    let deleted = 0;

    for (const file of files) {
      const imagePath = normalizeImagePath(file);
      if (referencedImages.has(imagePath)) continue;

      await fs.promises.unlink(path.join(PRODUCT_IMAGE_DIR, file));
      deleted += 1;
    }

    return { deleted, scanned: files.length };
  } catch (err) {
    console.error("Product image cleanup failed:", err.message);
    return { deleted: 0, scanned: 0, error: err.message };
  }
};

export const startProductImageCleanupJob = () => {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  setTimeout(() => {
    cleanupUnusedProductImages().then((result) => {
      console.log("Initial product image cleanup complete:", result);
    });
  }, 10000);

  setInterval(() => {
    cleanupUnusedProductImages().then((result) => {
      console.log("Scheduled product image cleanup complete:", result);
    });
  }, ONE_DAY_MS);
};
