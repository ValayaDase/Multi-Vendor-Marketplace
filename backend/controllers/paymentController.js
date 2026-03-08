// controllers/paymentController.js
import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
// import CustomOrder from "../models/CustomOrder.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";

// -------- NORMAL PRODUCT PAYMENT --------
export const createProductPayment = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { orderId, billingInfo } = req.body;

    if (!orderId) return res.status(400).json({ msg: "Order ID required" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ msg: "Order not found" });

    if (order.buyer.toString() !== buyerId)
      return res.status(403).json({ msg: "Not authorized" });

    if (order.paymentStatus === "paid")
      return res.status(400).json({ msg: "Already paid" });

    const sellerId = order.seller;

    const payment = await Payment.create({
      buyer: buyerId,
      seller: sellerId,
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

    // ✅ Save billing info to ORDER, not payment
    if (billingInfo) {
      order.billingName = billingInfo.name;
      order.billingEmail = billingInfo.email;
      order.billingPhone = billingInfo.phone;
      order.billingAddress = billingInfo.address;
    }

    await order.save();

    await Cart.deleteMany({ user: buyerId, product: order.product });

    res.json({ msg: "Payment successful", payment, order });
  } catch (err) {
    console.error("Payment error:", err);
    res.status(500).json({ msg: "Payment failed" });
  }
};

// -------- CUSTOM ORDER ADVANCE --------
export const payAdvance = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { customOrderId, amount, sellerId, billingInfo } = req.body;
    if (!customOrderId || !amount || !sellerId)
      return res.status(400).json({ msg: "Missing required fields" });

    const custom = await CustomOrder.findById(customOrderId);
    if (!custom) return res.status(404).json({ msg: "Custom order not found" });

    // Prevent duplicate advance if you track advancePaid
    if (custom.advancePaid)
      return res.status(400).json({ msg: "Advance already paid" });

    const payment = await Payment.create({
      buyer: buyerId,
      seller: sellerId,
      buyerName: billingInfo.name,
      buyerEmail: billingInfo.email,
      customOrder: customOrderId,
      amount,
      type: "advance",
      paymentStatus: "received",
    });

    // update custom order status and mark advance paid (add fields to model if desired)
    custom.status = "in-progress";
    custom.advancePaid = true; // requires adding this field to model (recommended)
    await custom.save();

    res.json({ msg: "Advance paid", payment, custom });
  } catch (err) {
    console.error("payAdvance error:", err);
    res.status(500).json({ msg: "Advance payment failed" });
  }
};

// -------- CUSTOM ORDER FINAL --------
export const payFinal = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { customOrderId, amount, sellerId, billingInfo } = req.body;
    if (!customOrderId || !amount || !sellerId)
      return res.status(400).json({ msg: "Missing required fields" });

    const custom = await CustomOrder.findById(customOrderId);
    if (!custom) return res.status(404).json({ msg: "Custom order not found" });

    if (custom.finalPaid)
      return res.status(400).json({ msg: "Final already paid" });

    const payment = await Payment.create({
      buyer: buyerId,
      seller: sellerId,
      buyerName: billingInfo.name,
      buyerEmail: billingInfo.email,
      customOrder: customOrderId,
      amount,
      type: "final",
      paymentStatus: "received",
    });

    custom.status = "completed";
    custom.finalPaid = true; // requires model field
    await custom.save();

    res.json({ msg: "Final payment completed", payment, custom });
  } catch (err) {
    console.error("payFinal error:", err);
    res.status(500).json({ msg: "Final payment failed" });
  }
};

// -------- FETCH PAYMENTS --------
export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      $or: [{ buyer: req.user.id }, { seller: req.user.id }],
    }).populate("order customOrder buyer seller");
    res.json(payments);
  } catch (err) {
    console.error("getMyPayments error:", err);
    res.status(500).json({ msg: "Error fetching payments" });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    // optional: ensure admin
    if (req.user.role !== "admin")
      return res.status(403).json({ msg: "Admin only" });

    const payments = await Payment.find().populate(
      "buyer seller order customOrder",
    );
    res.json(payments);
  } catch (err) {
    console.error("getAllPayments error:", err);
    res.status(500).json({ msg: "Error fetching payments" });
  }
};

// -------- ADMIN REFUND PAYMENT --------
export const refundPayment = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Admin only" });
    }

    const paymentId = req.params.paymentId;

    // Find payment
    const payment = await Payment.findById(paymentId)
      .populate("buyer")
      .populate("order")
      .populate("customOrder");

    if (!payment) {
      return res.status(404).json({ msg: "Payment not found" });
    }

    if (payment.paymentStatus === "refunded") {
      return res.status(400).json({ msg: "Already refunded" });
    }

    // Update payment
    payment.paymentStatus = "refunded";
    await payment.save();

    // Update related order
    if (payment.order) {
      const order = await Order.findById(payment.order).populate("product");

      if (order) {
        order.orderStatus = "refunded";
        order.paymentStatus = "refunded";
        await order.save();

        // Restore stock
        if (order.product) {
          const product = await Product.findById(order.product._id);
          if (product) {
            product.stock = (product.stock || 0) + order.quantity;
            await product.save();
            console.log(
              `Stock restored: +${order.quantity} for product ${product._id}`,
            );
          }
        }
      }
    }

    // Update custom order
    if (payment.customOrder) {
      await CustomOrder.findByIdAndUpdate(payment.customOrder, {
        status: "refunded",
      });
    }

    //  Send refund email
    try {
      if (payment.buyer && payment.buyer.email) {
        await sendEmail(
          payment.buyer.email,
          "Payment Refunded - Art Point",
          `Hello ${payment.buyer.name || "Customer"},

Your payment of ₹${payment.amount} has been successfully refunded by the admin.

The refunded amount will be credited to your original payment method within 5-7 business days.

Order Details:
- Payment ID: ${payment._id}
- Amount: ₹${payment.amount}
- Date: ${new Date(payment.createdAt).toLocaleDateString()}

If you have any questions, please contact our support team. 

Thank you,
Art Point Team`,
        );

        console.log("Refund email sent to:", payment.buyer.email);
      }
    } catch (emailErr) {
      console.error("Email failed (non-critical):", emailErr.message);
      // Don't fail refund if email fails
    }

    console.log("Refund completed for payment:", paymentId);
    res.json({ msg: "Payment refunded successfully" });
  } catch (err) {
    console.error("=== REFUND ERROR ===");
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);
    res.status(500).json({
      msg: "Refund failed",
      error: err.message,
    });
  }
};

// bulk cart payment
// -------- BULK CART PAYMENT --------
export const createBulkCartPayment = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { orderIds, billingInfo } = req.body;

    if (!orderIds || orderIds.length === 0)
      return res.status(400).json({ msg: "Order IDs required" });

    const successfulOrders = [];
    const failedOrders = [];

    // Process each order
    for (let orderId of orderIds) {
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

        // Create payment
        const payment = await Payment.create({
          buyer: buyerId,
          seller: order.seller,
          buyerName: billingInfo.name,
          buyerEmail: billingInfo.email,
          order: orderId,
          amount: order.price,
          type: "product",
          paymentStatus: "received",
          billingInfo,
        });

        // Update order
        order.paymentRef = payment._id;
        order.paymentStatus = "paid";
        order.orderStatus = "confirmed";
        await order.save();

        // Delete from cart
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
