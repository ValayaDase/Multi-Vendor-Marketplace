import React, { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api, { getImageUrl } from "../config/api";
import { formatCurrency } from "../utils/marketplace";

export default function Checkout() {
  const navigate = useNavigate();
  const [checkoutData, setCheckoutData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [billing, setBilling] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    pincode: "",
  });

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("checkoutItem"));
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!data) {
      navigate("/buyer/cart");
      return;
    }

    setCheckoutData(data);
    setBilling((prev) => ({
      ...prev,
      name: user?.name || "",
      email: user?.email || "",
      pincode: user?.location?.pincode || "",
    }));
  }, [navigate]);

  if (!checkoutData) {
    return <div className="rounded-[2rem] bg-white p-10 shadow-sm">Loading checkout...</div>;
  }

  const itemsForCheckout = checkoutData.mode === "single" ? [checkoutData] : checkoutData.items;
  const subtotal = itemsForCheckout.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const handleChange = (e) => {
    setBilling((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const payNow = async () => {
    if (!billing.name || !billing.email || !billing.phone || !billing.address || !billing.pincode) {
      alert("Please fill all billing fields.");
      return;
    }

    setLoading(true);

    try {
      const orderIds = [];

      for (const item of itemsForCheckout) {
        const orderRes = await api.post("/orders/create", {
          productId: item.productId,
          quantity: item.quantity,
          billingName: billing.name,
          billingEmail: billing.email,
          billingPhone: billing.phone,
          billingAddress: billing.address,
          billingPincode: billing.pincode,
        });

        orderIds.push(orderRes.data.order._id);
      }

      const paymentRes = await api.post("/payments/bulk-cart", {
        orderIds,
        billingInfo: billing,
      });

      localStorage.removeItem("checkoutItem");
      window.dispatchEvent(new Event("cartUpdated"));
      alert(`Payment successful. ${paymentRes.data.totalSuccess} order(s) placed.`);
      navigate("/buyer/purchased");
    } catch (err) {
      console.error("Payment failed:", err);
      alert(err.response?.data?.msg || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-light text-slate-900">Checkout</h1>
          <p className="mt-2 text-sm text-slate-500">
            This build uses an internal payment confirmation flow. Order creation and payment status now stay aligned more reliably.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr]">
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Billing Information</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Input name="name" label="Full Name" value={billing.name} onChange={handleChange} />
                <Input name="email" label="Email" value={billing.email} onChange={handleChange} />
                <Input name="phone" label="Phone" value={billing.phone} onChange={handleChange} />
                <Input name="pincode" label="Pincode" value={billing.pincode} onChange={handleChange} />
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-600">Delivery Address</span>
                  <textarea
                    name="address"
                    rows="4"
                    value={billing.address}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-900"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Order Items</h2>
              <div className="mt-4 space-y-3">
                {itemsForCheckout.map((item, index) => (
                  <div key={`${item.productId}-${index}`} className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
                    {item.image && (
                      <img src={getImageUrl(item.image)} alt={item.title} className="h-16 w-16 rounded-2xl object-cover" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{item.title || "Product"}</p>
                      <p className="text-sm text-slate-500">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-slate-900">{formatCurrency(item.quantity * item.price)}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <Row label="Items" value={itemsForCheckout.length} />
              <Row label="Subtotal" value={formatCurrency(subtotal)} />
              <Row label="Shipping" value="Free" />
              <Row label="Tax" value="₹0" />
            </div>
            <div className="mt-4 border-t border-slate-200 pt-4">
              <Row label="Total" value={formatCurrency(subtotal)} strong />
            </div>

            <button
              onClick={payNow}
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-slate-900 px-5 py-4 text-base font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Processing..." : "Place Order & Pay"}
            </button>

            <div className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              Order, billing, and payment statuses are synced during checkout.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <input {...props} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-900" />
    </label>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className={`flex items-center justify-between ${strong ? "text-lg font-bold text-slate-900" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
