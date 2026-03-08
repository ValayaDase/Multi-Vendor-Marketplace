import React, { useState, useEffect } from "react";
import api from "../../config/api";
import { FiUsers, FiPackage, FiActivity } from "react-icons/fi";
import { MdStorefront } from "react-icons/md";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBuyer: 0,
    totalSellers: 0,
    totalOrders: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stat-counts");
        setStats({
          totalBuyer: res.data.totalBuyer || 0,
          totalSellers: res.data.totalSellers || 0,
          totalOrders: res.data.totalOrders || 0,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    {
      title: "Total Buyers",
      value: stats.totalBuyer,
      icon: <FiUsers />,
      color: "bg-blue-500",
      light: "bg-blue-50",
    },
    {
      title: "Active Sellers",
      value: stats.totalSellers,
      icon: <MdStorefront />,
      color: "bg-emerald-500",
      light: "bg-emerald-50",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: <FiPackage />,
      color: "bg-violet-500",
      light: "bg-violet-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Platform Overview</h1>
        <p className="text-gray-500 text-sm font-medium">
          Real-time statistics of your marketplace.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <div
            key={i}
            className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-4 rounded-2xl ${card.light} text-2xl transition-transform group-hover:scale-110`}
                style={{ color: card.color.replace("bg-", "") }}
              >
                {card.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Lifetime
              </span>
            </div>
            <h3 className="text-gray-500 font-bold text-sm uppercase tracking-tight">
              {card.title}
            </h3>
            <p className="text-4xl font-black text-gray-900 mt-1">
              {card.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Activity Section */}
      <div className="bg-indigo-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">Admin Insights</h2>
          <p className="text-indigo-200 max-w-md text-sm leading-relaxed">
            Your marketplace is growing! Check the "Requests" tab to approve new
            artists joining the platform.
          </p>
        </div>
        <FiActivity className="absolute right-[-20px] bottom-[-20px] text-[12rem] text-white/5 rotate-12" />
      </div>
    </div>
  );
};

export default Dashboard;
