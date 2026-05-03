import React from "react";
import { Leaf, MapPin, Package2 } from "lucide-react";
import { getImageUrl } from "../../config/api";
import {
  ecoBadgeClasses,
  formatCategory,
  formatCurrency,
  formatProductLocation,
  getEcoLabel,
} from "../../utils/marketplace";

export default function ProductCard({ product, onClick }) {
  const ecoClass = ecoBadgeClasses[product.ecoScore?.badgeColor || "yellow"];

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-56 overflow-hidden bg-slate-100">
        <img
          src={getImageUrl(product.thumbnail || product.images?.[0])}
          alt={product.title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
          {formatCategory(product.category)}
        </div>
        <div className={`absolute right-4 top-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${ecoClass}`}>
          <Leaf className="h-3.5 w-3.5" />
          {product.ecoScore?.score || 0}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="line-clamp-1 text-base font-semibold text-slate-900">{product.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{product.brand || product.origin || "Marketplace ready"}</p>
          </div>
          <p className="text-lg font-black text-slate-900">{formatCurrency(product.price)}</p>
        </div>

        <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600">
          <span className={`rounded-full px-3 py-1 ${ecoClass}`}>{getEcoLabel(product.ecoScore?.score)}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
            <Package2 className="h-3.5 w-3.5" />
            {product.stock} in stock
          </span>
          {formatProductLocation(product.location) && (
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-sky-700">
              <MapPin className="h-3.5 w-3.5" />
              {formatProductLocation(product.location)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
