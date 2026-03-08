import React, { useState, useEffect } from "react";
import api, { getImageUrl } from "../../config/api";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const loadOrders = async () => {
      const res = await api.get("/admin/orders");
      setOrders(res.data || []);
    };
    loadOrders();
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 mb-6">
        Master Order List
      </h3>
      {orders.map((o) => (
        <div
          key={o._id}
          className="bg-white p-5 rounded-2xl border border-gray-100 flex gap-6 hover:shadow-md transition-all"
        >
          <img
            src={getImageUrl(o.product?.images?.[0])}
            className="w-20 h-20 rounded-xl object-cover shadow-sm"
          />
          <div className="flex-1">
            <div className="flex justify-between">
              <h4 className="font-bold text-gray-800">{o.product?.title}</h4>
              <span className="text-indigo-600 font-black text-sm">
                ₹{o.price}
              </span>
            </div>
            <div className="flex gap-4 mt-2 text-[11px] text-gray-400 font-medium">
              <span>BUYER: {o.buyer?.name}</span>
              <span>SELLER: {o.seller?.name}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <span className="px-2 py-0.5 rounded-md bg-green-50 text-green-600 text-[10px] font-bold uppercase">
                {o.orderStatus}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-gray-50 text-gray-500 text-[10px] font-bold uppercase">
                {o.paymentStatus}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-gray-50 text-gray-500 text-[10px] font-bold uppercase">
                {o.paymentStatus}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrdersPage;
