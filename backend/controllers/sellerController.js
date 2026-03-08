import User from "../models/User.js";
// import Studio from "../models/Studio.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
// import CustomOrder from "../models/CustomOrder.js";

// seller sending request to admin to become a seller

export const sendSellerRequest = async (req, res) => {
  try {
    // 1. Frontend se saara data extract karein
    const {
      userId,
      businessName,
      gstin,
      description,
      accountNumber,
      ifscCode,
      bankName,
    } = req.body;

    // 2. Check karein ki user exist karta hai ya nahi
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // 3. Image check
    if (!req.file) {
      return res.status(400).json({ msg: "Verification image is required" });
    }

    // 4. Model ke nested structure ke hisab se data update karein
    user.sellerRequest = "pending";

    // Business Details Mapping
    user.businessDetails = {
      businessName: businessName,
      gstin: gstin || "",
      description: description,
      studioImage: "/uploads/sellerSamples/" + req.file.filename,
    };

    // Bank Details Mapping
    user.bankDetails = {
      accountNumber: accountNumber,
      ifscCode: ifscCode,
      bankName: bankName,
    };

    // 5. Database mein save karein
    await user.save();

    res.json({
      msg: "Seller request submitted successfully! Admin will review your profile.",
      status: "pending",
    });
  } catch (err) {
    console.error("Seller Request Error:", err);
    res
      .status(500)
      .json({ msg: "Server error occurred while processing request" });
  }
};

// get seller details for buyer dashboard
export const getSellerDetails = async (req, res) => {
  try {
    const seller = await User.findById(req.params.id).select(
      "name email sellerRequest",
    );

    if (!seller) {
      return res.status(404).json({ msg: "Seller not found" });
    }

    res.json({
      _id: seller._id,
      name: seller.name,
      email: seller.email,
      city: null,
      bio: null,
    });
  } catch (err) {
    console.error("Seller Details Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// get seller stats for dashboard
export const getStats = async (req, res) => {
  try {
    const sellerId = req.user.id;

    // NORMAL ORDERS
    const normalOrders = await Order.countDocuments({ seller: sellerId });

    const totalOrders = normalOrders;
    const totalProducts = await Product.countDocuments({ seller: sellerId });
    const completedOrders = await Order.countDocuments({
      seller: sellerId,
      orderStatus: "delivered",
    });

    res.json({
      totalProducts,
      totalOrders,
      completedOrders,
    });
  } catch (err) {
    console.log("Stats Error ->", err);
    res.status(500).json({ msg: "Server error" });
  }
};
