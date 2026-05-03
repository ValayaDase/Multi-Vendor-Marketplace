import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getImageUrl } from "../../config/api";
import { formatCurrency } from "../../utils/marketplace";

export default function PurchasedOrders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  const fetchOrders = () => {
    api.get("/orders/buyer").then((res) => setOrders(res.data)).catch(console.error);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const cancelNormalOrder = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      const res = await api.post("/orders/cancel", { orderId });
      fetchOrders();
      alert(res.data.msg || "Your order has been cancelled.");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Unable to cancel order");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-light text-slate-900">Your Orders</h1>
        <p className="mt-2 text-sm text-slate-500">Track payment and delivery status for every purchase.</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-16 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">No orders yet</h2>
          <button onClick={() => navigate("/buyer")} className="mt-5 rounded-2xl bg-slate-900 px-5 py-3 text-white">
            Explore Products
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <img
                  src={getImageUrl(order.product?.thumbnail || order.product?.images?.[0] || order.productImage)}
                  alt={order.product?.title || order.productTitle}
                  className="h-28 w-28 rounded-[1.5rem] object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-900">{order.product?.title || order.productTitle}</h3>
                  <p className="mt-1 text-sm text-slate-500">{order.product?.category || order.productCategory}</p>
                  <p className="mt-3 text-2xl font-black text-slate-900">{formatCurrency(order.price)}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.2em]">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{order.orderStatus}</span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{order.paymentStatus}</span>
                  </div>
                </div>
                {["pending", "confirmed", "processing"].includes(order.orderStatus) && (
                  <button
                    onClick={() => cancelNormalOrder(order._id)}
                    className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
