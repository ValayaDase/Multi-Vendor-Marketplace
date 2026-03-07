import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import { useParams, useNavigate } from "react-router-dom";
import api, {getImageUrl} from "../../config/api";

export default function ProductsPage() {
  const { name } = useParams(); // category slug from URL (painting, pottery...)
  const navigate = useNavigate();

  const [allProducts, setAllProducts] = useState([]); // full backend data
  const [filtered, setFiltered] = useState([]); // visible products

  // Simple price ranges
  const priceRanges = [
    { label: "Under ₹149", min: 0, max: 149 },
    { label: "Under ₹199", min: 0, max: 199 },
    { label: "Under ₹299", min: 0, max: 299 },
    { label: "₹0 - ₹99", min: 0, max: 99 },
    { label: "₹100 - ₹199", min: 100, max: 199 },
  ];

  //  Load all products once
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/products/getAll");
        setAllProducts(res.data);
        setFiltered(res.data); // initially show everything
      } catch (err) {
        console.log(err);
      }
    };
    load();
  }, []);

  //  When category changes → show category products
  useEffect(() => {
    if (!name) {
      setFiltered(allProducts);
      return;
    }

    const categoryProducts = allProducts.filter((p) => p.category === name);

    setFiltered(categoryProducts);
  }, [name, allProducts]);

  //  Apply simple price filter
  const applyFilter = (min, max) => {
    // Base list = either category results or full results
    const baseList = name
      ? allProducts.filter((p) => p.category === name)
      : allProducts;

    //  Apply price filter on BASE list (not on filtered)
    const result = baseList.filter((p) => p.price >= min && p.price <= max);

    setFiltered(result);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* LEFT FILTERS SIDEBAR */}
          <aside className="w-72 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm sticky top-24 overflow-hidden">
              {/* Header */}
              <div className="bg-slate-900 px-6 py-4">
                <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  Price Filter
                </h3>
              </div>

              {/* Filter Options */}
              <div className="p-5 space-y-2">
                {priceRanges.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => applyFilter(p.min, p.max)}
                    className="group w-full text-left px-4 py-3 border border-slate-200 rounded-xl hover:border-amber-500 hover:bg-amber-50 text-sm font-medium text-slate-700 hover:text-amber-700 transition-all flex items-center justify-between"
                  >
                    <span>{p.label}</span>
                    <svg
                      className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
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
                ))}

                {/* Divider */}
                <div className="py-2">
                  <div className="h-px bg-slate-200" />
                </div>

                {/* Clear button */}
                <button
                  onClick={() =>
                    setFiltered(
                      name
                        ? allProducts.filter((p) => p.category === name)
                        : allProducts
                    )
                  }
                  className="mt-8 inline-flex items-center gap-2 px-8 py-3 bg-rose-600 text-white rounded-full font-bold hover:bg-rose-700 transition-colors w-fit group shadow-lg shadow-rose-900/20"
                >
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Clear Filters
                </button>
              </div>             
            </div>
          </aside>

          {/* PRODUCTS GRID */}
          <div className="flex-1">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-3xl font-light text-slate-900">
                  {name ? (
                    <>
                      <span className="capitalize">{name}</span>
                      <span className="text-slate-500 ml-2">Collection</span>
                    </>
                  ) : (
                    "All Artworks"
                  )}
                </h2>

                <span className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-600 font-medium">
                  {filtered.length} Items
                </span>
              </div>

              <p className="text-slate-500 text-base">
                {name
                  ? `Discover unique ${name} pieces from talented artists`
                  : "Explore our complete collection of handcrafted artworks"}
              </p>
            </div>

            {/* Decorative Divider */}
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs uppercase tracking-widest text-slate-400 font-medium">
                Featured Collection
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Products Grid */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {filtered.map((p) => (
                  <ProductCard
                    key={p._id}
                    product={p}
                    onClick={() => navigate(`/buyer/product/${p._id}`)}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  No products found
                </h3>
                <p className="text-slate-500 mb-6">
                  Try adjusting your filters to see more results
                </p>
                <button
                  onClick={() =>
                    setFiltered(
                      name
                        ? allProducts.filter((p) => p.category === name)
                        : allProducts
                    )
                  }
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-900 rounded-full font-medium hover:border-rose-600 hover:text-rose-600 transition-all duration-300"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
