import React, { useEffect, useState } from "react";
import { BarChart3, Package, Receipt, ShieldCheck, Store, Truck, Users, XCircle } from "lucide-react";
import api, { getImageUrl } from "../../config/api";
import { formatCurrency } from "../../utils/marketplace";

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  const loadStats = async () => {
    const res = await api.get("/admin/stat-counts");
    setStats(res.data);
  };

  useEffect(() => {
    loadStats().catch(console.error);

    const refresh = () => loadStats().catch(console.error);
    const intervalId = window.setInterval(refresh, 20000);
    window.addEventListener("focus", refresh);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  if (!stats) {
    return <div className="rounded-[2rem] bg-white p-8 shadow-sm">Loading admin dashboard...</div>;
  }

  const cards = [
    { title: "Total Users", value: stats.totalUsers, icon: <Users className="h-5 w-5" />, tone: "bg-sky-50 text-sky-700" },
    { title: "Total Buyers", value: stats.totalBuyer, icon: <Users className="h-5 w-5" />, tone: "bg-indigo-50 text-indigo-700" },
    { title: "Total Sellers", value: stats.totalSellers, icon: <Store className="h-5 w-5" />, tone: "bg-emerald-50 text-emerald-700" },
    { title: "Total Orders", value: stats.totalOrders, icon: <Receipt className="h-5 w-5" />, tone: "bg-violet-50 text-violet-700" },
    { title: "Total Revenue", value: formatCurrency(stats.totalRevenue), icon: <BarChart3 className="h-5 w-5" />, tone: "bg-amber-50 text-amber-700" },
    { title: "Active Orders", value: stats.activeOrders, icon: <Truck className="h-5 w-5" />, tone: "bg-cyan-50 text-cyan-700" },
    { title: "Cancelled Orders", value: stats.cancelledOrders, icon: <XCircle className="h-5 w-5" />, tone: "bg-rose-50 text-rose-700" },
    { title: "Pending Sellers", value: stats.pendingSellers, icon: <ShieldCheck className="h-5 w-5" />, tone: "bg-orange-50 text-orange-700" },
    { title: "Pending Products", value: stats.pendingProducts, icon: <Package className="h-5 w-5" />, tone: "bg-fuchsia-50 text-fuchsia-700" },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-light text-slate-900">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-slate-500">
          Platform totals, approvals, products, orders, categories, top sellers, and top products are all visualized here.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.title} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.tone}`}>{card.icon}</div>
            <p className="mt-4 text-sm font-semibold text-slate-500">{card.title}</p>
            <p className="mt-1 text-3xl font-black text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Top Sellers">
          <div className="space-y-3">
            {stats.topSellers.map((seller) => (
              <div key={seller._id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <div>
                  <p className="font-semibold text-slate-900">{seller.name}</p>
                  <p className="text-sm text-slate-500">{seller.businessDetails?.businessName || "Seller account"}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{formatCurrency(seller.totalSales)}</p>
                  <p className="text-xs text-slate-500">rating {seller.sellerRating || 0}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Category Management">
          <div className="space-y-3">
            {stats.categoryManagement.map((category) => (
              <div key={category.name} className="rounded-2xl bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{category.name}</span>
                  <span className="text-sm text-slate-500">{category.count} products</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Top Products">
          <div className="space-y-3">
            {stats.topProducts.map((product) => (
              <div key={product._id} className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
                <img src={getImageUrl(product.image)} alt={product.title} className="h-16 w-16 rounded-2xl object-cover" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{product.title}</p>
                  <p className="text-sm text-slate-500">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{product.totalSold} sold</p>
                  <p className="text-xs text-slate-500">{formatCurrency(product.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="All Products List">
          <div className="space-y-3">
            {stats.recentProducts.map((product) => (
              <div key={product._id} className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
                <img src={getImageUrl(product.thumbnail || product.images?.[0])} alt={product.title} className="h-14 w-14 rounded-2xl object-cover" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{product.title}</p>
                  <p className="text-sm text-slate-500">{product.category}</p>
                </div>
                <p className="font-bold text-slate-900">{formatCurrency(product.price)}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="All Orders List">
        <div className="space-y-3">
          {stats.recentOrders.map((order) => (
            <div key={order._id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
              <div>
                <p className="font-semibold text-slate-900">{order.product?.title || order.productTitle}</p>
                <p className="text-sm text-slate-500">
                  Buyer: {order.buyer?.name} • Seller: {order.seller?.name}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">{formatCurrency(order.price)}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{order.orderStatus}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
};

function Panel({ title, children }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default Dashboard;
