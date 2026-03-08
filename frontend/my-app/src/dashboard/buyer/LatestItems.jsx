import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { useNavigate } from "react-router-dom";
import api from "../../config/api";

export default function LatestItems({ onViewAll }) {
  const [latest, setLatest] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/products/getAll");
        const top15 = res.data.slice(0, 15);
        setLatest(top15);
      } catch (err) {
        console.log(err);
      }
    };
    load();
  }, []);

  return (
    <section className="mt-16 mb-20">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="text-4xl font-light text-gray-900 mb-2">
            New Arrivals
          </h2>
          <p className="text-gray-500 text-base">
            Discover the latest products added to our collection
          </p>
        </div>

        <button
          onClick={onViewAll}
          className="group inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-900 rounded-full font-medium hover:border-rose-600 hover:text-rose-600 transition-all duration-300"
        >
          View All
          <svg
            className="w-4 h-4 group-hover:translate-x-1 transition-transform"
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

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {latest.map((p) => (
          <ProductCard
            key={p._id}
            product={p}
            onClick={() => navigate(`/buyer/product/${p._id}`)}
          />
        ))}
      </div>

      {/* Decorative Divider */}
      <div className="mt-20 flex items-center gap-4">
        <div className="h-px flex-1 bg-linear-to-r from-transparent via-gray-300 to-transparent" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
          Marketplace verified
        </span>
        <div className="h-px flex-1 bg-linear-to-r from-transparent via-gray-300 to-transparent" />
      </div>
    </section>
  );
}
