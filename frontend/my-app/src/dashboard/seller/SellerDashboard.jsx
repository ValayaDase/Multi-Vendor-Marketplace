import React, { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, IndianRupee, Package, ShoppingBag, Truck } from "lucide-react";
import api, { getImageUrl } from "../../config/api";
import { formatCurrency } from "../../utils/marketplace";

const SellerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/orders/seller/${JSON.parse(localStorage.getItem("user"))?._id}`);
      setOrders(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const sellerStats = async () => {
    try {
      const res = await api.get("/seller/stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    sellerStats();
    fetchOrders();

    const refresh = () => {
      sellerStats();
      fetchOrders();
    };

    const intervalId = window.setInterval(refresh, 20000);
    window.addEventListener("focus", refresh);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.post("/orders/update-status", { orderId, status: newStatus });
      fetchOrders();
      sellerStats();
    } catch {
      alert("Failed to update status");
    }
  };

  if (!stats) {
    return <div className="rounded-[2rem] bg-white p-8 shadow-sm">Loading seller dashboard...</div>;
  }

  const summaryCards = [
    { title: "Total Sales", value: formatCurrency(stats.totalSales), icon: <IndianRupee className="h-5 w-5" />, tone: "bg-emerald-50 text-emerald-700" },
    { title: "Total Orders", value: stats.totalOrders, icon: <ShoppingBag className="h-5 w-5" />, tone: "bg-sky-50 text-sky-700" },
    { title: "Active Products", value: stats.activeProducts, icon: <Package className="h-5 w-5" />, tone: "bg-violet-50 text-violet-700" },
    { title: "Pending Orders", value: stats.pendingOrders, icon: <Truck className="h-5 w-5" />, tone: "bg-amber-50 text-amber-700" },
    { title: "Completed Orders", value: stats.completedOrders, icon: <CheckCircle2 className="h-5 w-5" />, tone: "bg-teal-50 text-teal-700" },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-light text-slate-900">Seller Dashboard</h1>
        <p className="mt-2 text-sm text-slate-500">Track monthly sales, stock, top products, and live order management in one place.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <div key={card.title} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.tone}`}>{card.icon}</div>
            <p className="mt-4 text-sm font-semibold text-slate-500">{card.title}</p>
            <p className="mt-1 text-3xl font-black text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Sales Chart (monthly)">
          <div className="mt-5 flex items-end gap-3">
            {stats.salesChart.length > 0 ? (
              stats.salesChart.map((point) => {
                const [year, month] = point.date.split('-');
                const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][parseInt(month, 10) - 1];
                return (
                  <div key={point.date} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-44 w-full items-end rounded-t-3xl bg-slate-100 px-2">
                      <div
                        className="w-full rounded-t-3xl bg-gradient-to-t from-slate-500 to-sky-200"
                        style={{ height: `${Math.max(18, point.value / Math.max(...stats.salesChart.map((item) => item.value), 1) * 160)}px` }}
                      />
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500">{monthName} '{year.slice(2)}</p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-500">No sales history yet.</p>
            )}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Top Selling Products">
          <div className="space-y-3">
            {stats.topSellingProducts.map((product) => (
              <div key={product._id} className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
                <img src={getImageUrl(product.image)} alt={product.title} className="h-16 w-16 rounded-2xl object-cover" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{product.title}</p>
                  <p className="text-sm text-slate-500">{product.sold} sold</p>
                </div>
                <p className="font-bold text-slate-900">{formatCurrency(product.revenue)}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Low Stock Alerts">
          <div className="space-y-3">
            {stats.lowStockProducts.length > 0 ? (
              stats.lowStockProducts.map((product) => (
                <div key={product._id} className="flex items-center gap-4 rounded-2xl bg-amber-50 p-4">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{product.title}</p>
                    <p className="text-sm text-amber-700">{product.stock} left in stock</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No low stock alerts right now.</p>
            )}
          </div>
        </Panel>
      </div>

      <Panel title="Order Management (accept / reject / shipped)">
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200 bg-white p-4 md:flex-row md:items-center">
              <img
                src={getImageUrl(order.product?.thumbnail || order.product?.images?.[0] || order.productImage)}
                alt={order.product?.title || order.productTitle}
                className="h-20 w-20 rounded-2xl object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{order.product?.title || order.productTitle}</p>
                <p className="text-sm text-slate-500">
                  Buyer: {order.buyer?.name} • Qty: {order.quantity} • {formatCurrency(order.price)}
                </p>
              </div>
              <select
                value={order.orderStatus}
                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none"
              >
                {["pending", "confirmed", "processing", "shipped", "delivered", "rejected", "cancelled"].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
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

export default SellerDashboard;
