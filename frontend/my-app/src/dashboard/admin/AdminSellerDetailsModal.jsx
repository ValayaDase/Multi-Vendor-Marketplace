import React from "react";
import { getImageUrl } from "../../config/api";
export default function AdminSellerDetailsModal({ isOpen, onClose, request }) {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl relative shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 transition z-10"
          onClick={onClose}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Content */}
        <div className="p-8">
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            Seller Request Details
          </h2>

          {/* Name */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <p className="text-lg text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
              {request.name || "N/A"}
            </p>
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <p className="text-lg text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 break-all">
              {request.email || "N/A"}
            </p>
          </div>

          {/* Sample Image */}
          {request.sellerSampleImage && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Sample Artwork
              </label>
              <div className="rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg">
                <img
                  src={getImageUrl(request.sellerSampleImage)}
                  alt="Seller Sample"
                  className="w-full h-96 object-cover"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Click to view full size
              </p>
            </div>
          )}

          {/* Status Badge */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Request Status
            </label>
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
              request.sellerRequest === 'pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
              request.sellerRequest === 'approved' ? 'bg-green-100 text-green-700 border border-green-200' :
              request.sellerRequest === 'rejected' ? 'bg-red-100 text-red-700 border border-red-200' : 
              'bg-gray-100 text-gray-700 border border-gray-200'
            }`}>
              {request.sellerRequest ?  request.sellerRequest. charAt(0).toUpperCase() + request.sellerRequest.slice(1) : 'Unknown'}
            </span>
          </div>

          {/* Additional Info (if seller is approved and has stats) */}
          {request. role === 'seller' && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-600 font-semibold mb-1">Products</p>
                <p className="text-2xl font-bold text-blue-900">{request.productCount || 0}</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <p className="text-sm text-purple-600 font-semibold mb-1">Orders</p>
                <p className="text-2xl font-bold text-purple-900">{request.orderCount || 0}</p>
              </div>
            </div>
          )}        
        </div>
      </div>
    </div>
  );
}