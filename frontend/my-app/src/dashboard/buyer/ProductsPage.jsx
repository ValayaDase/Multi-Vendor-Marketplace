import React, { useEffect, useMemo, useState } from "react";
import { Filter, LocateFixed, Search } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import ProductCard from "./ProductCard";
import api from "../../config/api";
import { formatCategory } from "../../utils/marketplace";

const priceRanges = [
  { label: "Under ₹499", min: 0, max: 499 },
  { label: "₹500 - ₹999", min: 500, max: 999 },
  { label: "₹1000 - ₹1999", min: 1000, max: 1999 },
  { label: "₹2000 - ₹4999", min: 2000, max: 4999 },
];

export default function ProductsPage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [selectedRange, setSelectedRange] = useState(null);

  const query = searchParams.get("query") || "";
  const location = searchParams.get("location") || "";

  useEffect(() => {
    const load = async () => {
      try {
        const params = new URLSearchParams();
        if (name) params.set("category", name);
        if (query) params.set("query", query);
        if (location) params.set("location", location);

        const res = await api.get(`/products/getAll?${params.toString()}`);
        setProducts(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    load();
  }, [location, name, query]);

  const filteredProducts = useMemo(() => {
    if (!selectedRange) return products;
    return products.filter(
      (product) => product.price >= selectedRange.min && product.price <= selectedRange.max,
    );
  }, [products, selectedRange]);

  const clearSearchFilters = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("query");
    next.delete("location");
    setSearchParams(next);
    setSelectedRange(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 rounded-[2rem] bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Discovery</p>
              <h2 className="mt-2 text-3xl font-light text-slate-900">
                {name ? `${formatCategory(name)} Collection` : "All Marketplace Products"}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Search, eco score, and state-based location filters work together across the buyer experience.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              {query && (
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-amber-700">
                  <Search className="h-4 w-4" />
                  {query}
                </span>
              )}
              {location && (
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sky-700">
                  <LocateFixed className="h-4 w-4" />
                  {location}
                </span>
              )}
              <span className="rounded-full bg-slate-100 px-4 py-2 text-slate-700">
                {filteredProducts.length} products
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full lg:w-80">
            <div className="sticky top-24 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <Filter className="h-5 w-5 text-slate-700" />
                <h3 className="text-lg font-semibold text-slate-900">Smart Filters</h3>
              </div>

              <div className="space-y-3">
                {priceRanges.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => setSelectedRange(range)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                      selectedRange?.label === range.label
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>

              <button
                onClick={clearSearchFilters}
                className="mt-6 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-rose-300 hover:text-rose-600 transition"
              >
                Clear Search & State
              </button>
            </div>
          </aside>

          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onClick={() => navigate(`/buyer/product/${product._id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-16 text-center">
                <h3 className="text-2xl font-semibold text-slate-900">No matching products found</h3>
                <p className="mt-2 text-slate-500">
                  Try a different search term, another state, or clear the current filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
