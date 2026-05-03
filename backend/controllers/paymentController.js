import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Product from "../models/Product.js";
import { sendEmail } from "../utils/sendEmail.js";

export const createProductPayment = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { orderId, billingInfo } = req.body;

    if (!orderId) {
      return res.status(400).json({ msg: "Order ID required" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ msg: "Order not found" });

    if (order.buyer.toString() !== buyerId) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ msg: "Already paid" });
    }

    const payment = await Payment.create({
      buyer: buyerId,
      seller: order.seller,
      buyerName: billingInfo.name,
      buyerEmail: billingInfo.email,
      order: orderId,
      amount: order.price,
      type: "product",
      paymentStatus: "received",
    });

    order.paymentRef = payment._id;
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";

    if (billingInfo) {
      order.billingName = billingInfo.name;
      order.billingEmail = billingInfo.email;
      order.billingPhone = billingInfo.phone;
      order.billingAddress = billingInfo.address;
      order.billingPincode = billingInfo.pincode;
    }

    await order.save();
    await Cart.deleteMany({ user: buyerId, product: order.product });

    res.json({ msg: "Payment successful", payment, order });
  } catch (err) {
    console.error("Payment error:", err);
    res.status(500).json({ msg: "Payment failed" });
  }
};

export const payAdvance = async (req, res) => {
  res.status(501).json({ msg: "Custom advance payments are not configured in this build." });
};

export const payFinal = async (req, res) => {
  res.status(501).json({ msg: "Custom final payments are not configured in this build." });
};

export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      $or: [{ buyer: req.user.id }, { seller: req.user.id }],
    }).populate("order buyer seller");
    res.json(payments);
  } catch (err) {
    console.error("getMyPayments error:", err);
    res.status(500).json({ msg: "Error fetching payments" });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ msg: "Admin only" });

    const payments = await Payment.find().populate("buyer seller order");
    res.json(payments);
  } catch (err) {
    console.error("getAllPayments error:", err);
    res.status(500).json({ msg: "Error fetching payments" });
  }
};

export const refundPayment = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Admin only" });
    }

    const paymentId = req.params.paymentId;
    const payment = await Payment.findById(paymentId).populate("buyer").populate("order");

    if (!payment) {
      return res.status(404).json({ msg: "Payment not found" });
    }

    if (payment.paymentStatus === "refunded") {
      return res.status(400).json({ msg: "Already refunded" });
    }

    payment.paymentStatus = "refunded";
    await payment.save();

    if (payment.order) {
      const order = await Order.findById(payment.order).populate("product");

      if (order) {
        order.orderStatus = "refunded";
        order.paymentStatus = "refunded";
        await order.save();

        if (order.product) {
          const product = await Product.findById(order.product._id);
          if (product) {
            product.stock = (product.stock || 0) + order.quantity;
            await product.save();
          }
        }
      }
    }

    try {
      if (payment.buyer?.email) {
        await sendEmail(
          payment.buyer.email,
          "Payment Refunded - VendorHub",
          `Hello ${payment.buyer.name || "Customer"}, your payment of Rs.${payment.amount} has been refunded.`,
        );
      }
    } catch (emailErr) {
      console.error("Refund email failed:", emailErr.message);
    }

    res.json({ msg: "Payment refunded successfully" });
  } catch (err) {
    console.error("Refund error:", err);
    res.status(500).json({ msg: "Refund failed", error: err.message });
  }
};

export const createBulkCartPayment = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { orderIds, billingInfo } = req.body;

    if (!orderIds || orderIds.length === 0) {
      return res.status(400).json({ msg: "Order IDs required" });
    }

    const successfulOrders = [];
    const failedOrders = [];

    for (const orderId of orderIds) {
      try {
        const order = await Order.findById(orderId).populate("product");

        if (!order) {
          failedOrders.push({ orderId, reason: "Order not found" });
          continue;
        }

        if (order.buyer.toString() !== buyerId) {
          failedOrders.push({ orderId, reason: "Not authorized" });
          continue;
        }

        if (order.paymentStatus === "paid") {
          failedOrders.push({ orderId, reason: "Already paid" });
          continue;
        }

        const payment = await Payment.create({
          buyer: buyerId,
          seller: order.seller,
          buyerName: billingInfo.name,
          buyerEmail: billingInfo.email,
          order: orderId,
          amount: order.price,
          type: "product",
          paymentStatus: "received",
        });

        order.paymentRef = payment._id;
        order.paymentStatus = "paid";
        order.orderStatus = "confirmed";
        order.billingName = billingInfo.name;
        order.billingEmail = billingInfo.email;
        order.billingPhone = billingInfo.phone;
        order.billingAddress = billingInfo.address;
        order.billingPincode = billingInfo.pincode;
        await order.save();

        await Cart.deleteMany({ user: buyerId, product: order.product._id });
        successfulOrders.push(orderId);
      } catch (err) {
        console.error(`Error processing order ${orderId}:`, err);
        failedOrders.push({ orderId, reason: err.message });
      }
    }

    if (successfulOrders.length === 0) {
      return res.status(400).json({
        msg: "All payments failed",
        failedOrders,
      });
    }

    res.json({
      msg: "Bulk payment processed",
      successfulOrders,
      failedOrders,
      totalSuccess: successfulOrders.length,
      totalFailed: failedOrders.length,
    });
  } catch (err) {
    console.error("Bulk payment error:", err);
    res.status(500).json({ msg: "Bulk payment failed" });
  }
};
