import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api, {getImageUrl} from "../config/api";

export default function Checkout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

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
    if (! data) {
      navigate("/buyer/cart");
      return;
    }
    setCheckoutData(data);
  }, [navigate]);

  if (!checkoutData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-slate-50 via-white to-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Loading checkout... </p>
        </div>
      </div>
    );
  }

  const isSingle = checkoutData.mode === "single";
  const isCart = checkoutData.mode === "cart";

  let itemsForCheckout = isSingle ?  [checkoutData] : checkoutData.items;

  let subtotal = 0;
  itemsForCheckout.forEach((i) => (subtotal += i.quantity * i.price));
  const total = subtotal;

  const handleChange = (e) => {
    setBilling({ ...billing, [e.target.name]:  e.target.value });
  };

  const payNow = async () => {
    // Validation
    if (!billing. name || ! billing.email || !billing.phone || !billing.address) {
      alert("Please fill all billing fields!");
      return;
    }

    console.log("=== PAYMENT STARTED ===");
    console.log("Items for checkout:", itemsForCheckout);

    // Validate items have productId
    const invalidItems = itemsForCheckout. filter(item => !item.productId);
    if (invalidItems.length > 0) {
      console.error("Invalid items found:", invalidItems);
      alert("Some items are missing product information. Please refresh and try again.");
      return;
    }

    setLoading(true);

    try {
      const orderIds = [];

      console.log("Step 1: Creating orders...");

      // ✅ Step 1: Create all orders
      for (let i = 0; i < itemsForCheckout.length; i++) {
        const item = itemsForCheckout[i];
        
        console.log(`Creating order ${i + 1}/${itemsForCheckout.length}:`, {
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        });

        try {
          const orderRes = await api.post(
            "/orders/create",
            {
              productId: item.productId,
              quantity: item.quantity,
              billingName: billing.name,
              billingEmail: billing.email,
              billingPhone: billing.phone,
              billingAddress: billing.address,
            }
          );

          console.log(`Order ${i + 1} created successfully: `, orderRes.data.order._id);
          orderIds.push(orderRes.data.order._id);

        } catch (orderError) {
          console.error(`Failed to create order ${i + 1}:`, orderError.response?.data || orderError.message);
          throw new Error(`Failed to create order for item ${i + 1}:  ${orderError.response?.data?. msg || orderError.message}`);
        }
      }

      console.log("All orders created.  Order IDs:", orderIds);
      console.log("Step 2: Processing payments...");

      // ✅ Step 2: Process bulk payment
      const paymentRes = await api.post(
        "/payments/bulk-cart",
        {
          orderIds: orderIds,
          billingInfo:  billing,
        }
      );

      console.log("Payment response:", paymentRes. data);

      // ✅ Step 3: Clear checkout data
      localStorage.removeItem("checkoutItem");
      window.dispatchEvent(new Event("cartUpdated"));

      console.log("=== PAYMENT COMPLETED ===");

      // ✅ Show success
      alert(`✔ Payment Successful!\n${paymentRes. data.totalSuccess} orders placed successfully. `);
      
      navigate("/buyer/purchased");

    } catch (err) {
      console.error("=== PAYMENT FAILED ===");
      console.error("Error:", err);
      console.error("Error response:", err. response?.data);
      
      const errorMsg = err.response?. data?.msg || err.message;
      alert(` Payment failed: ${errorMsg}\n\nCheck console for details.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-4xl font-light text-slate-900 mb-2">Checkout</h1>
          <p className="text-slate-500">Complete your purchase securely</p>
        </div>

        {/* Decorative Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-linear-to-r from-transparent via-slate-300 to-transparent" />
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <div className="h-px flex-1 bg-linear-to-r from-transparent via-slate-300 to-transparent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column:  Billing + Items */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Billing Information */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-linear-to-r from-slate-900 to-slate-700 px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Billing Information
                </h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus: ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all"
                    onChange={handleChange} 
                    disabled={loading}
                    required
                  />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="email" 
                      name="email" 
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all"
                      onChange={handleChange} 
                      disabled={loading}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="tel" 
                      name="phone" 
                      placeholder="+91 00000 00000"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all"
                      onChange={handleChange} 
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    name="address" 
                    placeholder="Enter your complete delivery address..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all resize-none"
                    rows={4}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Order Items Preview */}
            {isCart && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Order Items ({itemsForCheckout.length})
                  </h2>
                </div>

                <div className="p-6 space-y-3 max-h-80 overflow-y-auto">
                  {itemsForCheckout.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      {item.image && (
                        <img 
                          src={getImageUrl(item.image)}
                          className="w-16 h-16 rounded-lg object-cover border border-slate-300"
                          alt={item.title}
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{item.title || "Product"}</p>
                        <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-slate-900">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
              
              {/* Header */}
              <div className="bg-linear-to-r from-slate-900 to-slate-700 px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Order Summary
                </h2>
              </div>

              <div className="p-6">

                {/* Single Item Details */}
                {isSingle && (
                  <div className="pb-4 mb-4 border-b border-slate-200 space-y-2">
                    <div className="flex justify-between text-slate-600">
                      <span>Quantity</span>
                      <span className="font-medium text-slate-900">{checkoutData.quantity}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Price per item</span>
                      <span className="font-medium text-slate-900">₹{checkoutData.price}</span>
                    </div>
                  </div>
                )}

                {/* Cart Summary */}
                {isCart && (
                  <div className="pb-4 mb-4 border-b border-slate-200">
                    <div className="flex items-center gap-2 text-slate-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{itemsForCheckout.length} items in your order</span>
                    </div>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-slate-700">
                    <span>Subtotal</span>
                    <span className="font-medium">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Shipping</span>
                    <span className="font-medium text-emerald-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Tax</span>
                    <span className="font-medium">₹0</span>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-4 border-t-2 border-slate-900 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-slate-900">Total</span>
                    <span className="text-2xl font-bold text-slate-900">₹{total}</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  className={`w-full py-4 rounded-xl font-semibold text-white transition-all transform ${
                    loading 
                      ? 'bg-slate-400 cursor-not-allowed' 
                      : 'bg-linear-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                  onClick={payNow}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Place Order & Pay
                    </span>
                  )}
                </button>

                {/* Security Badge */}
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Secure checkout powered by ArtPoint</span>
                </div>

                {/* Terms */}
                <p className="text-xs text-slate-400 text-center mt-4">
                  By placing your order, you agree to our{" "}
                  <span className="text-slate-600 underline cursor-pointer">Terms & Conditions</span>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}