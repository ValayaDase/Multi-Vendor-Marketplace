import fs from "fs";
import path from "path";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";

const REVENUE_ORDER_STATUSES = ["confirmed", "processing", "shipped", "delivered"];
const ACTIVE_SELLER_ORDER_STATUSES = ["pending", "confirmed", "processing"];
const ACTIVE_USER_FILTER = [{ status: "active" }, { status: { $exists: false } }, { status: null }];
const SELLER_DELETION_BLOCKING_STATUSES = ["pending", "confirmed", "processing", "shipped"];

const deactivateSellerCatalog = async (sellerId, adminRemark) => {
  await Product.updateMany(
    { seller: sellerId },
    {
      $set: {
        stock: 0,
        status: "inactive",
        isDeleted: true,
        deletedBy: "admin",
        deletedAt: new Date(),
        adminRemark,
      },
    },
  );
};

const deleteLocalFile = async (fileUrl) => {
  if (!fileUrl) return;

  const imgPath = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl;
  const filePath = path.join(process.cwd(), imgPath);

  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (err) {
    console.log("Failed to delete image file:", err.message);
  }
};

export const getSellerRequests = async (req, res) => {
  try {
    const requests = await User.find({ sellerRequest: "pending" });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const getSellerDeletionRequests = async (req, res) => {
  try {
    const requests = await User.find({ deletionStatus: "pending" }).sort({ deletionRequestedAt: -1 });

    const enriched = await Promise.all(
      requests.map(async (seller) => {
        const [totalOrders, activeOrders, totalRevenue, productCount] = await Promise.all([
          Order.countDocuments({ seller: seller._id }),
          Order.countDocuments({ seller: seller._id, orderStatus: { $in: SELLER_DELETION_BLOCKING_STATUSES } }),
          Order.aggregate([
            { $match: { seller: seller._id, orderStatus: { $in: REVENUE_ORDER_STATUSES } } },
            { $group: { _id: null, total: { $sum: "$price" } } },
          ]),
          Product.countDocuments({ seller: seller._id, $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }] }),
        ]);

        return {
          ...seller.toObject(),
          totalOrders,
          activeOrders,
          revenue: totalRevenue[0]?.total || 0,
          productCount,
          pendingDisputes: 0,
        };
      }),
    );

    res.json(enriched);
  } catch (err) {
    console.error("Get seller deletion requests error:", err);
    res.status(500).json({ msg: "Failed to fetch seller deletion requests" });
  }
};

export const approveSeller = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.role = "seller";
    user.status = "active";
    user.sellerRequest = "approved";
    user.suspendedAt = null;
    user.deletedAt = null;
    user.suspensionReason = "";

    await user.save();

    res.json({ msg: "Seller Approved!" });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const rejectSeller = async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    await deleteLocalFile(user.businessDetails?.studioImage);

    user.businessDetails = {};
    user.bankDetails = {};
    user.sellerRequest = "rejected";

    await user.save();
    res.json({ msg: "User seller request rejected and cleaned!" });
  } catch (err) {
    res.status(500).json({ msg: `Error rejecting seller request: ${err.message}` });
  }
};

