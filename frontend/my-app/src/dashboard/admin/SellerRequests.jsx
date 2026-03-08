import React, { useState, useEffect } from "react";
import api, { getImageUrl } from "../../config/api";

const SellerRequests = () => {
  const [requests, setRequests] = useState([]);

  const loadRequests = async () => {
    const res = await api.get("/admin/seller-requests");
    setRequests(res.data || []);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAction = async (id, action) => {
    const endpoint =
      action === "approve" ? "/admin/approve-seller" : "/admin/reject-seller";
    if (!window.confirm(`${action.toUpperCase()} this request?`)) return;
    await api.post(endpoint, { userId: id });
    loadRequests();
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-8 border-b border-gray-50 bg-gray-50/50">
        <h3 className="text-xl font-black text-gray-900">
          New Artist Applications
        </h3>
      </div>
      <table className="w-full">
        <thead className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <tr>
            <th className="px-8 py-4 text-left">Artist</th>
            <th className="px-8 py-4 text-left">Sample Work</th>
            <th className="px-8 py-4 text-center">Decision</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {requests.map((r) => (
            <tr key={r._id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-8 py-6">
                <div className="font-bold text-gray-800">{r.name}</div>
                <div className="text-xs text-indigo-500 font-medium">
                  {r.email}
                </div>
              </td>
              <td className="px-8 py-6">
                <img
                  src={getImageUrl(
                    r.businessDetails?.studioImage || r.sellerSampleImage,
                  )}
                  className="w-24 h-16 rounded-xl object-cover ring-4 ring-white shadow-sm"
                  alt="Sample"
                />
              </td>
              <td className="px-8 py-6">
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => handleAction(r._id, "approve")}
                    className="bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(r._id, "reject")}
                    className="bg-white text-red-500 border border-red-100 px-5 py-2 rounded-xl text-xs font-bold hover:bg-red-50"
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {requests.length === 0 && (
        <p className="p-10 text-center text-gray-400 font-medium">
          No pending requests at the moment.
        </p>
      )}
    </div>
  );
};

export default SellerRequests;
