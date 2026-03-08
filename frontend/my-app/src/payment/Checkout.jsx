import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { getImageUrl } from "../config/api";
import {
  MdOutlineLocalShipping,
  MdOutlineSecurity,
  MdChevronLeft,
  MdVerifiedUser,
  MdOutlineAccountBalanceWallet,
} from "react-icons/md";

export default function Checkout() {
  const navigate = useNavigate();
  const [checkoutData, setCheckoutData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [billing, setBilling] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("checkoutItem"));
    if (!data) {
      navigate("/buyer/cart");
      return;
    }
    setCheckoutData(data);
  }, [navigate]);

  if (!checkoutData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Common logic for both Single Buy and Cart
  const itemsForCheckout =
    checkoutData.mode === "single" ? [checkoutData] : checkoutData.items;
  const subtotal = itemsForCheckout.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0,
  );
  const total = subtotal;

  const handleChange = (e) => {
    setBilling({ ...billing, [e.target.name]: e.target.value });
  };

  const payNow = async () => {
    if (!billing.name || !billing.email || !billing.phone || !billing.address) {
      alert("Please fill all delivery details!");
      return;
    }

    setLoading(true);
    try {
      const orderIds = [];
      // Create orders for each item
      for (const item of itemsForCheckout) {
        const res = await api.post("/orders/create", {
          productId: item.productId,
          quantity: item.quantity,
          billingName: billing.name,
          billingEmail: billing.email,
          billingPhone: billing.phone,
          billingAddress: billing.address,
        });
        orderIds.push(res.data.order._id);
      }

      // Process bulk payment
      await api.post("/payments/bulk-cart", {
        orderIds: orderIds,
        billingInfo: billing,
      });

      localStorage.removeItem("checkoutItem");
      window.dispatchEvent(new Event("cartUpdated"));
      navigate("/buyer/purchased");
    } catch (err) {
      alert("Payment Failed: " + (err.response?.data?.msg || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 font-sans">
      {/* --- MEESHO STYLE HEADER --- */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-gray-800 font-bold text-xs hover:text-red-600 transition-colors"
          >
            <MdChevronLeft size={22} /> BACK
          </button>
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <div className="w-5 h-5 bg-gray-200 rounded-full text-[10px] flex items-center justify-center font-bold">
                1
              </div>
              <span className="text-[10px] font-bold text-gray-400 mt-1">
                CART
              </span>
            </div>
            <div className="w-12 h-[2px] bg-gray-200 mb-4"></div>
            <div className="flex flex-col items-center">
              <div className="w-5 h-5 bg-red-600 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                2
              </div>
              <span className="text-[10px] font-bold text-red-600 mt-1">
                CHECKOUT
              </span>
            </div>
          </div>
          <div className="w-10"></div> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- LEFT SIDE: SHIPPING & PRODUCTS --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Form */}
          <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6 border-b pb-4 border-gray-50">
              <MdOutlineLocalShipping className="text-red-600" size={24} />
              <h2 className="text-sm font-black uppercase tracking-tight text-gray-800">
                Delivery Address
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-gray-500 uppercase">
                  Full Name
                </p>
                <input
                  name="name"
                  type="text"
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-sm text-sm focus:border-black outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-gray-500 uppercase">
                  Phone Number
                </p>
                <input
                  name="phone"
                  type="tel"
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-sm text-sm focus:border-black outline-none transition-all"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <p className="text-[11px] font-bold text-gray-500 uppercase">
                  Email Address
                </p>
                <input
                  name="email"
                  type="email"
                  onChange={handleChange}
                  placeholder="yourname@gmail.com"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-sm text-sm focus:border-black outline-none transition-all"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <p className="text-[11px] font-bold text-gray-500 uppercase">
                  Full Address
                </p>
                <textarea
                  name="address"
                  rows="3"
                  onChange={handleChange}
                  placeholder="House No, Building, Street, Landmark"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-sm text-sm focus:border-black outline-none transition-all resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Product Preview */}
          <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-black uppercase tracking-tight text-gray-800 mb-4">
              Order Summary
            </h2>
            <div className="divide-y divide-gray-50">
              {itemsForCheckout.map((item, idx) => (
                <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="w-20 h-24 bg-gray-100 rounded-sm overflow-hidden flex-shrink-0 border border-gray-100">
                    <img
                      src={getImageUrl(item.image || item.image?.[0])}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/150";
                      }}
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 font-semibold mt-1">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black text-gray-900">
                        ₹{item.price}
                      </p>
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-sm">
                        FREE DELIVERY
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDE: PRICE DETAILS --- */}
        <div className="space-y-4">
          <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-xs font-bold text-gray-400 uppercase mb-6 tracking-tight">
              Price Details
            </h2>

            <div className="space-y-4 text-sm font-medium">
              <div className="flex justify-between text-gray-600">
                <span>Total Product Price</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Total Discounts</span>
                <span>- ₹0</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charges</span>
                <span className="text-green-600 uppercase font-bold">Free</span>
              </div>

              <div className="h-px bg-gray-100 my-2"></div>

              <div className="flex justify-between text-lg font-black text-gray-900">
                <span>Order Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            <button
              onClick={payNow}
              disabled={loading}
              className={`w-full mt-8 py-4 font-black uppercase text-xs tracking-wider rounded-sm shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3
                ${loading ? "bg-gray-400 cursor-not-allowed text-white" : "bg-red-600 hover:bg-black text-white"}`}
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  <MdOutlineAccountBalanceWallet size={18} />
                  Continue to Pay ₹{total}
                </>
              )}
            </button>

            {/* Trust Badges */}
            <div className="mt-8 pt-6 border-t border-gray-50 space-y-4">
              <div className="flex items-center gap-3">
                <MdVerifiedUser className="text-blue-500" size={20} />
                <p className="text-[10px] font-bold text-gray-500 uppercase leading-tight">
                  100% Secure Payments <br />
                  <span className="text-gray-300 font-medium">
                    PCI-DSS Compliant
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <MdOutlineSecurity className="text-gray-400" size={20} />
                <p className="text-[10px] font-bold text-gray-500 uppercase leading-tight">
                  Easy Returns <br />
                  <span className="text-gray-300 font-medium">
                    7-day replacement policy
                  </span>
                </p>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-gray-400 text-center px-4">
            By continuing, you agree to ArtPoint's{" "}
            <span className="underline">Terms of Service</span> and{" "}
            <span className="underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
