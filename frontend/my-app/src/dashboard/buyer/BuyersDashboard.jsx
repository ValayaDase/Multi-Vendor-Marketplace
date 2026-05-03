import React from "react";
import { ArrowRight, Leaf, LocateFixed, ShieldCheck, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LatestItems from "./LatestItems";
import { useEffect, useState } from "react";

const images = [
  "https://images.unsplash.com/photo-1483985988355-763728e1935b", // ecommerce
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30", // products
  "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f"  // shopping
];



const categories = [
  {
    id: 1,
    title: "Fashion & Apparel",
    slug: "fashion",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    title: "Home & Kitchen",
    slug: "home-kitchen",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    title: "Electronics",
    slug: "electronics",
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    title: "Beauty & Personal Care",
    slug: "beauty",
    image: "https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 5,
    title: "Footwear",
    slug: "footwear",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  },
];

export default function BuyersDashboard() {
  const navigate = useNavigate();

  const [current, setCurrent] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setCurrent((prev) => (prev + 1) % images.length);
  }, 3000);

  return () => clearInterval(interval);
}, []);

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-[2.5rem] text-white shadow-2xl h-[500px]">

  {/* ✅ Background Slideshow */}
  <div className="absolute inset-0">
    {images.map((img, index) => (
      <img
        key={index}
        src={img}
        alt=""
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          index === current ? "opacity-100" : "opacity-0"
        }`}
      />
    ))}
  </div>

  {/* ✅ Overlay */}
  <div className="absolute inset-0 bg-black/60"></div>

  {/* ✅ Content */}
  <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] h-full">
    <div className="p-8 sm:p-12 flex flex-col justify-center">

      <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-emerald-200">
        <Sparkles className="h-4 w-4" />
        Real Marketplace Experience
      </div>

      <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
        Discover better products, verified sellers, and eco-aware shopping in one place.
      </h1>

      <p className="mt-4 max-w-xl text-base text-slate-300">
        Browse by category, search by location, compare eco score badges, and shop with smoother cards and cleaner product information.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={() => navigate("/buyer/all")}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
        >
          Shop Now
          <ArrowRight className="h-4 w-4" />
        </button>

        <button
          onClick={() => navigate("/buyer/analytics")}
          className="rounded-2xl border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
        >
          Buyer Analytics
        </button>
      </div>

    </div>
  </div>

</section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">

  <InfoCard 
    style={{ 
      background: "radial-gradient(circle at top, #1e293b, #020617)",
      color: "white",
      borderRadius: "12px",
      padding: "20px"
    }}
    icon={<Leaf className="h-5 w-5 text-green-400" />} 
    title="Eco score visible" 
    text="Every product now highlights sustainability with an eco icon and score badge." 
  />

  <InfoCard 
    style={{ 
      background: "radial-gradient(circle at top, #1e293b, #020617)",
      color: "white",
      borderRadius: "12px",
      padding: "20px"
    }}
    icon={<LocateFixed className="h-5 w-5 text-blue-400" />} 
    title="Location-first search" 
    text="Use state-based discovery to find products available in your region." 
  />

  <InfoCard 
    style={{ 
      background: "radial-gradient(circle at top, #1e293b, #020617)",
      color: "white",
      borderRadius: "12px",
      padding: "20px"
    }}
    icon={<ShieldCheck className="h-5 w-5 text-purple-400" />} 
    title="Buyer confidence" 
    text="Cleaner cards, structured details, and real seller data make shopping feel production-ready." 
  />

</div>
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Browse Departments</p>
            <h2 className="mt-2 text-3xl font-light text-slate-900">Category-led exploration</h2>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => navigate(`/buyer/category/${category.slug}`)}
              className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-72">
                <img src={category.image} alt={category.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 p-5 text-white">
                  <h3 className="text-xl font-semibold">{category.title}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.25em] text-white/70">Explore collection</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <LatestItems onViewAll={() => navigate("/buyer/all")} />
    </div>
  );
}

function InfoCard({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-700 to-black p-5 shadow-md hover:shadow-xl transition">
      
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
        {icon}
      </div>

      <h3 className="mt-4 text-lg font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm text-gray-300">
        {text}
      </p>

    </div>
  );
}
