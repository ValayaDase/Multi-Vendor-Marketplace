import User from "../models/User.js";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Product from "../models/Product.js";
import fs from "fs";
import path from "path";
import { sendEmail } from "../utils/sendEmail.js";

// get request from users to become sellers
export const getSellerRequests = async (req, res) => {
  try {
    const requests = await User.find({ sellerRequest: "pending" });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

// APPROVE SELLER
export const approveSeller = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.role = "seller";
    user.sellerRequest = "approved";

    await user.save();

    await sendEmail(
      user.email,
      "Seller Request Approved",
      "Your seller request for VendorHub has been approved.",
    );

    res.json({ msg: "Seller Approved!" });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

// REJECT SELLER

export const rejectSeller = async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);

    // 1. Image delete (Wahi ek line wala logic)
    const imgPath = user.businessDetails?.studioImage;
    if (imgPath) {
      fs.unlinkSync(path.join(process.cwd(), imgPath));
    }

    // 2. Data Clean (Sirf 3 lines)
    user.businessDetails = {}; // Sab saaf
    user.bankDetails = {}; // Sab saaf
    user.sellerRequest = "rejected";

    await user.save();
    await sendEmail(
      user.email,
      "Seller Request Rejected",
      "Your seller request for VendorHub has been rejected.",
    );
    res.json({ msg: "User seller request rejected and cleaned!" });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error rejecting seller request: " + err.message });
  }
};

// remove seller
export const removeSeller = async (req, res) => {
  try {
    const sellerId = req.params.id;

    // 1. Check if user exists
    const user = await User.findById(sellerId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    console.log(`Removing seller: ${sellerId}`);

    // 2. Studio Image delete karna (uploads/sellerSamples folder se)
    // Aapke naye model mein path yahan hai: businessDetails.studioImage
    const imgUrl = user.businessDetails?.studioImage;

    if (imgUrl) {
      const imgPath = imgUrl.startsWith("/") ? imgUrl.slice(1) : imgUrl;
      const filePath = path.join(process.cwd(), imgPath);

      try {
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
          console.log("Studio image deleted:", filePath);
        }
      } catch (err) {
        console.log("Failed to delete image file:", err.message);
      }
    }

    // 3. Products ko "Out of Stock" mark karna
    // Taaki buyer purane orders mein product dekh sake par naya kharid na sake
    const products = await Product.find({ seller: sellerId });
    await Product.updateMany({ seller: sellerId }, { $set: { stock: 0 } });
    console.log(`${products.length} products marked out of stock`);

    // 4. Orders ka status update karna
    const orders = await Order.find({ seller: sellerId });
    await Order.updateMany(
      { seller: sellerId },
      { $set: { orderStatus: "seller_deleted" } },
    );
    console.log(`${orders.length} orders updated to 'seller_deleted'`);

    // 5. User ko Downgrade karna aur data saaf karna
    // Role ko 'buyer' kiya aur business/bank details ko khali kar diya
    await User.findByIdAndUpdate(sellerId, {
      role: "buyer",
      sellerRequest: "none",
      businessDetails: {}, // Ek line mein saara business data saaf
      bankDetails: {}, // Ek line mein saara bank data saaf
    });

    await sendEmail(
      user.email,
      "Seller Account Removed",
      "Your seller account on VendorHub has been removed. Your products are now out of stock and orders are preserved for buyer history. You can continue to use your account as a buyer.",
    );

    res.json({
      msg: "Seller removed successfully. Role changed to buyer.",
      stats: {
        productsAffected: products.length,
        ordersAffected: orders.length,
      },
    });
  } catch (err) {
    console.error("REMOVE SELLER ERROR:", err.message);
    res.status(500).json({ msg: "Failed to remove seller" });
  }
};

// GET ALL APPROVED SELLERS

export const getAllSellers = async (req, res) => {
  try {
    const sellers = await User.find({ role: "seller" });

    const sellersWithStats = await Promise.all(
      sellers.map(async (seller) => {
        const productCount = await Product.countDocuments({
          seller: seller._id,
        });
        const orderCount = await Order.countDocuments({ seller: seller._id });

        return {
          ...seller.toObject(),
          productCount,
          orderCount,
        };
      }),
    );

    res.json(sellersWithStats);
  } catch (err) {
    console.error("Error loading sellers:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// GET STAT COUNTS
// GET STAT COUNTS
export const getStatCounts = async (req, res) => {
  try {
    // 1. Role 'buyer' wale users count karo
    const totalBuyer = await User.countDocuments({ role: "buyer" });

    // 2. Role 'seller' wale users count karo
    const totalSellers = await User.countDocuments({ role: "seller" });

    // 3. Saare orders count karo (Ab customOrder nikal diya hai toh seedha count karo)
    const totalOrders = await Order.countDocuments();

    // Frontend ko data bhej do
    res.json({ totalBuyer, totalSellers, totalOrders });
  } catch (error) {
    console.error("Stat Count Error:", error.message);
    res.status(500).json({ msg: "Server error" });
  }
};

//get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("buyer")
      .populate("seller")
      .populate("product")
      .populate("paymentRef")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.log("Admin Orders Error:", err);
    res.status(500).json({ msg: "Error fetching orders" });
  }
};

// Admin route to approve a product
export const approveProduct = async (req, res) => {
  try {
    // Route mein :id hai, isliye params.id use karein
    const productId = req.params.id;

    console.log("Approving product with ID:", productId);

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { status: "approved" },
      { new: true },
    );

    if (!updatedProduct) {
      return res.status(404).json({ msg: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ msg: "Failed to approve product" });
  }
};

// reject prduct added by seller with optional remark
// controllers/adminController.js
export const rejectProduct = async (req, res) => {
  try {
    const { productId } = req.params.id;
    const { adminRemark } = req.body; // Reason for rejection

    const product = await Product.findByIdAndUpdate(
      productId,
      {
        status: "rejected",
        adminRemark: adminRemark || "Product does not meet our guidelines.",
      },
      { new: true },
    );

    if (!product) return res.status(404).json({ msg: "Product not found" });

    res.json({ msg: "Product rejected successfully", product });
  } catch (err) {
    res.status(500).json({ msg: "Failed to reject product" });
  }
};

// get pending products for admin approval queue
export const getPendingProducts = async (req, res) => {
  try {
    const pendingProducts = await Product.find({ status: "pending" }).populate(
      "seller",
    );
    // console.log(pendingProducts);
    res.json(pendingProducts);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch pending products" });
  }
};
