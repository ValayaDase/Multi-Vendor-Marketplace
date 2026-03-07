import User from "../models/User.js";
import Order from "../models/Order.js";
// import CustomOrder from "../models/CustomOrder.js";
import Payment from "../models/Payment.js";
import Product from "../models/Product.js";
// import Studio from "../models/Studio.js";
import fs from "fs";
import path from "path";


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
    user.bankDetails = {};     // Sab saaf
    user.sellerRequest = "rejected";

    await user.save();
    res.json({ msg: "User seller request rejected and cleaned!" });
  } catch (err) {
    res.status(500).json({ msg: "Error rejecting seller request: " + err.message });
  }
};

// export const rejectSeller = async (req, res) => {
//   try {
//     const { userId } = req.body;

//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ msg: "User not found" });

//     //  Delete sample image if exists
//     if (user.sellerSampleImage) {
//       const imgPath = user.sellerSampleImage.startsWith("/")
//         ? user.sellerSampleImage. slice(1)
//         : user.sellerSampleImage;
//       const filePath = path.join(process.cwd(), imgPath);

//       try {
//         await fs.promises.unlink(filePath);
//         console.log(" Sample image deleted:", filePath);
//       } catch (err) {
//         console.log(" Failed to delete sample image(server side):", err.message);
//       }
//     }

//     //  Update user status
//     user.sellerRequest = "rejected";
//     user.sellerSampleImage = null;  // Clear the image path

//     await user.save();

//     res.json({ msg: "Seller Request Rejected" });
//   } catch (error) {
//     console.error("Reject Seller Error:", error);
//     res.status(500).json({ msg: "Server error", error: error.message });
//   }
// };


// REMOVE SELLER
// export const removeSeller = async (req, res) => {
//   try {
//     const sellerId = req.params.id;
    
//     const user = await User.findById(sellerId);
//     if (!user) return res.status(404).json({ msg: "User not found" });

//     const products = await Product.find({ seller: sellerId });
//     const normalOrders = await Order.find({ seller: sellerId });

//     console.log(`Removing seller: ${sellerId}`);

//     //  Delete ONLY sample image (not needed anymore)
//     if (user.sellerSampleImage) {
//       const imgPath = user.sellerSampleImage.startsWith("/")
//         ? user.sellerSampleImage. slice(1)
//         : user.sellerSampleImage;
//       const filePath = path.join(process.cwd(), imgPath);

//       try {
//         await fs.promises.unlink(filePath);
//         console.log(" Sample image deleted:", filePath);
//       } catch (err) {
//         console.log(" Failed to delete sample image:", err.message);
//       }
//     }
//     //KEEP product images but mark products as unavailable
//     await Product.updateMany(
//       { seller: sellerId },
//       { 
//         $set: { 
//           stock: 0,
//           available: false  // Add this field to your Product model if needed
//         } 
//       }
//     );
//     console.log(" Products marked as unavailable (images preserved for order history)");

//     //  Update normal orders status (KEEP orders and images for buyer history)
//     await Order.updateMany(
//       { seller: sellerId },
//       { 
//         $set: { 
//           orderStatus: "seller_removed"
//         } 
//       }
//     );
//     console.log(` ${normalOrders.length} normal orders marked as 'seller_removed' (preserved for buyers)`);

//     // Update custom orders status (KEEP orders and images)
//     await CustomOrder.updateMany(
//       { seller: sellerId },
//       { 
//         $set: { 
//           status: "seller_removed"
//         } 
//       }
//     );
//     console.log(` ${customOrders.length} custom orders marked as 'seller_removed' (preserved for buyers)`);

//     //  KEEP payments (needed for transaction history and refunds)
//     console.log(" Payments preserved for transaction history");

//     //  Downgrade user to buyer
//     await User.findByIdAndUpdate(sellerId, { 
//       role: "buyer",
//       sellerRequest: "none",
//       sellerSampleImage:  null
//     });
//     console.log(" User downgraded to buyer");

//     res.json({ 
//       msg: "Seller removed successfully. User downgraded to buyer.  All orders and product images preserved for buyer history.  Studio and promotional content deleted.",
//       stats: {
//         ordersPreserved: normalOrders.length,
//         customOrdersPreserved: customOrders.length,
//         productsDisabled: products.length
//       }
//     });

//   } catch (err) {
//     console.error("=== REMOVE SELLER ERROR ===");
//     console.error("Error:", err);
//     console.error("Stack:", err.stack);
//     res.status(500).json({ 
//       msg: "Failed to remove seller", 
//       error: err.message 
//     });
//   }
// };


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
    await Product.updateMany(
      { seller: sellerId },
      { $set: { stock: 0 } } 
    );
    console.log(`${products.length} products marked out of stock`);

    // 4. Orders ka status update karna
    const orders = await Order.find({ seller: sellerId });
    await Order.updateMany(
      { seller: sellerId },
      { $set: { orderStatus: "seller_deleted" } }
    );
    console.log(`${orders.length} orders updated to 'seller_deleted'`);

    // 5. User ko Downgrade karna aur data saaf karna
    // Role ko 'buyer' kiya aur business/bank details ko khali kar diya
    await User.findByIdAndUpdate(sellerId, {
      role: "buyer",
      sellerRequest: "none",
      businessDetails: {}, // Ek line mein saara business data saaf
      bankDetails: {}      // Ek line mein saara bank data saaf
    });

    res.json({
      msg: "Seller removed successfully. Role changed to buyer.",
      stats: {
        productsAffected: products.length,
        ordersAffected: orders.length
      }
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
        const productCount = await Product.countDocuments({ seller: seller._id });
        const orderCount = await Order.countDocuments({ seller: seller._id });

        return {
          ...seller.toObject(),
          productCount,
          orderCount
        };
      })
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
  }
  catch (error) {
    console.error("Stat Count Error:", error.message);
    res.status(500).json({ msg: "Server error" });
  }
}

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

// get all custom orders
// export const getAllCustomOrders = async (req, res) => {
//   try {
//     const orders = await CustomOrder.find()
//       .populate("buyer")
//       .populate("seller")
//       .sort({ createdAt: -1 });

//     res.json(orders);
//   } catch (err) {
//     console.error("Get Admin Custom Orders Error:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// };

// get payments for custom order only 
// export const getCustomPayments = async (req, res) => {
//   try {
//     const payments = await Payment.find({ customOrder: { $ne: null } })
//       .populate("buyer")
//       .populate("seller")
//       .populate("customOrder")
//       .sort({ createdAt: -1 });

//     res.json(payments);
//   } catch (err) {
//     console.error("Payment Fetch Err:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// };

// approve products added by seller

// Admin route to approve a product
export const approveProduct = async (req, res) => {
  try {
    // Route mein :id hai, isliye params.id use karein
    const productId = req.params.id; 
    
    console.log("Approving product with ID:", productId);
    
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { status: "approved" },
      { new: true }
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
        adminRemark: adminRemark || "Product does not meet our guidelines."
      },
      { new: true }
    );

    if (!product) return res.status(404).json({ msg: "Product not found" });

    res.json({ msg: "Product rejected successfully", product });
  } catch (err) {
    res.status(500).json({ msg: "Failed to reject product" });
  }
};

// get pending products for admin approval queue
export const getPendingProducts = async (req, res) => {
  try{
    const pendingProducts = await Product.find({status: "pending"})
      .populate("seller")
    // console.log(pendingProducts);
    res.json(pendingProducts);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch pending products" });
  }
}