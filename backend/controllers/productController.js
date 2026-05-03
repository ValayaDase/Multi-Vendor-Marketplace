import fs from "fs";
import path from "path";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { calculateEcoScore } from "../utils/ecoScore.js";

const ACTIVE_PRODUCT_FILTER = {
  status: "approved",
  stock: { $gt: 0 },
  $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
};

const normalizeImages = (files = []) =>
  files.slice(0, 5).map((file) => `/uploads/productImages/${file.filename}`);

const parseExistingImages = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
};

const removeImagesFromDisk = async (images = []) => {
  await Promise.all(
    images.filter(Boolean).map(async (img) => {
      const relativePath = img.startsWith("/") ? img.slice(1) : img;
      const filePath = path.join(process.cwd(), relativePath);

      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        if (err.code !== "ENOENT") {
          console.log("Failed to delete product image:", err.message);
        }
      }
    }),
  );
};

const buildProductPayload = (req, uploadedImages, fallbackImages = []) => {
  const images = uploadedImages.length > 0 ? uploadedImages : fallbackImages;

  return {
    title: req.body.title?.trim(),
    description: req.body.description?.trim() || "",
    price: Number(req.body.price || 0),
    category: req.body.category?.trim(),
    stock: Number(req.body.stock || 0),
    brand: req.body.brand?.trim() || "",
    origin: req.body.origin?.trim() || "",
    weight: req.body.weight?.trim() || "",
    warranty: req.body.warranty?.trim() || "",
    images,
    thumbnail: images[0] || "",
    ecoScore: calculateEcoScore({
      materialType: req.body.materialType,
      packagingType: req.body.packagingType,
      carbonImpact: req.body.carbonImpact,
    }),
    location: {
      city: req.body.city?.trim() || "",
      state: req.body.state?.trim() || "",
      country: "India",
      pincode: req.body.pincode?.trim() || "",
    },
    deliveryAreas: [],
    isDeleted: false,
    deletedBy: null,
    deletedAt: null,
  };
};

const getActorType = (req) => (req.user.role === "admin" ? "admin" : "seller");

const requireActiveSeller = async (userId) => {
  const user = await User.findById(userId).select("role status");

  if (!user || user.role !== "seller" || (user.status && user.status !== "active")) {
    return null;
  }

  return user;
};

const canManageProduct = (req, product) =>
  req.user.role === "admin" || product.seller.toString() === req.user.id;

const isImageReferencedElsewhere = async (images = [], productId) => {
  if (images.length === 0) return false;

  const [otherProductReference, orderReference] = await Promise.all([
    Product.exists({
      _id: { $ne: productId },
      $or: [{ images: { $in: images } }, { thumbnail: { $in: images } }],
    }),
    Order.exists({
      $or: [{ productImage: { $in: images } }, { imageUrl: { $in: images } }],
    }),
  ]);

  return Boolean(otherProductReference || orderReference);
};

export const createProduct = async (req, res) => {
  try {
    const seller = await requireActiveSeller(req.user.id);
    if (!seller) {
      return res.status(403).json({ msg: "Only active sellers can create products" });
    }

    const uploadedImages = normalizeImages(req.files);
    if (uploadedImages.length === 0) {
      return res.status(400).json({ msg: "Please upload at least one product image" });
    }

    const payload = buildProductPayload(req, uploadedImages);

    const product = await Product.create({
      seller: req.user.id,
      ...payload,
      status: "pending",
    });

    res.json({ msg: "Product added", product });
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ msg: "Error creating product" });
  }
};

export const getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching seller products" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    if (!canManageProduct(req, product)) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    if (req.user.role !== "admin") {
      const seller = await requireActiveSeller(req.user.id);
      if (!seller) {
        return res.status(403).json({ msg: "Only active sellers can manage products" });
      }
    }

    product.isDeleted = true;
    product.status = "inactive";
    product.deletedBy = getActorType(req);
    product.deletedAt = new Date();
    product.stock = 0;

    await product.save();

    res.json({
      msg:
        req.user.role === "admin"
          ? "Product soft deleted by admin."
          : "Product hidden from buyers successfully.",
      product,
    });
  } catch (err) {
    console.error("Soft delete product error:", err);
    res.status(500).json({ msg: "Error deleting product" });
  }
};

export const restoreProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    product.isDeleted = false;
    product.deletedBy = null;
    product.deletedAt = null;
    product.status = "pending";
    product.adminRemark = "";

    await product.save();
    res.json({ msg: "Product restored and moved back to pending review.", product });
  } catch (err) {
    console.error("Restore product error:", err);
    res.status(500).json({ msg: "Failed to restore product" });
  }
};

