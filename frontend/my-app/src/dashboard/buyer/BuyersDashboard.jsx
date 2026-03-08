import React from "react";
import LatestItems from "./LatestItems";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import api, { getImageUrl } from "../../config/api";

export default function BuyersDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const name = user?.name || "User";

  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ products: [] });

  useEffect(() => {
    const listener = async (e) => {
      const q = e.detail;
      setQuery(q);

      if (!q.trim()) {
        setResults({ products: [] });
        return;
      }

      const res = await api.get(`/search?query=${q}`);
      setResults(res.data);
    };

    window.addEventListener("doSearch", listener);
    return () => window.removeEventListener("doSearch", listener);
  }, []);

  const categories = [
    {
      id: 1,
      title: "Fashion & Apparel",
      slug: "fashion",
      subtitle: "Latest Trends & Styles",
      image:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      title: "Home & Kitchen",
      slug: "home-kitchen",
      subtitle: "Essentials for your space",
      image:
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 3,
      title: "Electronics",
      slug: "electronics",
      subtitle: "Gadgets & Accessories",
      image:
        "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 4,
      title: "Beauty & Personal Care",
      slug: "beauty",
      subtitle: "Grooming & Wellness",
      image:
        "https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      id: 5,
      title: "Footwear",
      slug: "footwear",
      subtitle: "Comfort meets style",
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80",
    },
  ];
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50">
      {/* Search Results */}
      {query && (
        <div className="mb-16 animate-fadeIn">
          <div className="flex items-baseline gap-3 mb-6">
            <h2 className="text-3xl font-light text-gray-900">
              Search results for
            </h2>
            <span className="text-3xl font-medium text-gray-700">
              "{query}"
            </span>
          </div>

          {/* Artists Section */}
          {/* {results.artists.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px flex-1 bg-linear-to-r from-transparent via-gray-300 to-transparent" />
                <h3 className="text-sm uppercase tracking-widest font-medium text-gray-500">
                  Featured Artists
                </h3>
                <div className="h-px flex-1 bg-linear-to-r from-transparent via-gray-300 to-transparent" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.artists.map((a) => (
                  <div
                    key={a._id}
                    onClick={() => navigate(`/buyer/artist/${a._id}`)}
                    className="group relative bg-white rounded-xl border border-gray-200 hover:border-gray-300 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-full bg-linear-to-br from-amber-100 to-orange-100 flex items-center justify-center text-amber-700 font-semibold text-lg shrink-0">
                          {a.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-amber-700 transition-colors">
                            {a.name}
                          </h4>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {a.bio?.slice(0, 80)}...
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-amber-400 to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  </div>
                ))}
              </div>
            </div>
          )} */}

          {/* Products Section */}
          {results.products.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px flex-1 bg-linear-to-r from-transparent via-gray-300 to-transparent" />
                <h3 className="text-sm uppercase tracking-widest font-medium text-gray-500">
                  Artworks
                </h3>
                <div className="h-px flex-1 bg-linear-to-r from-transparent via-gray-300 to-transparent" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {results.products.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => navigate(`/buyer/product/${p._id}`)}
                    className="group cursor-pointer"
                  >
                    <div className="relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                      <div className="relative aspect-square overflow-hidden bg-gray-50">
                        <img
                          src={`${getImageUrl(p.images?.[0])}`}
                          alt={p.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-1 group-hover:text-amber-700 transition-colors">
                          {p.title}
                        </h4>
                        <p className="text-lg font-semibold text-gray-900">
                          ₹{p.price.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {results.products.length === 0 && query.trim() !== "" && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 text-lg">No results found</p>
              <p className="text-gray-400 text-sm mt-1">
                Try adjusting your search terms
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative mb-20 overflow-hidden">
        <div
          className="relative h-[450px] rounded-3xl overflow-hidden"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Linear Overlay - Wahi premium structure */}
          <div className="absolute inset-0 bg-linear-to-r from-black/75 via-black/40 to-transparent" />

          {/* Content */}
          <div className="relative h-full flex flex-col justify-center px-12 lg:px-16 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/20 backdrop-blur-md border border-rose-500/30 rounded-full text-xs font-bold text-rose-100 uppercase tracking-widest w-fit mb-6">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              Lowest Prices, Best Quality
            </div>

            <h1 className="text-5xl lg:text-6xl font-black text-white mb-3 tracking-tight uppercase">
              Everything You Need
            </h1>
            <h2 className="text-3xl lg:text-4xl font-light text-white/95 mb-6">
              At Wholesale Prices
            </h2>

            <p className="text-white/80 text-lg leading-relaxed max-w-lg font-light">
              Discover millions of products across fashion, home essentials, and
              lifestyle. Unbeatable quality, delivered to your doorstep.
            </p>

            <button
              onClick={() => navigate("/buyer/all")}
              className="mt-8 inline-flex items-center gap-2 px-8 py-3 bg-rose-600 text-white rounded-full font-bold hover:bg-rose-700 transition-colors w-fit group shadow-lg shadow-rose-900/20"
            >
              Shop All Categories
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
        </div>
      </div>

      {/* Categories Section */}
      <section className="mb-20">
        <div className="text-center mb-10">
          <h3 className="text-4xl font-light text-gray-900 mb-3">
            Explore Departments
          </h3>
          <p className="text-gray-500 text-base">
            Shop wide range of products across top categories
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="group cursor-pointer"
              onClick={() => navigate(`/buyer/category/${cat.slug}`)}
            >
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                {/* Image */}
                <div className="relative aspect-4/5 overflow-hidden bg-gray-100">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />

                  {/* Overlay Text */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <h4 className="text-xl font-semibold mb-1 group-hover:-translate-y-0.5 transition-transform">
                      {cat.title}
                    </h4>
                    {/* Marketplace-friendly subtitle */}
                    <p className="text-xs text-white/70 uppercase tracking-wider">
                      Explore Collection
                    </p>
                  </div>

                  {/* Arrow Icon */}
                  <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      className="w-5 h-5 text-white"
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
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Items */}
      <section>
        <LatestItems onViewAll={() => navigate("/buyer/all")} />
      </section>
    </div>
  );
}
