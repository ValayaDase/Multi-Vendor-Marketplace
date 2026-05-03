import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { getRecommendedProducts } from "./productController.js";
import { sendEmail } from "../utils/sendEmail.js";

const REVENUE_ORDER_STATUSES = ["confirmed", "processing", "shipped", "delivered"];
const NON_SPEND_STATUSES = ["cancelled", "refunded", "seller_deleted", "rejected"];

const getActiveSeller = async (sellerId) => {
  const seller = await User.findById(sellerId).select("role status");
  if (!seller || seller.role !== "seller" || (seller.status && seller.status !== "active")) {
    return null;
  }
  return seller;
};

export const createOrder = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { productId, quantity, billingInfo } = req.body;

    const billingName = req.body.billingName || billingInfo?.name;
    const billingEmail = req.body.billingEmail || billingInfo?.email;
    const billingPhone = req.body.billingPhone || billingInfo?.phone;
    const billingAddress = req.body.billingAddress || billingInfo?.address;
    const billingPincode = req.body.billingPincode || billingInfo?.pincode;

    const product = await Product.findById(productId).populate("seller", "role status");
    if (!product) return res.status(404).json({ msg: "Product not found" });

    if (product.status !== "approved" || product.seller?.role !== "seller" || (product.seller?.status && product.seller?.status !== "active")) {
      return res.status(400).json({ msg: "This product is no longer available for purchase" });
    }

    const qty = quantity > 0 ? quantity : 1;

    if (qty > product.stock) {
      return res.status(400).json({ msg: `Only ${product.stock} units available` });
    }

    const totalPrice = product.price * qty;

    const order = await Order.create({
      buyer: buyerId,
      seller: product.seller,
      product: product._id,
      quantity: qty,
      price: totalPrice,
      productTitle: product.title,
      productName: product.title,
      productImage: product.thumbnail || product.images?.[0] || "",
      imageUrl: product.thumbnail || product.images?.[0] || "",
      productCategory: product.category,
      billingName,
      billingEmail,
      billingPhone,
      billingAddress,
      billingPincode,
      orderStatus: "pending",
      paymentStatus: "pending",
    });

    product.stock -= qty;
    await product.save();

    res.json({ msg: "Order created", order });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getBuyerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate("product")
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Buyer Orders Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const seller = await getActiveSeller(sellerId);
    if (!seller) {
      return res.status(403).json({ msg: "Seller access is unavailable for this account" });
    }

    const orders = await Order.find({ seller: sellerId })
      .populate("product")
      .populate("buyer", "name email location")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.log("Seller orders error:", err);
    res.status(500).json({ msg: "Error fetching seller orders" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const seller = await getActiveSeller(sellerId);
    if (!seller) {
      return res.status(403).json({ msg: "Seller access is unavailable for this account" });
    }

    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ msg: "Missing fields" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    if (order.seller.toString() !== sellerId) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    order.orderStatus = status;
    await order.save();

    res.json({ msg: "Order status updated", order });
  } catch (err) {
    console.error("Update Order Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ msg: "Order ID required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    if (order.buyer.toString() !== userId && order.seller.toString() !== userId) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    if (["shipped", "delivered", "cancelled", "refunded"].includes(order.orderStatus)) {
      return res.status(400).json({ msg: "Cannot cancel at this stage" });
    }

    order.orderStatus = "cancelled";

    let cancellationMessage = "Your order has been cancelled successfully.";

    if (order.paymentStatus === "paid") {
      order.paymentStatus = "refunded";
      cancellationMessage = "Your order has been cancelled and the payment has been marked for refund.";

      if (order.paymentRef) {
        const payment = await Payment.findById(order.paymentRef);
        if (payment && payment.paymentStatus !== "refunded") {
          payment.paymentStatus = "refunded";
          await payment.save();
        }
      }
    }

    await order.save();

    const product = await Product.findById(order.product);
    if (product && product.seller?.toString() === order.seller.toString()) {
      product.stock += order.quantity;
      await product.save();
    }

    const buyer = await User.findById(order.buyer).select("name email");
    if (buyer?.email) {
      await sendEmail(
        buyer.email,
        "Your order has been cancelled - VendorHub",
        `<p>Hello ${buyer.name || "Customer"},</p><p>Your order for <strong>${order.productTitle}</strong> has been cancelled.</p><p>Order amount: Rs.${order.price}</p>`,
      );
    }

    res.json({ msg: cancellationMessage, order });
  } catch (err) {
    console.error("Cancel Order Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getBuyerAnalytics = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const [orders, recommendedProducts, wishlistItems] = await Promise.all([
      Order.find({ buyer: buyerId }).populate("product seller").sort({ createdAt: -1 }),
      getRecommendedProducts(buyerId, 6),
      Product.countDocuments({ savedBy: buyerId }),
    ]);

    const totalOrders = orders.length;
    const totalSpent = orders
      .filter((order) => order.paymentStatus === "paid" && !NON_SPEND_STATUSES.includes(order.orderStatus))
      .reduce((sum, order) => sum + order.price, 0);
    const pendingOrders = orders.filter((order) =>
      ["pending", "confirmed", "processing"].includes(order.orderStatus),
    ).length;
    const deliveredOrders = orders.filter((order) => order.orderStatus === "delivered").length;
    const cancelledOrders = orders.filter((order) => order.orderStatus === "cancelled").length;
    const savedAmount = orders
      .filter((order) => REVENUE_ORDER_STATUSES.includes(order.orderStatus))
      .reduce((sum, order) => sum + Math.round(order.price * 0.05), 0);

    const reordered = orders
      .filter(
        (order) =>
          order.product &&
          order.product.status === "approved" &&
          order.product.stock > 0 &&
          order.seller?.role === "seller" &&
          (!order.seller?.status || order.seller?.status === "active"),
      )
      .slice(0, 3)
      .map((order) => ({
        orderId: order._id,
        productId: order.product._id,
        title: order.product.title || order.productTitle,
        price: order.product.price || order.price,
        image: order.product.thumbnail || order.product.images?.[0] || order.productImage,
      }));

    res.json({
      totalOrders,
      totalSpent,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      recentOrders: orders.slice(0, 5),
      wishlistItems,
      recommendedProducts,
      reorderItems: reordered,
      savedAmount,
    });
  } catch (err) {
    console.error("Buyer analytics error:", err);
    res.status(500).json({ msg: "Failed to load buyer analytics" });
  }
};
