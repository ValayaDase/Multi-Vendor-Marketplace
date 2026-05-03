import { useEffect, useState } from "react";
import api from "../config/api";

export default function LocationProfileModal({
  isOpen,
  onClose,
  user,
  onUpdated,
}) {
  const [form, setForm] = useState({
    name: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      city: user.location?.city || "",
      state: user.location?.state || "",
      country: user.location?.country || "India",
      pincode: user.location?.pincode || "",
    });
  }, [user]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put("/auth/me", {
        name: form.name,
        location: {
          city: form.city,
          state: form.state,
          country: form.country,
          pincode: form.pincode,
        },
      });

      const updatedUser = res.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      onUpdated?.(updatedUser);
      onClose();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
      <form
        onSubmit={handleSave}
        className="w-full max-w-xl rounded-[2rem] bg-white p-8 shadow-2xl space-y-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900">Profile & Location</h3>
            <p className="text-sm text-slate-500">
              Update your delivery and marketplace region preferences.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400">
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1 text-sm text-slate-600">
            <span>Name</span>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500"
            />
          </label>
          <label className="space-y-1 text-sm text-slate-600">
            <span>City</span>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500"
            />
          </label>
          <label className="space-y-1 text-sm text-slate-600">
            <span>State</span>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500"
            />
          </label>
          <label className="space-y-1 text-sm text-slate-600">
            <span>Country</span>
            <input
              name="country"
              value={form.country}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500"
            />
          </label>
          <label className="space-y-1 text-sm text-slate-600 md:col-span-2">
            <span>Pincode</span>
            <input
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500"
            />
          </label>
        </div>

        <button
          disabled={loading}
          className="w-full rounded-2xl bg-slate-900 px-6 py-3 text-white font-semibold hover:bg-amber-600 transition"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
