import React, { useState, useEffect } from "react";
import api from "../../config/api";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { 
  AiOutlineSearch, 
  AiOutlineShoppingCart, 
  AiOutlineMenu 
} from "react-icons/ai";
import { 
  MdDashboard, 
  MdFavoriteBorder, 
  MdShoppingBag, 
  MdStorefront, 
  MdLogout,
  MdClose
} from "react-icons/md";
import SellerRequestModal from "./SellerRequestModal";

export default function BuyerLayout() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")) || null; } 
    catch { return null; }
  })();

  const firstLetter = user?.name ? user.name[0].toUpperCase() : "U";

  const fetchCartCount = () => {
    if (!localStorage.getItem("token")) return;
    api.get("/cart/count").then(res => setCartCount(res.data.count)).catch(() => {});
  };

  useEffect(() => {
    fetchCartCount();
    window.addEventListener("cartUpdated", fetchCartCount);
    return () => window.removeEventListener("cartUpdated", fetchCartCount);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      
      {/* ==== MINIMALIST NAVBAR ==== */}
      <nav className="h-16 border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          
          {/* Brand - Simple Text Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate("/buyer")}
          >
            <div className="w-8 h-8 bg-black flex items-center justify-center rounded">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">VENDORHUB</span>
          </div>

          {/* Search - Integrated & Simple */}
          <div className="hidden md:flex flex-1 max-w-lg mx-10 relative">
            <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-gray-100 border-none rounded-md pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-gray-300 outline-none transition-all"
              onChange={(e) => window.dispatchEvent(new CustomEvent("doSearch", { detail: e.target.value }))}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6">
            {!user ? (
              <Link to="/login" className="text-sm font-semibold hover:text-blue-600 transition">Sign In</Link>
            ) : (
              <div className="flex items-center gap-5">
                <div 
                  className="relative cursor-pointer group"
                  onClick={() => navigate("/buyer/cart")}
                >
                  <AiOutlineShoppingCart className="text-2xl text-gray-700 group-hover:text-black" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {cartCount}
                    </span>
                  )}
                </div>

                <div className="h-4 w-[1px] bg-gray-300" />

                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="flex items-center gap-2 group"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-700 group-hover:bg-gray-300 transition">
                    {firstLetter}
                  </div>
                  <AiOutlineMenu className="text-gray-600" />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ==== CLEAN RIGHT SIDEBAR ==== */}
      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/20 z-50" />
      )}

      <div className={`fixed top-0 right-0 h-full w-72 bg-white z-[60] shadow-xl transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account Menu</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-black"><MdClose size={20}/></button>
          </div>

          {/* User Brief */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
            <div className="w-12 h-12 bg-gray-900 text-white rounded flex items-center justify-center text-lg font-bold">{firstLetter}</div>
            <div className="overflow-hidden">
              <p className="font-bold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex-1 space-y-1">
            <SidebarLink icon={<MdDashboard/>} label="Marketplace" to="/buyer" onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink icon={<MdFavoriteBorder/>} label="Wishlist" to="/buyer/saved" onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink icon={<MdShoppingBag/>} label="My Orders" to="/buyer/purchased" onClick={() => setIsSidebarOpen(false)} />
            
            <div className="pt-4 mt-4 border-t border-gray-100">
              {user?.role === "seller" ? (
                <SidebarLink icon={<MdStorefront/>} label="Seller Mode" to="/seller" onClick={() => setIsSidebarOpen(false)} highlight />
              ) : (
                <button 
                  onClick={() => { if(user?.sellerRequest !== "pending") { setOpenModal(true); setIsSidebarOpen(false); } }} 
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded transition"
                >
                  <MdStorefront size={18}/> {user?.sellerRequest === "pending" ? "Pending Approval" : "Start Selling"}
                </button>
              )}
            </div>
          </div>

          <button onClick={logout} className="mt-auto flex items-center gap-3 px-3 py-2 text-sm font-semibold text-gray-500 hover:text-red-600 transition">
            <MdLogout size={18}/> Sign Out
          </button>
        </div>
      </div>

      {/* ==== MAIN AREA ==== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <Outlet />
      </main>

      <SellerRequestModal isOpen={openModal} onClose={() => setOpenModal(false)} user={user} onSuccess={() => window.location.reload()} />
    </div>
  );
}

// Simple Link Component for Sidebar
const SidebarLink = ({ icon, label, to, onClick, highlight }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2 rounded text-sm font-semibold transition-all ${
      highlight ? "bg-black text-white hover:bg-gray-800" : "text-gray-600 hover:bg-gray-100 hover:text-black"
    }`}
  >
    <span className="text-lg">{icon}</span>
    {label}
  </Link>
);