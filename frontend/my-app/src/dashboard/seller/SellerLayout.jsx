import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  MdGridView,
  MdStorefront,
  MdLogout,
  MdDeleteOutline,
  MdBrush,
} from "react-icons/md";
import { AiOutlineHome, AiOutlineShopping } from "react-icons/ai";
import api from "../../config/api";

const SellerLayout = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const deleteAccount = async () => {
    if (
      !window.confirm(
        "CRITICAL: Are you sure? This will permanently erase your gallery and seller history.",
      )
    ) {
      return;
    }
    try {
      await api.delete("/delete-seller-account");
      alert("Account deleted successfully.");
      localStorage.clear();
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Failed to delete account");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FCFCFD]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 fixed h-full z-20 transition-all duration-300">
        <div className="px-8 py-10">
          <h1 className="text-xl font-black tracking-[0.2em] text-black">
            VENDORHUB<span className="text-gray-300">.</span>
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
            Seller Portal
          </p>
        </div>

        <nav className="mt-4 flex flex-col h-[calc(100%-180px)] justify-between">
          {/* Main Nav */}
          <div className="space-y-1">
            <NavItem
              to="/seller"
              icon={<AiOutlineHome size={18} />}
              label="Overview"
            />
            <NavItem
              to="/seller/products"
              icon={<MdGridView size={18} />}
              label="Collection"
            />
          </div>

          {/* Bottom Actions */}
          <div className="px-4 pb-8 space-y-2">
            <div className="h-px bg-gray-50 mx-4 mb-4" />

            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black hover:bg-gray-50 transition-all rounded-sm"
            >
              <MdLogout size={18} />
              <span>Sign Out</span>
            </button>

            <button
              onClick={deleteAccount}
              className="w-full flex items-center gap-3 px-6 py-3 text-xs font-bold uppercase tracking-widest text-red-300 hover:text-red-600 hover:bg-red-50 transition-all rounded-sm"
            >
              <MdDeleteOutline size={18} />
              <span>Delete Account</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="ml-64 flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
          <div className="px-10 py-5 flex items-center justify-between">
            <h2 className="text-xl text-gray-500">
              Management <span className="text-black">Portal</span>
            </h2>

            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate("/buyer")}
                className="group flex items-center gap-2 text-[15px] text-black border-2 border-black px-6 py-2.5 hover:bg-black hover:text-white transition-all duration-300 active:scale-95"
              >
                <MdStorefront
                  size={18}
                  className="group-hover:scale-110 transition-transform"
                />
                <span>Switch to Buyer Mode</span>
              </button>

              <div className="h-8 w-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold">
                {JSON.parse(localStorage.getItem("user"))?.name?.charAt(0) ||
                  "A"}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="p-10 flex-1">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `group relative w-full flex items-center gap-4 px-8 py-4 text-[15px]  transition-all duration-300
      ${
        isActive
          ? "text-black bg-gray-50/50 border-r-4 border-black"
          : "text-gray-400 hover:text-black hover:bg-gray-50"
      }`
    }
  >
    <span className="transition-transform group-hover:scale-110">{icon}</span>
    <span>{label}</span>
  </NavLink>
);

export default SellerLayout;