export const hardDeleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    const orderReference = await Order.exists({ product: product._id });
    if (orderReference) {
      return res.status(400).json({ msg: "Hard delete blocked because order history references this product" });
    }

    const imagesInUse = await isImageReferencedElsewhere(
      [...new Set([...(product.images || []), product.thumbnail].filter(Boolean))],
      product._id,
    );

    if (imagesInUse) {
      return res.status(400).json({ msg: "Hard delete blocked because product images are still referenced" });
    }

    await removeImagesFromDisk([...(product.images || []), product.thumbnail]);
    await product.deleteOne();

    res.json({ msg: "Product permanently deleted" });
  } catch (err) {
    console.error("Hard delete product error:", err);
    res.status(500).json({ msg: "Failed to hard delete product" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: "Product not found" });

    if (!canManageProduct(req, product)) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    if (req.user.role !== "admin") {
      const seller = await requireActiveSeller(req.user.id);
      if (!seller) {
        return res.status(403).json({ msg: "Only active sellers can edit products" });
      }
    }

    const uploadedImages = normalizeImages(req.files);
    const existingImages = parseExistingImages(req.body.existingImages);
    const fallbackImages = existingImages.length > 0 ? existingImages.slice(0, 5) : product.images;
    const nextImages = uploadedImages.length > 0 ? uploadedImages : fallbackImages;

    if (uploadedImages.length > 0) {
      const removed = product.images.filter((img) => !nextImages.includes(img));
      const removable = [];

      for (const image of removed) {
        const stillReferenced = await isImageReferencedElsewhere([image], product._id);
        if (!stillReferenced) {
          removable.push(image);
        }
      }

      await removeImagesFromDisk(removable);
    }

    Object.assign(product, buildProductPayload(req, uploadedImages, fallbackImages));
    product.images = nextImages;
    product.thumbnail = nextImages[0] || "";
    product.status = req.user.role === "admin" ? "approved" : "pending";
    product.adminRemark = "";

    await product.save();
    res.json({
      msg: req.user.role === "admin" ? "Product updated by admin" : "Product updated",
      product,
    });
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ msg: "Error updating product" });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const query = (req.query.query || "").trim();
    const category = (req.query.category || "").trim();
    const location = (req.query.location || "").trim();

    const filters = { ...ACTIVE_PRODUCT_FILTER };

    if (category) {
      filters.category = category;
    }

    if (query) {
      filters.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { brand: { $regex: query, $options: "i" } },
        { origin: { $regex: query, $options: "i" } },
      ];
    }

    if (location) {
      filters.$and = [
        ...(filters.$and || []),
        {
          "location.state": { $regex: location, $options: "i" },
        },
      ];
    }

    const products = await Product.find(filters)
      .populate("seller", "role status name sellerRating businessDetails location")
      .sort({ createdAt: -1 });

    const filtered = products.filter(
      (product) => product.seller?.role === "seller" && (!product.seller?.status || product.seller?.status === "active"),
    );
    res.json(filtered);
  } catch (err) {
    console.error("Get all products error:", err);
    res.status(500).json({ msg: "Error fetching products" });
  }
};

export const getDeletedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: true })
      .populate("seller", "name email status")
      .sort({ deletedAt: -1, updatedAt: -1 });

    res.json(products);
  } catch (err) {
    console.error("Get deleted products error:", err);
    res.status(500).json({ msg: "Failed to fetch deleted products" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "name email role status sellerRating businessDetails location",
    );

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("Get product error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const toggleSaveProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    const product = await Product.findById(productId);
    if (!product || product.isDeleted) return res.json({ msg: "Product not found" });

    const index = product.savedBy.findIndex((id) => id.toString() === userId.toString());

    if (index === -1) {
      product.savedBy.push(userId);
      await product.save();
      return res.json({ msg: "Product saved!", saved: true });
    }

    product.savedBy.splice(index, 1);
    await product.save();
    return res.json({ msg: "Removed from saved!", saved: false });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error saving product" });
  }
};

export const getSavedProducts = async (req, res) => {
  try {
    const products = await Product.find({
      savedBy: req.user.id,
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error fetching saved products" });
  }
};

export const getRecommendedProducts = async (userId, limit = 6) => {
  const user = await User.findById(userId);
  const savedProducts = await Product.find({ savedBy: userId }).select("category");

  const categories = [...new Set(savedProducts.map((item) => item.category).filter(Boolean))];
  const locationState = user?.location?.state;

  const filters = {
    ...ACTIVE_PRODUCT_FILTER,
  };

  if (categories.length > 0) {
    filters.category = { $in: categories };
  }

  if (locationState) {
    filters["location.state"] = { $regex: `^${locationState}$`, $options: "i" };
  }

  const products = await Product.find(filters)
    .populate("seller", "role status")
    .sort({ createdAt: -1 })
    .limit(limit);

  return products.filter((product) => product.seller?.role === "seller" && product.seller?.status === "active");
  
};
