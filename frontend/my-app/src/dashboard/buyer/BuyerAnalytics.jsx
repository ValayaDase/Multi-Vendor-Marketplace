import React, { useEffect, useState } from "react";
import { Heart, IndianRupee, PackageCheck, Receipt, RotateCcw, Truck, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api, { getImageUrl } from "../../config/api";
import { formatCurrency } from "../../utils/marketplace";

export default function BuyerAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    const [analyticsRes, profileRes] = await Promise.all([
      api.get("/orders/buyer/analytics"),
      api.get("/auth/me"),
    ]);
    setAnalytics(analyticsRes.data);
    setProfile(profileRes.data);
  };

  useEffect(() => {
    load().catch(console.error);

    const refresh = () => load().catch(console.error);
    const intervalId = window.setInterval(refresh, 20000);
    window.addEventListener("focus", refresh);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  if (!analytics || !profile) {
    return <div className="rounded-[2rem] bg-white p-8 shadow-sm">Loading analytics...</div>;
  }

  const cards = [
    { label: "Total Orders", value: analytics.totalOrders, icon: <Receipt className="h-5 w-5" />, tone: "bg-sky-50 text-sky-700" },
    { label: "Total Spent", value: formatCurrency(analytics.totalSpent), icon: <IndianRupee className="h-5 w-5" />, tone: "bg-emerald-50 text-emerald-700" },
    { label: "Pending Orders", value: analytics.pendingOrders, icon: <Truck className="h-5 w-5" />, tone: "bg-amber-50 text-amber-700" },
    { label: "Delivered Orders", value: analytics.deliveredOrders, icon: <PackageCheck className="h-5 w-5" />, tone: "bg-teal-50 text-teal-700" },
    { label: "Cancelled Orders", value: analytics.cancelledOrders, icon: <XCircle className="h-5 w-5" />, tone: "bg-rose-50 text-rose-700" },
    { label: "Wishlist Items", value: analytics.wishlistItems, icon: <Heart className="h-5 w-5" />, tone: "bg-fuchsia-50 text-fuchsia-700" },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-200">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Buyer Analytics</p>
        <h1 className="mt-2 text-3xl font-light text-slate-900">Your shopping performance at a glance</h1>
        <p className="mt-2 text-sm text-slate-500">
          Orders, spending, savings, wishlist, recommendations, and your saved address are all organized here.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.tone}`}>{card.icon}</div>
            <p className="mt-4 text-sm font-semibold text-slate-500">{card.label}</p>
            <p className="mt-1 text-3xl font-black text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <Panel title="Recent Orders (last 5)">
            <div className="space-y-3">
              {analytics.recentOrders.map((order) => (
                <div key={order._id} className="flex items-center gap-4 rounded-2xl bg-slate-50 p-3">
                  <img
                    src={getImageUrl(order.product?.thumbnail || order.product?.images?.[0] || order.productImage)}
                    alt={order.product?.title || order.productTitle}
                    className="h-16 w-16 rounded-2xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{order.product?.title || order.productTitle}</p>
                    <p className="text-sm text-slate-500">{order.orderStatus}</p>
                  </div>
                  <p className="font-bold text-slate-900">{formatCurrency(order.price)}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Recommended Products">
            <div className="grid gap-4 md:grid-cols-2">
              {analytics.recommendedProducts.map((product) => (
                <button
                  key={product._id}
                  onClick={() => navigate(`/buyer/product/${product._id}`)}
                  className="rounded-[1.5rem] border border-slate-200 bg-white p-3 text-left transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <img src={getImageUrl(product.thumbnail || product.images?.[0])} alt={product.title} className="h-40 w-full rounded-2xl object-cover" />
                  <p className="mt-3 font-semibold text-slate-900">{product.title}</p>
                  <p className="text-sm text-slate-500">{formatCurrency(product.price)}</p>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Reorder Options">
            <div className="space-y-3">
              {analytics.reorderItems.map((item) => (
                <div key={item.orderId} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <img src={getImageUrl(item.image)} alt={item.title} className="h-14 w-14 rounded-2xl object-cover" />
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-500">{formatCurrency(item.price)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/buyer/product/${item.productId}`)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reorder
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Savings & Wishlist">
            <div className="space-y-4">
              <Metric label="Saved Amount (discounts)" value={formatCurrency(analytics.savedAmount)} />
              <Metric label="Wishlist Items" value={analytics.wishlistItems} />
              <Metric label="Recommended Products" value={analytics.recommendedProducts.length} />
            </div>
          </Panel>

          <Panel title="Profile / Address">
            <div className="space-y-3 text-sm text-slate-600">
              <Metric label="Name" value={profile.name || "-"} />
              <Metric label="City" value={profile.location?.city || "-"} />
              <Metric label="State" value={profile.location?.state || "-"} />
              <Metric label="Country" value={profile.location?.country || "-"} />
              <Metric label="Pincode" value={profile.location?.pincode || "-"} />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}
