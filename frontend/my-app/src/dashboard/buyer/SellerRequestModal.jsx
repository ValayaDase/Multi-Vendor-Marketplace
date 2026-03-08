import React, { useState } from "react";
import { AiOutlineClose, AiOutlineCloudUpload } from "react-icons/ai";
import api from "../../config/api";

const SellerRequestModal = ({ isOpen, onClose, user, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");
  const [image, setImage] = useState(null);

  // State structure matching your updated User Model
  const [formData, setFormData] = useState({
    businessName: "",
    gstin: "",
    description: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return alert("Verification photo is required!");

    setLoading(true);
    try {
      const data = new FormData();
      data.append("userId", user._id);

      // Sending flat keys, backend will wrap them in businessDetails/bankDetails objects
      data.append("businessName", formData.businessName);
      data.append("gstin", formData.gstin);
      data.append("description", formData.description);
      data.append("accountNumber", formData.accountNumber);
      data.append("ifscCode", formData.ifscCode);
      data.append("bankName", formData.bankName);
      data.append("sampleImage", image);

      const res = await api.post("/seller/request", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert(res.data.msg || "Request submitted! Waiting for Admin approval.");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      alert(err.response?.data?.msg || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Seller Registration</h2>
            <p className="text-indigo-100 text-sm">
              Fill in your professional details
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-indigo-500 rounded-full transition"
          >
            <AiOutlineClose size={24} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 max-h-[80vh] overflow-y-auto"
        >
          {/* Section 1: Business Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
              Shop Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Studio / Shop Name
                </label>
                <input
                  required
                  name="businessName"
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Royal Arts"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  GSTIN (if any)
                </label>
                <input
                  name="gstin"
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="15-digit number"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                About your Art
              </label>
              <textarea
                required
                name="description"
                onChange={handleChange}
                rows="2"
                className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Describe what you create..."
              />
            </div>
          </div>

          {/* Section 2: Bank Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
              Payout Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Bank Name
                </label>
                <input
                  required
                  name="bankName"
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. HDFC Bank"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Account Number
                </label>
                <input
                  required
                  name="accountNumber"
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="0000 0000 0000"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  IFSC Code
                </label>
                <input
                  required
                  name="ifscCode"
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="HDFC0001234"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Verification Image */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
              Identity Verification
            </h3>
            <p className="text-sm text-gray-500 italic">
              Upload a photo of your workspace or a sample of your work with
              your name on it.
            </p>
            <div className="border-2 border-dashed border-indigo-200 bg-indigo-50 rounded-2xl p-4 text-center hover:bg-indigo-100 transition duration-300">
              <label className="cursor-pointer block">
                {preview ? (
                  <div className="relative group">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-44 object-cover rounded-xl mx-auto shadow-md"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition">
                      <span className="text-white text-sm font-bold">
                        Change Image
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6">
                    <AiOutlineCloudUpload
                      size={48}
                      className="mx-auto text-indigo-500"
                    />
                    <p className="text-indigo-600 font-bold mt-2">
                      Click to Upload Studio Photo
                    </p>
                    <p className="text-xs text-indigo-400">JPG, PNG allowed</p>
                  </div>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setImage(file);
                      setPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold text-white text-lg shadow-xl transform transition active:scale-95 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
          >
            {loading ? "Processing..." : "Submit Seller Request"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellerRequestModal;
