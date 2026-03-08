import Product from "../models/Product.js";
import fs from "fs";
import path from "path";

export const createProduct = async (req, res) => {
  try {
    const image = req.file ? "/uploads/productImages/" + req.file.filename : "";

    const product = await Product.create({
      seller: req.user.id,
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      stock: req.body.stock,
      images: [image],
      status: "pending",
    });

    res.json({ msg: "Product added", product });
  } catch (err) {
    res.status(500).json({ msg: "Error", err });
  }
};

export const getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: "Error", err });
  }
};

// delete product from seller my product.jsx
export const deleteProduct = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) {
      return res.status(404).json({ msg: "Product not found" });
    }

    if (p.seller.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    // deleting product image from uploads folder
    if (p.images && p.images.length > 0) {
      const img = p.images[0];

      let imgPath = img.startsWith("/") ? img.slice(1) : img;
      const filePath = path.join(process.cwd(), imgPath);

      fs.unlink(filePath, (err) => {
        if (err) {
          console.log("Failed to delete product image:", err.message);
        } else {
          console.log("Product image deleted:", filePath);
        }
      });
    }

    await p.deleteOne();
    res.json({ msg: "Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error" });
  }
};

// updating product from seller side
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: "Product not found" });

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    // Update text fields
    product.title = req.body.title ?? product.title;
    product.description = req.body.description ?? product.description;
    product.price = req.body.price ?? product.price;
    product.stock = req.body.stock ?? product.stock;
    product.category = req.body.category ?? product.category;

    // Replace image if a new file was uploaded
    if (req.file) {
      const newImage = "/uploads/productImages/" + req.file.filename;
      product.images = [newImage];
    }

    await product.save();
    res.json({ msg: "Product updated", product });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ msg: "Error updating product" });
  }
};

// fetching all products for buyers dasshboard

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: "approved" })
      .populate("seller", "role")
      .sort({ createdAt: -1 }); // this will give newest to oldest products

    const filtered = products.filter((p) => p.seller.role === "seller");
    res.json(filtered);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error fetching all products for buyers dashboard " });
  }
};

// fetching single product details for buyer

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("Get Product Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// SAVE / UNSAVE PRODUCT
export const toggleSaveProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    const product = await Product.findById(productId);
    if (!product) return res.json({ msg: "Product not found" });

    const index = product.savedBy.findIndex(
      (id) => id.toString() === userId.toString(),
    );

    if (index === -1) {
      product.savedBy.push(userId);
      await product.save();
      return res.json({ msg: "Product saved!", saved: true });
    } else {
      product.savedBy.splice(index, 1);
      await product.save();
      return res.json({ msg: "Removed from saved!", saved: false });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error saving product" });
  }
};

// GET SAVED PRODUCTS
export const getSavedProducts = async (req, res) => {
  try {
    const userId = req.user.id; // extracted from token

    const products = await Product.find({ savedBy: userId });

    res.json(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error fetching saved products" });
  }
};
