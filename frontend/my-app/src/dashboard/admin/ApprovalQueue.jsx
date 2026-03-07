import React, { useState, useEffect } from "react";
import api, { getImageUrl } from "../../config/api";

export default function ApprovalQueue() {
  const [pendingProducts, setPendingProducts] = useState([]);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await api.get("/admin/pending");
      setPendingProducts(res.data);
    } catch (err) {
      console.error("Error fetching pending products", err);
    }
  };

  const handleAction = async (id, action) => {
    console.log("Button Clicked:", action, "for ID:", id)
    try {
      if (action === "approve") {
        await api.put(`/admin/approve-product/${id}`);
      } else {
        const reason = prompt("Enter rejection reason for the seller:");
        if (!reason) return;
        await api.patch(`/admin/reject-product/${id}`, { adminRemark: reason });
      }
      fetchPending();
    } catch (err) {
      alert("Action failed! Check console for details.");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-light text-gray-900 mb-2">Inventory Review</h1>
          <p className="text-gray-500 text-base">
            Verify product quality and seller details before publishing.
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-semibold text-amber-600">{pendingProducts.length}</span>
          <p className="text-xs uppercase tracking-widest text-gray-400">Items Pending</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-tighter">Product Details</th>
              <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-tighter">Category</th>
              <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-tighter">Pricing & Stock</th>
              <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-tighter text-right">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pendingProducts.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50/30 transition-all duration-300">
                {/* Product & Seller Info */}
                <td className="p-6">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden border border-gray-100 shadow-sm shrink-0">
                      <img 
                        src={p.images && p.images.length > 0 ? getImageUrl(p.images[0]) : ""} 
                        alt={p.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                        }} 
                      />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">{p.title}</p>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        <p className="text-sm text-gray-500 font-medium">Seller: {p.seller?.name || "Premium Vendor"}</p>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="p-6">
                  <span className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wide">
                    {p.category || "General"}
                  </span>
                </td>

                {/* Price & Stock */}
                <td className="p-6">
                  <div className="flex flex-col">
                    <span className="text-gray-900 font-bold text-base">₹{p.price}</span>
                    <span className={`text-[11px] font-medium ${p.stock > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {p.stock > 0 ? `${p.stock} units in stock` : 'Out of stock'}
                    </span>
                  </div>
                </td>

                {/* Actions */}
                <td className="p-6">
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => handleAction(p._id, "approve")}
                      className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-emerald-600 transition-all duration-300 active:scale-95 shadow-lg shadow-gray-200"
                    >
                      Verify & Approve
                    </button>
                    <button 
                      onClick={() => handleAction(p._id, "reject")}
                      className="px-4 py-2.5 bg-white text-rose-600 border border-rose-100 rounded-xl font-bold text-xs hover:bg-rose-50 transition-all duration-300"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {pendingProducts.length === 0 && (
          <div className="p-32 text-center">
            <div className="inline-flex p-5 bg-gray-50 rounded-full mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-400 font-medium text-lg">No new products awaiting approval.</p>
          </div>
        )}
      </div>
    </div>
  );
}