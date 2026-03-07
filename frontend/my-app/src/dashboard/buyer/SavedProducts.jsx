import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import { useNavigate } from "react-router-dom";
import api , {getImageUrl} from "../../config/api";

export default function SavedProducts() {
  const [saved, setSaved] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    api
      .get("/products/saved")
      .then((res) => setSaved(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <h1 className="text-4xl font-light text-slate-900">
              Saved Artworks
            </h1>
          </div>
          <p className="text-slate-500 text-base">
            Your curated collection of favorite pieces
          </p>
        </div>

        {/* Decorative Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-linear-to-r from-transparent via-slate-300 to-transparent" />
          <span className="text-xs uppercase tracking-widest text-slate-400 font-medium">
            {saved.length} {saved.length === 1 ? "Item" : "Items"} Saved
          </span>
          <div className="h-px flex-1 bg-linear-to-r from-transparent via-slate-300 to-transparent" />
        </div>

        {saved.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              No saved artworks yet
            </h2>
            <p className="text-slate-500 mb-8">
              Start exploring and save your favorite pieces to view them here
            </p>
            <button
              onClick={() => navigate("/buyer")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-amber-600 text-white rounded-full font-medium transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Explore Artworks
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        ) : (
          /* Products Grid */
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {saved.map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  onClick={() => navigate(`/buyer/product/${p._id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
