import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api, { getImageUrl } from "../../config/api";

export default function CartPage() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const loadCart = () => {
    api
      .get("/cart")
      .then((res) => setItems(res.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    loadCart();
  }, []);

  const removeItem = async (id) => {
    await api.delete(`/cart/${id}`);
    loadCart();
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const updateQty = async (id, q) => {
    await api.put(`/cart/${id}`, { quantity: q });
    loadCart();
  };

  const total = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0,
  );

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-light text-gray-900 mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-500">{items.length} items in your cart</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold">Your cart is empty</h2>
            <button
              className="mt-6 px-6 py-3 bg-slate-900 text-white rounded-full"
              onClick={() => navigate("/buyer")}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="bg-white border rounded-2xl shadow-sm p-5 flex gap-5"
                >
                  <div
                    onClick={() =>
                      navigate(`/buyer/product/${item.product._id}`)
                    }
                    className="cursor-pointer"
                  >
                    <img
                      src={`${getImageUrl(item.product.images[0])}`}
                      className="w-28 h-28 rounded-xl object-cover"
                      alt=""
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <h2 className="text-lg font-semibold">
                      {item.product.title}
                    </h2>
                    <p className="text-xl font-bold">₹{item.product.price}</p>

                    <div className="flex justify-between mt-4">
                      {/* Quantity */}
                      <div className="flex items-center gap-3">
                        <span>Qty:</span>
                        <div className="flex border rounded-lg overflow-hidden">
                          <button
                            disabled={item.quantity <= 1}
                            onClick={() =>
                              updateQty(item._id, item.quantity - 1)
                            }
                            className="px-3"
                          >
                            −
                          </button>

                          <span className="px-4">{item.quantity}</span>

                          <button
                            onClick={() =>
                              updateQty(item._id, item.quantity + 1)
                            }
                            className="px-3"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item._id)}
                        className="text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm sticky top-20">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <p className="flex justify-between">
                <span>Subtotal</span> <span>₹{total}</span>
              </p>

              <p className="mt-4 flex justify-between font-bold text-lg">
                <span>Total</span> <span>₹{total}</span>
              </p>

              {/* CHECKOUT FULL CART */}
              <button
                className="mt-6 w-full bg-slate-900 text-white py-3 rounded-full hover:bg-slate-800"
                onClick={() => {
                  console.log("Cart items:", items);

                  const checkoutData = {
                    mode: "cart",
                    items: items.map((i) => {
                      console.log("Product ID:", i.product._id);
                      return {
                        productId: i.product._id,
                        sellerId: i.product.seller,
                        quantity: i.quantity,
                        price: i.product.price,
                        title: i.product.title,
                        image: i.product.images[0],
                      };
                    }),
                  };

                  console.log("Final checkout data:", checkoutData);

                  localStorage.setItem(
                    "checkoutItem",
                    JSON.stringify(checkoutData),
                  );
                  navigate("/buyer/checkout");
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
