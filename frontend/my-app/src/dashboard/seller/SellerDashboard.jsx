import React, { useState, useEffect } from "react";
import {
  FiPackage,
  FiShoppingBag,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import api, { getImageUrl } from "../../config/api";

const SellerDashboard = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, completed: 0 });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const seller = JSON.parse(localStorage.getItem("user"));
      const res = await api.get(`/orders/seller/${seller._id}`);
      setOrders(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const sellerStats = async () => {
    try {
      const res = await api.get("/seller/stats");
      setStats({
        products: res.data.totalProducts,
        orders: res.data.totalOrders,
        completed: res.data.completedOrders,
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    sellerStats();
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.post("/orders/update-status", { orderId, status: newStatus });
      fetchOrders();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-4xl font-light text-gray-900 mb-3">Dashboard</h2>
          <p className="text-gray-500 text-base">
            Manage your inventory and orders
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard
            title="Total Products"
            value={stats.products}
            icon={<FiPackage />}
            color="text-blue-600"
          />
          <StatCard
            title="Total Orders"
            value={stats.orders}
            icon={<FiShoppingBag />}
            color="text-rose-600"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={<FiCheckCircle />}
            color="text-emerald-600"
          />
        </div>

        {/* Orders List */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-3xl font-light text-gray-900 mb-3">
              Recent Orders
            </h3>
          </div>

          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-12 text-center text-gray-400 font-bold">
                Loading...
              </div>
            ) : orders.length === 0 ? (
              <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-sm">
                No orders yet
              </div>
            ) : (
              orders.map((o) => (
                <div
                  key={o._id}
                  className="p-6 flex flex-col md:flex-row gap-6 items-center hover:bg-gray-50/50 transition-colors"
                >
                  <img
                    src={getImageUrl(o.product?.images[0])}
                    className="w-20 h-20 object-cover rounded-xl border"
                    alt="product"
                  />

                  <div className="flex-1 w-full">
                    <h4 className="font-black text-gray-900 uppercase tracking-tight">
                      {o.product?.title}
                    </h4>
                    <div className="flex gap-4 mt-2">
                      <span className="text-xs font-bold text-gray-500">
                        QTY: {o.quantity}
                      </span>
                      <span className="text-xs font-black text-rose-600">
                        ₹{o.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <select
                    value={o.orderStatus}
                    onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                    className="text-xs font-bold uppercase tracking-widest bg-gray-100 px-4 py-2 rounded-full outline-none cursor-pointer border-none"
                  >
                    {[
                      "pending",
                      "processing",
                      "shipped",
                      "delivered",
                      "completed",
                      "cancelled",
                    ].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => (
  <div className="bg-white p-8 border border-gray-200 rounded-3xl flex items-center gap-6 shadow-sm">
    <div className={`p-4 rounded-full bg-gray-100 ${color} text-xl`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
        {title}
      </p>
      <p className="text-3xl font-black text-gray-900">{value}</p>
    </div>
  </div>
);

export default SellerDashboard;
