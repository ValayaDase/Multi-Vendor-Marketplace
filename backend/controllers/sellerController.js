import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const REVENUE_ORDER_STATUSES = ["confirmed", "processing", "shipped", "delivered"];

const buildSalesSeries = (orders) => {
  const monthMap = new Map();

  orders.forEach((order) => {
    const key = new Date(order.createdAt).toISOString().slice(0, 7);
    const current = monthMap.get(key) || 0;
    monthMap.set(key, current + order.price);
  });

  return [...monthMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([date, value]) => ({ date, value }));
};

export const sendSellerRequest = async (req, res) => {
  try {
    const {
      userId,
      businessName,
      gstin,
      description,
      accountNumber,
      ifscCode,
      bankName,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (!req.file) {
      return res.status(400).json({ msg: "Verification image is required" });
    }

    user.sellerRequest = "pending";
    user.businessDetails = {
      businessName,
      gstin: gstin || "",
      description,
      studioImage: `/uploads/sellerSamples/${req.file.filename}`,
    };
    user.bankDetails = {
      accountNumber,
      ifscCode,
      bankName,
    };

    await user.save();

    res.json({
      msg: "Seller request submitted successfully! Admin will review your profile.",
      status: "pending",
    });
  } catch (err) {
    console.error("Seller Request Error:", err);
    res.status(500).json({ msg: "Server error occurred while processing request" });
  }
};

export const getSellerDetails = async (req, res) => {
  try {
    const seller = await User.findById(req.params.id).select(
      "name email sellerRequest businessDetails sellerRating location",
    );

    if (!seller) {
      return res.status(404).json({ msg: "Seller not found" });
    }

    res.json({
      _id: seller._id,
      name: seller.name,
      email: seller.email,
      sellerRequest: seller.sellerRequest,
      businessName: seller.businessDetails?.businessName || "",
      bio: seller.businessDetails?.description || "",
      rating: seller.sellerRating || 0,
      city: seller.location?.city || "",
      state: seller.location?.state || "",
      country: seller.location?.country || "",
      pincode: seller.location?.pincode || "",
    });
  } catch (err) {
    console.error("Seller Details Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getStats = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const [seller, orders, products] = await Promise.all([
      User.findById(sellerId),
      Order.find({ seller: sellerId }).populate("product").sort({ createdAt: -1 }),
      Product.find({ seller: sellerId }).sort({ createdAt: -1 }),
    ]);

    if (!seller || seller.role !== "seller" || (seller.status && seller.status !== "active")) {
      return res.status(403).json({ msg: "Seller dashboard is unavailable for this account" });
    }

    const revenueOrders = orders.filter((order) => REVENUE_ORDER_STATUSES.includes(order.orderStatus));

    const totalSales = orders
      .filter((order) => REVENUE_ORDER_STATUSES.includes(order.orderStatus))
      .reduce((sum, order) => sum + order.price, 0);

    const pendingOrders = orders.filter((order) =>
      ["pending", "confirmed", "processing"].includes(order.orderStatus),
    ).length;
    const completedOrders = orders.filter((order) => order.orderStatus === "delivered").length;
    const rejectedOrders = orders.filter((order) => order.orderStatus === "rejected").length;

    const topSellingProductsMap = new Map();
    revenueOrders.forEach((order) => {
      const productId = order.product?._id?.toString() || order.product?.toString();
      if (!productId) return;

      const entry = topSellingProductsMap.get(productId) || {
        _id: productId,
        title: order.productTitle || order.product?.title || "Product",
        image: order.productImage || order.product?.thumbnail || order.product?.images?.[0] || "",
        sold: 0,
        revenue: 0,
      };

      entry.sold += order.quantity;
      entry.revenue += order.price;
      topSellingProductsMap.set(productId, entry);
    });

    const topSellingProducts = [...topSellingProductsMap.values()]
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    const lowStockProducts = products
      .filter((product) => product.stock <= 5)
      .slice(0, 5)
      .map((product) => ({
        _id: product._id,
        title: product.title,
        stock: product.stock,
        image: product.thumbnail || product.images?.[0] || "",
      }));

    res.json({
      totalSales,
      totalOrders: orders.length,
      totalProducts: products.length,
      activeProducts: products.filter((product) => product.stock > 0).length,
      pendingOrders,
      completedOrders,
      rejectedOrders,
      lowStockProducts,
      topSellingProducts,
      recentOrders: orders.slice(0, 6),
      salesChart: buildSalesSeries(revenueOrders),
      deliverySettings: {
        city: seller?.location?.city || "",
        state: seller?.location?.state || "",
        country: seller?.location?.country || "",
        pincode: seller?.location?.pincode || "",
      },
      sellerRating: seller?.sellerRating || 0,
      reviewsCount: orders.filter((order) => order.orderStatus === "delivered").length,
      messageCount: 0,
    });
  } catch (err) {
    console.log("Stats Error ->", err);
    res.status(500).json({ msg: "Server error" });
  }
};
