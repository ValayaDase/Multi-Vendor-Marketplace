import React, { useEffect, useState } from "react";
import api, { getImageUrl } from "../../config/api";
import { formatCurrency } from "../../utils/marketplace";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    const res = await api.get("/admin/orders");
    setOrders(res.data || []);
  };

  useEffect(() => {
    loadOrders().catch(console.error);

    const refresh = () => loadOrders().catch(console.error);
    const intervalId = window.setInterval(refresh, 20000);
    window.addEventListener("focus", refresh);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-light text-slate-900">All Orders List</h1>
        <p className="mt-2 text-sm text-slate-500">Track buyer, seller, payment, and fulfillment state for every order.</p>
      </div>

      {orders.map((order) => (
        <div key={order._id} className="flex flex-col gap-5 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center">
          <img
            src={getImageUrl(order.product?.thumbnail || order.product?.images?.[0] || order.productImage)}
            alt={order.product?.title || order.productTitle}
            className="h-20 w-20 rounded-2xl object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">{order.product?.title || order.productTitle}</h3>
            <p className="mt-1 text-sm text-slate-500">
              Buyer: {order.buyer?.name} • Seller: {order.seller?.name}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.2em]">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{order.orderStatus}</span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{order.paymentStatus}</span>
            </div>
          </div>
          <p className="text-xl font-black text-slate-900">{formatCurrency(order.price)}</p>
        </div>
      ))}
    </div>
  );
};

export default OrdersPage;
