import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  BarChart3,
  Heart,
  LocateFixed,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  ShoppingCart,
  Store,
} from "lucide-react";
import api from "../../config/api";
import LocationProfileModal from "../../components/LocationProfileModal";
import SellerRequestModal from "./SellerRequestModal";

export default function BuyerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cartCount, setCartCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSellerModal, setOpenSellerModal] = useState(false);
  const [openLocationModal, setOpenLocationModal] = useState(false);
  const [searchValue, setSearchValue] = useState(searchParams.get("query") || "");
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const firstLetter = currentUser?.name ? currentUser.name[0].toUpperCase() : "U";
  const activeLocation = currentUser?.location?.state || currentUser?.location?.city || "Set location";

  useEffect(() => {
    setSearchValue(searchParams.get("query") || "");
  }, [searchParams]);

  const fetchCartCount = () => {
    if (!localStorage.getItem("token")) return;
    api.get("/cart/count").then((res) => setCartCount(res.data.count)).catch(() => {});
  };

  useEffect(() => {
    fetchCartCount();
    window.addEventListener("cartUpdated", fetchCartCount);
    return () => window.removeEventListener("cartUpdated", fetchCartCount);
  }, []);

  const applySearch = (value, nextLocation = currentUser?.location?.state || "") => {
    const params = new URLSearchParams();
    if (value.trim()) params.set("query", value.trim());
    if (nextLocation?.trim()) params.set("location", nextLocation.trim());
    setSearchParams(params);

    if (!location.pathname.startsWith("/buyer/all")) {
      navigate(`/buyer/all?${params.toString()}`);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applySearch(searchValue);
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4">
          <button onClick={() => navigate("/buyer")} className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-lg font-black text-white">
              V
            </div>
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Marketplace</p>
              <h1 className="text-xl font-semibold text-slate-900">VendorHub</h1>
            </div>
          </button>

          <div className="hidden flex-1 items-center gap-3 lg:flex">
            <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center gap-3">
              <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <input
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                  }}
                  placeholder="Search products, categories, brands..."
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                <Search className="h-4 w-4" />
                Search
              </button>
            </form>

            <button
              onClick={() => setOpenLocationModal(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-sky-300 hover:text-sky-700 transition"
            >
              <LocateFixed className="h-4 w-4" />
              {activeLocation}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {!currentUser ? (
              <Link to="/login" className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">
                Sign In
              </Link>
            ) : (
              <>
                <button
                  onClick={() => navigate("/buyer/cart")}
                  className="relative rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 hover:border-slate-300"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                    {firstLetter}
                  </div>
                  <Menu className="h-4 w-4 text-slate-500" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-4 lg:hidden">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <input
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                }}
                placeholder="Search products, categories, brands..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setOpenLocationModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
            >
              <LocateFixed className="h-4 w-4" />
              {activeLocation}
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </form>
        </div>
      </nav>

      {isSidebarOpen && <div className="fixed inset-0 z-40 bg-slate-950/30" onClick={() => setIsSidebarOpen(false)} />}

      <aside
        className={`fixed right-0 top-0 z-50 h-full w-80 bg-white shadow-2xl transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-6">
          <div className="mb-8 flex items-center gap-3 border-b border-slate-100 pb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-lg font-black text-white">
              {firstLetter}
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">{currentUser?.name || "Guest"}</p>
              <p className="text-sm text-slate-500">{currentUser?.email || "Not logged in"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <SidebarLink to="/buyer" icon={<Store className="h-4 w-4" />} label="Marketplace" onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink to="/buyer/analytics" icon={<BarChart3 className="h-4 w-4" />} label="Buyer Analytics" onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink to="/buyer/saved" icon={<Heart className="h-4 w-4" />} label="Wishlist" onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink to="/buyer/purchased" icon={<ShoppingBag className="h-4 w-4" />} label="My Orders" onClick={() => setIsSidebarOpen(false)} />
            <button
              onClick={() => {
                setOpenLocationModal(true);
                setIsSidebarOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <LocateFixed className="h-4 w-4" />
              Profile / Address
            </button>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-6">
            {currentUser?.role === "seller" ? (
              <SidebarLink
                to="/seller"
                icon={<Store className="h-4 w-4" />}
                label="Seller Dashboard"
                highlight
                onClick={() => setIsSidebarOpen(false)}
              />
            ) : (
              <button
                onClick={() => {
                  setOpenSellerModal(true);
                  setIsSidebarOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-2xl bg-slate-900 px-3 py-3 text-left text-sm font-semibold text-white"
              >
                <Store className="h-4 w-4" />
                {currentUser?.sellerRequest === "pending" ? "Seller Request Pending" : "Start Selling"}
              </button>
            )}
          </div>

          <button
            onClick={logout}
            className="mt-auto flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>

      <LocationProfileModal
        isOpen={openLocationModal}
        onClose={() => setOpenLocationModal(false)}
        user={currentUser}
        onUpdated={(user) => {
          setCurrentUser(user);
          applySearch(searchValue, user?.location?.state || "");
        }}
      />

      <SellerRequestModal
        isOpen={openSellerModal}
        onClose={() => setOpenSellerModal(false)}
        user={currentUser}
        onSuccess={(user) => {
          const nextUser = user || JSON.parse(localStorage.getItem("user"));
          setCurrentUser(nextUser);
        }}
      />
    </div>
  );
}

const SidebarLink = ({ icon, label, to, onClick, highlight }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition ${
      highlight ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`}
  >
    {icon}
    {label}
  </Link>
);
