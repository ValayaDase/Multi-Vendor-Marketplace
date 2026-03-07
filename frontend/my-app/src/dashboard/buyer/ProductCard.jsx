import React from "react";
import {getImageUrl} from "../../config/api";
export default function ProductCard({ product, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white shadow rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition"
    >
      <img
        src={`${getImageUrl(product.images?.[0])}`}
        className="h-48 w-full object-cover"
      />
      <div className="p-3">
        <h3 className="font-semibold">{product.title}</h3>
        <p className="text-sm text-gray-500">{product.category}</p>
        <p className="font-bold mt-1 text-purple-700">₹{product.price}</p>
      </div>
    </div>
  );
}
