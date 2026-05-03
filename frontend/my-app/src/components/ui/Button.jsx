import React from "react";
import { Loader2 } from "lucide-react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  isLoading = false,
  className = "",
  disabled,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed rounded-full";

  const variants = {
    primary:
      "bg-slate-900 text-white shadow-md hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 focus:ring-slate-900",
    pastelPink:
      "bg-[#ffb6c1] text-slate-900 shadow-sm hover:bg-[#ffc6d0] hover:shadow-md hover:-translate-y-0.5 focus:ring-[#ffb6c1]",
    pastelBlue:
      "bg-[#b5e2fa] text-slate-900 shadow-sm hover:bg-[#c6ebfc] hover:shadow-md hover:-translate-y-0.5 focus:ring-[#b5e2fa]",
    secondary:
      "bg-white text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 hover:shadow-md hover:-translate-y-0.5 focus:ring-slate-200",
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-200",
    outline:
      "bg-transparent text-slate-700 border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 focus:ring-slate-300",
  };

  const sizes = {
    sm: "text-xs px-4 py-2 gap-1.5",
    md: "text-sm px-6 py-2.5 gap-2",
    lg: "text-base px-8 py-3.5 gap-2.5",
    icon: "p-2.5",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin" size={size === "sm" ? 14 : size === "lg" ? 20 : 18} />}
      {!isLoading && Icon && iconPosition === "left" && (
        <Icon size={size === "sm" ? 14 : size === "lg" ? 20 : 18} />
      )}
      {children}
      {!isLoading && Icon && iconPosition === "right" && (
        <Icon size={size === "sm" ? 14 : size === "lg" ? 20 : 18} />
      )}
    </button>
  );
}