export const removeSeller = async (req, res) => {
  try {
    const sellerId = req.params.id;
    const reason = (req.body?.reason || "").trim();
    const user = await User.findById(sellerId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const products = await Product.find({ seller: sellerId });
    await deactivateSellerCatalog(sellerId, "Seller account deleted by admin");

    const activeOrders = await Order.find({
      seller: sellerId,
      orderStatus: { $in: ACTIVE_SELLER_ORDER_STATUSES },
    });

    await Promise.all(
      activeOrders.map(async (order) => {
        order.orderStatus = "seller_deleted";

        if (order.paymentStatus === "paid" && order.paymentRef) {
          order.paymentStatus = "refunded";
          await Payment.findByIdAndUpdate(order.paymentRef, { paymentStatus: "refunded" });
        }

        await order.save();
      }),
    );

    const orders = await Order.find({ seller: sellerId });

    await User.findByIdAndUpdate(sellerId, {
      role: "buyer",
      status: "deleted",
      deletedAt: new Date(),
      suspensionReason: reason,
    });

    if (user.email) {
      await sendEmail(
        user.email,
        "Your Seller Account Has Been Removed",
        `<p>Hello ${user.name || "Seller"},</p><p>Your seller account has been removed by the admin.</p><p>${reason ? `Reason: ${reason}</p>` : ""}<p>Your products have been hidden from buyers. Previous order history is still preserved for platform records.</p>`,
      );
    }

    res.json({
      msg: "Seller deleted successfully. Products were hidden and account was downgraded to buyer.",
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

export const suspendSeller = async (req, res) => {
  try {
    const sellerId = req.params.id;
    const reason = (req.body?.reason || "").trim();
    const user = await User.findById(sellerId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    await deactivateSellerCatalog(sellerId, "Seller suspended by admin");

    user.role = "buyer";
    user.status = "suspended";
    user.suspendedAt = new Date();
    user.suspensionReason = reason;
    await user.save();

    if (user.email) {
      await sendEmail(
        user.email,
        "Your Seller Account Has Been Suspended",
        `<p>Hello ${user.name || "Seller"},</p><p>Your seller account has been suspended.</p><p>${reason ? `Reason: ${reason}</p>` : ""}<p>You can still log in and use the platform as a buyer, but seller access and product management have been disabled.</p>`,
      );
    }

    res.json({ msg: "Seller suspended successfully." });
  } catch (err) {
    console.error("Suspend seller error:", err);
    res.status(500).json({ msg: "Failed to suspend seller" });
  }
};

export const approveSellerDeletionRequest = async (req, res) => {
  try {
    const sellerId = req.params.id;
    const user = await User.findById(sellerId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const blockingOrders = await Order.countDocuments({
      seller: sellerId,
      orderStatus: { $in: SELLER_DELETION_BLOCKING_STATUSES },
    });

    if (blockingOrders > 0) {
      user.deletionRequest = false;
      user.deletionStatus = "rejected";
      user.deletionReviewedAt = new Date();
      user.deletionReason = "Active orders exist";
      await user.save();

      return res.status(400).json({ msg: "Deletion request cannot be approved because active orders still exist." });
    }

    await deactivateSellerCatalog(sellerId, "Seller deletion request approved by admin");

    user.role = "buyer";
    user.status = "deleted";
    user.deletedAt = new Date();
    user.deletionRequest = false;
    user.deletionStatus = "approved";
    user.deletionReviewedAt = new Date();
    user.deletionReason = "";
    await user.save();

    if (user.email) {
      await sendEmail(
        user.email,
        "Your Seller Account Deletion Request Has Been Approved",
        `<p>Hello ${user.name || "Seller"},</p><p>Your seller account deletion request has been approved by the admin.</p><p>Your products have been hidden and your account has been downgraded to buyer access.</p>`,
      );
    }

    res.json({ msg: "Seller deletion request approved successfully." });
  } catch (err) {
    console.error("Approve seller deletion request error:", err);
    res.status(500).json({ msg: "Failed to approve seller deletion request" });
  }
};

export const rejectSellerDeletionRequest = async (req, res) => {
  try {
    const sellerId = req.params.id;
    const reason = (req.body?.reason || "").trim() || "Pending orders";
    const user = await User.findById(sellerId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.deletionRequest = false;
    user.deletionStatus = "rejected";
    user.deletionReviewedAt = new Date();
    user.deletionReason = reason;
    await user.save();

    if (user.email) {
      await sendEmail(
        user.email,
        "Your Seller Account Deletion Request Was Rejected",
        `<p>Hello ${user.name || "Seller"},</p><p>Your seller account deletion request was rejected.</p><p>Reason: ${reason}</p>`,
      );
    }

    res.json({ msg: "Seller deletion request rejected." });
  } catch (err) {
    console.error("Reject seller deletion request error:", err);
    res.status(500).json({ msg: "Failed to reject seller deletion request" });
  }
};

export const restoreSeller = async (req, res) => {
  try {
    const sellerId = req.params.id;
    const user = await User.findById(sellerId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.role = "seller";
    user.status = "active";
    user.suspendedAt = null;
    user.deletedAt = null;
    user.suspensionReason = "";
    user.sellerRequest = "approved";
    await user.save();

    await Product.updateMany(
      { seller: sellerId, isDeleted: true },
      {
        $set: {
          status: "pending",
          isDeleted: false,
          deletedBy: null,
          deletedAt: null,
          adminRemark: "",
        },
      },
    );

    res.json({ msg: "Seller restored successfully. Products moved to pending review." });
  } catch (err) {
    console.error("Restore seller error:", err);
    res.status(500).json({ msg: "Failed to restore seller" });
  }
};

export const getAllSellers = async (req, res) => {
  try {
    const sellers = await User.find({
      $or: [
        { role: "seller" },
        { sellerRequest: "approved" },
        { status: { $in: ["suspended", "deleted"] } },
      ],
    }).sort({ createdAt: -1 });
    const sellersWithStats = await Promise.all(
      sellers.map(async (seller) => {
        const [productCount, orderCount, revenue] = await Promise.all([
          Product.countDocuments({ seller: seller._id, $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }] }),
          Order.countDocuments({ seller: seller._id }),
          Order.aggregate([
            { $match: { seller: seller._id, orderStatus: { $in: REVENUE_ORDER_STATUSES } } },
            { $group: { _id: null, total: { $sum: "$price" } } },
          ]),
        ]);

        return {
          ...seller.toObject(),
          productCount,
          orderCount,
          revenue: revenue[0]?.total || 0,
        };
      }),
    );

    res.json(sellersWithStats);
  } catch (err) {
    console.error("Error loading sellers:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getStatCounts = async (req, res) => {
  try {
    const [
      totalUsers,
      totalBuyers,
      totalSellers,
      totalOrders,
      totalProducts,
      totalRevenueRaw,
      sellerUsers,
      products,
      orders,
      pendingSellers,
      pendingProducts,
      cancelledOrders,
      refundedOrders,
      deliveredOrders,
      activeOrders,
      categoryCounts,
    ] =
      await Promise.all([
        User.countDocuments({
          role: { $ne: "admin" },
        }),
        User.countDocuments({
          role: "buyer",
          $or: ACTIVE_USER_FILTER,
          sellerRequest: { $ne: "approved" },
        }),
        User.countDocuments({ role: "seller", $or: ACTIVE_USER_FILTER }),
        Order.countDocuments(),
        Product.countDocuments({ $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }] }),
        Order.aggregate([
          { $match: { orderStatus: { $in: REVENUE_ORDER_STATUSES } } },
          { $group: { _id: null, total: { $sum: "$price" } } },
        ]),
        User.find({ role: "seller", $or: ACTIVE_USER_FILTER }).select("name sellerRating businessDetails"),
        Product.find({
          status: "approved",
          stock: { $gt: 0 },
          $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
        }).sort({ createdAt: -1 }).limit(6),
        Order.find().populate("buyer seller product").sort({ createdAt: -1 }).limit(8),
        User.countDocuments({ sellerRequest: "pending" }),
        Product.countDocuments({ status: "pending", $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }] }),
        Order.countDocuments({ orderStatus: "cancelled" }),
        Order.countDocuments({ orderStatus: "refunded" }),
        Order.countDocuments({ orderStatus: "delivered" }),
        Order.countDocuments({ orderStatus: { $in: ACTIVE_SELLER_ORDER_STATUSES } }),
        Product.aggregate([
          {
            $match: {
              status: "approved",
              stock: { $gt: 0 },
              $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
            },
          },
          {
            $group: {
              _id: "$category",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1, _id: 1 } },
        ]),
      ]);

    const totalRevenue = totalRevenueRaw[0]?.total || 0;

    const topProductsRaw = await Order.aggregate([
      {
        $match: {
          orderStatus: { $in: REVENUE_ORDER_STATUSES },
        },
      },
      {
        $group: {
          _id: "$product",
          totalSold: { $sum: "$quantity" },
          revenue: { $sum: "$price" },
          title: { $first: "$productTitle" },
          image: { $first: "$productImage" },
          category: { $first: "$productCategory" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    const sellerRevenue = await Order.aggregate([
      {
        $match: {
          orderStatus: { $in: REVENUE_ORDER_STATUSES },
        },
      },
      {
        $group: {
          _id: "$seller",
          totalSales: { $sum: "$price" },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { totalSales: -1 } },
    ]);

    const topSellers = sellerRevenue.slice(0, 5).map((entry) => {
      const seller = sellerUsers.find((item) => item._id.toString() === entry._id.toString());
      return {
        _id: entry._id,
        name: seller?.name || "Seller",
        sellerRating: seller?.sellerRating || 0,
        businessDetails: seller?.businessDetails || {},
        totalSales: entry.totalSales,
        totalOrders: entry.totalOrders,
      };
    });

    res.json({
      totalUsers,
      totalBuyer: totalBuyers,
      totalSellers,
      totalOrders,
      totalProducts,
      totalRevenue,
      activeOrders,
      cancelledOrders,
      refundedOrders,
      deliveredOrders,
      pendingSellers,
      pendingProducts,
      topSellers,
      topProducts: topProductsRaw,
      recentOrders: orders,
      recentProducts: products,
      categoryManagement: categoryCounts.map((item) => ({ name: item._id || "uncategorized", count: item.count })),
    });
  } catch (error) {
    console.error("Stat Count Error:", error.message);
    res.status(500).json({ msg: "Server error" });
  }
};

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

export const approveProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        status: "approved",
        isDeleted: false,
        deletedBy: null,
        deletedAt: null,
        adminRemark: "",
      },
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

export const rejectProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { adminRemark } = req.body;

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

export const getPendingProducts = async (req, res) => {
  try {
    const pendingProducts = await Product.find({ status: "pending", isDeleted: false }).populate("seller");
    res.json(pendingProducts);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch pending products" });
  }
};
