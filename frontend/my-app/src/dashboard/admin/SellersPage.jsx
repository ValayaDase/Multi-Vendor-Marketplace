import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { MdDelete } from 'react-icons/md';
import AdminSellerDetailsModal from './AdminSellerDetailsModal';

const SellersPage = () => {
  const [sellers, setSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const loadSellers = async () => {
    try {
      const res = await api.get("/admin/sellers");
      setSellers(res.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadSellers(); }, []);

  const removeSeller = async (id) => {
    if (!window.confirm("Remove this seller?")) return;
    await api.delete(`/admin/remove-seller/${id}`);
    loadSellers();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Sellers Directory</h3>
        <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold">{sellers.length} Total</span>
      </div>
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider font-bold">
          <tr>
            <th className="px-6 py-4">Seller Details</th>
            <th className="px-6 py-4">Business Name</th>
            <th className="px-6 py-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {sellers.map(s => (
            <tr key={s._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="text-sm font-bold text-gray-800">{s.name}</div>
                <div className="text-xs text-gray-400">{s.email}</div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 italic">
                {s.businessDetails?.businessName || "Not Provided"}
              </td>
              <td className="px-6 py-4 flex justify-center gap-2">
                <button onClick={() => { setSelectedSeller(s); setOpenModal(true); }} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100">View</button>
                <button onClick={() => removeSeller(s._id)} className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100"><MdDelete size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <AdminSellerDetailsModal isOpen={openModal} onClose={() => setOpenModal(false)} request={selectedSeller} />
    </div>
  );
};

export default SellersPage;