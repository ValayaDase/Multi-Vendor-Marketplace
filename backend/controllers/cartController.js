import Cart from "../models/Cart.js";

export const addToCart = async (req, res) => {
  try {
    const user = req.user.id;
    const { productId } = req.body;

    let cartItem = await Cart.findOne({ user, product: productId });

    if (cartItem) {
      cartItem.quantity += 1;
      await cartItem.save();
      return res.json({ msg: "Quantity updated" });
    }

    await Cart.create({ user, product: productId });
    res.json({ msg: "Added to cart!" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error adding to cart" });
  }
};


export const getCartItems = async (req, res) => {
  try {
    const user = req.user.id;

    const items = await Cart.find({ user })
      .populate("product"); // to get product details

    res.json(items);

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error fetching cart" });
  }
};


export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    await Cart.findByIdAndDelete(itemId);

    res.json({ msg: "Item removed" });
  } catch (err) {
    res.status(500).json({ msg: "Error removing item" });
  }
};


export const updateQuantity = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) return res.json({ msg: "Quantity cannot be zero" });

    const item = await Cart.findById(itemId);
    item.quantity = quantity;
    await item.save();

    res.json({ msg: "Quantity updated" });
  } catch (err) {
    res.status(500).json({ msg: "Error updating quantity" });
  }
};


export const getCartCount = async (req, res) => {
  try {
    const user = req.user.id;
    const count = await Cart.countDocuments({ user });
    res.json({ count });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error fetching cart count" });
  }
};

