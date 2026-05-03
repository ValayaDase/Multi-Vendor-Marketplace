import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import api from "../../config/api";
import AdminSellerDetailsModal from "./AdminSellerDetailsModal";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const SellersPage = () => {
  const [sellers, setSellers] = useState([]);
  const [deletionRequests, setDeletionRequests] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const loadData = async () => {
    try {
      const [sellersRes, deletionRequestsRes] = await Promise.all([
        api.get("/admin/sellers"),
        api.get("/admin/seller-deletion-requests"),
      ]);
      setSellers(sellersRes.data || []);
      setDeletionRequests(deletionRequestsRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const suspendSeller = async (id) => {
    const reason = window.prompt("Reason for suspension:");
    if (reason === null) return;
    await api.patch(`/admin/suspend-seller/${id}`, { reason });
    await loadData();
  };

  const restoreSeller = async (id) => {
    if (!window.confirm("Restore this seller account?")) return;
    await api.patch(`/admin/restore-seller/${id}`);
    await loadData();
  };

  const removeSeller = async (id) => {
    const reason = window.prompt("Reason for seller deletion:");
    if (reason === null) return;
    await api.delete(`/admin/remove-seller/${id}`, { data: { reason } });
    await loadData();
  };

  const approveDeletionRequest = async (id) => {
    if (!window.confirm("Approve this seller account deletion request?")) return;
    await api.patch(`/admin/approve-seller-deletion/${id}`);
    await loadData();
  };

  const rejectDeletionRequest = async (id) => {
    const reason = window.prompt("Reason for rejection:", "Pending orders");
    if (reason === null) return;
    await api.patch(`/admin/reject-seller-deletion/${id}`, { reason });
    await loadData();
  };

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <div>
            <h3 className="text-3xl font-light text-slate-900">Deletion Requests</h3>
            <p className="mt-1 text-sm text-gray-500">Admin review for seller account deletion requests.</p>
          </div>
          <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
            {deletionRequests.length} Pending
          </span>
        </div>

        {deletionRequests.length === 0 ? (
          <div className="px-6 py-10 text-sm text-gray-500">No pending seller deletion requests.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Seller</th>
                  <th className="px-6 py-4">Requested</th>
                  <th className="px-6 py-4">Orders</th>
                  <th className="px-6 py-4">Revenue</th>
                  <th className="px-6 py-4">Products</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {deletionRequests.map((seller) => (
                  <tr key={seller._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-800">{seller.name}</div>
                      <div className="text-xs text-gray-400">{seller.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {seller.deletionRequestedAt ? new Date(seller.deletionRequestedAt).toLocaleString() : "Just now"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>Total: {seller.totalOrders || 0}</div>
                      <div className="text-xs text-amber-600">Active: {seller.activeOrders || 0}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">{formatCurrency(seller.revenue)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{seller.productCount || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => approveDeletionRequest(seller._id)}
                          className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-100"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectDeletionRequest(seller._id)}
                          className="bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-rose-100"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSeller(seller);
                            setOpenModal(true);
                          }}
                          className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-3xl font-light text-slate-900">Sellers Directory</h3>
          <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold">{sellers.length} Total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Seller Details</th>
                <th className="px-6 py-4">Business Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Stats</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sellers.map((seller) => (
                <tr key={seller._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-800">{seller.name}</div>
                    <div className="text-xs text-gray-400">{seller.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 italic">
                    {seller.businessDetails?.businessName || "Not Provided"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-bold uppercase ${
                          (seller.status || "active") === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : (seller.status || "active") === "suspended"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {seller.status || "active"}
                      </span>
                      {seller.deletionStatus === "pending" && (
                        <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase text-amber-700">
                          Deletion pending
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>Products: {seller.productCount || 0}</div>
                    <div>Orders: {seller.orderCount || 0}</div>
                    <div>Revenue: {formatCurrency(seller.revenue)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedSeller(seller);
                          setOpenModal(true);
                        }}
                        className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100"
                      >
                        View
                      </button>
                      {(seller.status || "active") !== "suspended" && (seller.status || "active") !== "deleted" && (
                        <button
                          onClick={() => suspendSeller(seller._id)}
                          className="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-100"
                        >
                          Suspend
                        </button>
                      )}
                      {(seller.status || "active") !== "active" && (
                        <button
                          onClick={() => restoreSeller(seller._id)}
                          className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-100"
                        >
                          Restore
                        </button>
                      )}
                      <button
                        onClick={() => removeSeller(seller._id)}
                        className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100"
                      >
                        <MdDelete size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <AdminSellerDetailsModal isOpen={openModal} onClose={() => setOpenModal(false)} request={selectedSeller} />
    </div>
  );
};

export default SellersPage;
