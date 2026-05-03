export const ecoBadgeClasses = {
  green: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  yellow: "bg-amber-100 text-amber-700 border border-amber-200",
  red: "bg-rose-100 text-rose-700 border border-rose-200",
};

export const categoryLabelMap = {
  fashion: "Fashion & Apparel",
  "home-kitchen": "Home & Kitchen",
  electronics: "Electronics",
  beauty: "Beauty & Personal Care",
  footwear: "Footwear",
};

export const orderStatusClasses = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-sky-100 text-sky-700",
  processing: "bg-violet-100 text-violet-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  rejected: "bg-rose-100 text-rose-700",
  refunded: "bg-slate-200 text-slate-700",
  seller_deleted: "bg-slate-200 text-slate-700",
};

export const toLabel = (value = "") =>
  value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const formatCategory = (value = "") =>
  categoryLabelMap[value] || toLabel(value || "general");

export const formatProductLocation = (location = {}) =>
  [location.city, location.state].filter(Boolean).join(", ");

export const getEcoLabel = (score = 0) => {
  if (score >= 70) return "Eco Excellent";
  if (score >= 40) return "Eco Balanced";
  return "Eco Needs Work";
};
