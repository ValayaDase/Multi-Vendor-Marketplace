import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api , {getImageUrl} from "../../config/api";

export default function PurchasedOrders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchOrders = () => {
  api
    .get("/orders/buyer")
    .then((res) => setOrders(res.data))
    .catch((err) => console.log(err));
};

  // Call once when component loads
  useEffect(() => {
    fetchOrders();
  }, []);


  const cancelNormalOrder = async (orderId) => {
    const confirmCancel = window.confirm("Cancel this order?");
    if (!confirmCancel) return;

    try {
      await api.post(
        "/orders/cancel",
        { orderId }
      );

      alert("Order cancelled");
      fetchOrders();  //  refresh list after cancel
    } catch (err) {
      console.error(err);
      alert("Unable to cancel order");
    }
  };



  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-light text-slate-900 mb-2">
            Your Orders
          </h1>
          <p className="text-slate-500 text-base">
            Track and manage your purchased artworks
          </p>
        </div>

        {/* Decorative Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-linear-to-r from-transparent via-slate-300 to-transparent" />
          <span className="text-xs uppercase tracking-widest text-slate-400 font-medium">
            {orders.length} {orders.length === 1 ? "Order" : "Orders"}
          </span>
          <div className="h-px flex-1 bg-linear-to-r from-transparent via-slate-300 to-transparent" />
        </div>

        {orders.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              No orders yet
            </h2>
            <p className="text-slate-500 mb-8">
              You haven't purchased anything yet. Start exploring artworks!
            </p>
            <button
              onClick={() => navigate("/buyer")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-amber-600 text-white rounded-full font-medium transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Explore Artworks
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-4">
            {orders.map((o) => (
              <div
                key={o._id}
                className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex gap-5">
                    {/* Product Image */}
                    <div className="shrink-0">
                      <img
                        src={getImageUrl(o.product?.images?.[0])}
                        alt="Product"
                        className="w-28 h-28 object-cover rounded-xl"
                      />
                        <h3>{o.product?.title}</h3>
                        <p>{o.product?.category}</p>
                        {/* <p>₹{o.price}</p>
                        <span>{o.orderStatus}</span> */}
                    </div>

                    {/* Order Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                          {o.productTitle}
                        </h3>

                        <p className="text-slate-500 text-sm mt-1 capitalize">
                          {o.category}
                        </p>

                        <p className="text-2xl font-bold text-slate-900 mt-3">
                          ₹{o.price.toLocaleString("en-IN")}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">Status: {o.orderStatus}</p>
                        {["pending", "confirmed", "processing"].includes(o.orderStatus) && (
                          <button
                            onClick={() => cancelNormalOrder(o._id)}
                            className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition"
                          >
                            Cancel Order
                          </button>
                        )}

                      </div>

                      
                    </div>
                  </div>
                </div>

                {/* Bottom Border Accent */}
                <div
                  className={`h-1 w-full transition-all ${
                    o.status === "Delivered"
                      ? "bg-emerald-500"
                      : o.status === "Cancelled"
                      ? "bg-red-500"
                      : "bg-amber-500"
                  }`}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
