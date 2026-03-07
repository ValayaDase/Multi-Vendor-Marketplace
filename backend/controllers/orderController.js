import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

//BUY NOW → CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const { productId, quantity, billingInfo } = req.body;

    // Support for old format (billingName, billingEmail...)
    let billingName = req.body.billingName || billingInfo?.name;
    let billingEmail = req.body.billingEmail || billingInfo?.email;
    let billingPhone = req.body.billingPhone || billingInfo?.phone;
    let billingAddress = req.body.billingAddress || billingInfo?.address;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ msg: "Product not found" });

    const qty = quantity > 0 ? quantity : 1;

    // Stock check
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

      billingName,
      billingEmail,
      billingPhone,
      billingAddress,

      orderStatus: "pending",
      paymentStatus: "pending"
    });

    // Reduce stock
    product.stock -= qty;
    await product.save();

    res.json({ msg: "Order created", order });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};




//GET ALL ORDERS OF BUYER

export const getBuyerOrders = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const orders = await Order.find({ buyer: buyerId })
      .populate("product")
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {
    console.error("Buyer Orders Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};


//GET ALL ORDERS OF SELLER

export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.params.id;

    const orders = await Order.find({ seller: sellerId })
      .populate("product")
      .populate("buyer")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {
    console.log("Seller orders error:", err);
    res.status(500).json({ msg: "Error fetching seller orders" });
  }
};



//UPDATE ORDER STATUS (seller)

export const updateOrderStatus = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ msg: "Missing fields" });
    }

    const order = await Order.findById(orderId);
    if (!order)
      return res.status(404).json({ msg: "Order not found" });

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


// CANCEL ORDER (buyer)

export const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.body;

    if (!orderId)
      return res.status(400).json({ msg: "Order ID required" });

    const order = await Order.findById(orderId);
    if (!order)
      return res.status(404).json({ msg: "Order not found" });

    // Allow buyer OR seller to cancel
    if (
      order.buyer.toString() !== userId &&
      order.seller.toString() !== userId
    ) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    // Restrict cancellation at certain stages
    if (["shipped", "delivered", "cancelled"].includes(order.status)) {
      return res.status(400).json({ msg: "Cannot cancel at this stage" });
    }

    order.orderStatus = "cancelled";
    await order.save();

    res.json({ msg: "Order cancelled", order });

  } catch (err) {
    console.error("Cancel Order Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

