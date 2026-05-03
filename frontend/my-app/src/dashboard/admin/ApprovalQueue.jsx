import React, { useState, useEffect } from "react";
import api, { getImageUrl } from "../../config/api";
import ProductForm from "../seller/ProductForm";

export default function ApprovalQueue() {
  const [pendingProducts, setPendingProducts] = useState([]);
  const [deletedProducts, setDeletedProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchPending();
    fetchDeleted();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await api.get("/admin/pending");
      setPendingProducts(res.data);
    } catch (err) {
      console.error("Error fetching pending products", err);
    }
  };

  const fetchDeleted = async () => {
    try {
      const res = await api.get("/admin/products/deleted");
      setDeletedProducts(res.data);
    } catch (err) {
      console.error("Error fetching deleted products", err);
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
      fetchDeleted();
    } catch (err) {
      alert("Action failed! Check console for details.");
    }
  };

  const restoreDeletedProduct = async (id) => {
    await api.patch(`/admin/products/restore/${id}`);
    fetchDeleted();
    fetchPending();
  };

  const hardDeleteProduct = async (id) => {
    if (!window.confirm("Permanently delete this product? This only works when there are no order or image references.")) return;
    await api.delete(`/admin/products/hard-delete/${id}`);
    fetchDeleted();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light text-slate-900 mb-2">Inventory Review</h1>
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
                      onClick={() => setEditingProduct(p)}
                      className="px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-100 transition-all duration-300"
                    >
                      Edit
                    </button>
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

      <div className="mt-12 bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-light text-gray-900">Deleted Products</h2>
            <p className="text-sm text-gray-500">Soft-deleted products stay here for restore or restricted hard delete.</p>
          </div>
          <span className="text-sm font-semibold text-rose-600">{deletedProducts.length} hidden</span>
        </div>

        <div className="divide-y divide-gray-50">
          {deletedProducts.length === 0 ? (
            <div className="p-10 text-center text-gray-400">No deleted products found.</div>
          ) : (
            deletedProducts.map((product) => (
              <div key={product._id} className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={getImageUrl(product.thumbnail || product.images?.[0])}
                    alt={product.title}
                    className="h-16 w-16 rounded-2xl object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{product.title}</p>
                    <p className="text-sm text-gray-500">
                      Seller: {product.seller?.name || "Unknown"} • Deleted by: {product.deletedBy || "system"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => restoreDeletedProduct(product._id)}
                    className="rounded-xl bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="rounded-xl bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => hardDeleteProduct(product._id)}
                    className="rounded-xl bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
                  >
                    Hard Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-[2rem] bg-white shadow-2xl">
            <ProductForm
              product={editingProduct}
              isAdmin
              onClose={() => setEditingProduct(null)}
              onProductAdded={() => {
                setEditingProduct(null);
                fetchPending();
                fetchDeleted();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
