// import React, { useState, useEffect } from "react";
// import api from "../../config/api";
// import { Outlet, useNavigate } from "react-router-dom";

// import {
//   AiOutlineSearch,
//   AiOutlineBell,
//   AiOutlineShoppingCart,
//   AiOutlineClose,
// } from "react-icons/ai";

// import {
//   MdDashboard,
//   MdFavoriteBorder,
//   MdShoppingBag,
//   MdStorefront,
//   MdLogout,
//   MdDeleteOutline,
// } from "react-icons/md";

// import SellerRequestModal from "./SellerRequestModal";

// export default function BuyerLayout() {
//   const navigate = useNavigate();

//   const [cartCount, setCartCount] = useState(0);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) return;

//     api
//       .get("/cart/count")
//       .then((res) => setCartCount(res.data.count))
//       .catch(() => {});
//   }, []);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) return;

//     const refreshCount = () => {
//       api
//         .get("/cart/count")
//         .then((res) => setCartCount(res.data.count))
//         .catch(() => {});
//     };

//     window.addEventListener("cartUpdated", refreshCount);

//     return () => window.removeEventListener("cartUpdated", refreshCount);
//   }, []);

//   const user = (() => {
//     try {
//       return JSON.parse(localStorage.getItem("user")) || null;
//     } catch {
//       return null;
//     }
//   })();

//   const name = user?.name ?? "User";
//   const email = user?.email ?? "Not Logged In";
//   const firstLetter = String(name)[0]?.toUpperCase() ?? "U";

//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [openModal, setOpenModal] = useState(false);

//   // SAFE ROLE SYNC
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token || !user) return;

//     api
//       .get("/auth/me")
//       .then((res) => {
//         if (!res.data) return;

//         const newRole = res.data.role;
//         const oldRole = user?.role;

//         if (newRole !== oldRole) {
//           localStorage.setItem("user", JSON.stringify(res.data));

//           // Only navigate if not already on /buyer
//           if (window.location.pathname !== "/buyer") {
//             navigate("/buyer", { replace: true });
//           }
//         }
//       })
//       .catch(() => {});
//   }, []);

//   // Logout
//   const logout = () => {
//     localStorage.clear();
//     navigate("/login");
//   };

//   // Delete Account
//   const deleteAccount = async () => {
//     if (!window.confirm("Are you sure? This action cannot be undone.")) return;

//     try {
//       await api.delete("/auth/delete-account");
//       alert("Your account has been deleted.");
//       localStorage.clear();
//       window.location.href = "/login"; // redirect to login page
//     } catch (err) {
//       console.error(err);
//       alert(err.response?.data?.msg || "Failed to delete account");
//     }
//   };


//   return (
//     <div className="min-h-screen bg-slate-50 flex">
//       {/* Overlay */}
//       {isSidebarOpen && (
//         <div
//           onClick={() => setIsSidebarOpen(false)}
//           className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
//         />
//       )}

//       {/* ==== RIGHT SIDEBAR ==== */}
//       <div
//         className={`fixed top-0 right-0 h-full bg-white shadow-2xl z-50 transition-transform duration-300 ${
//           isSidebarOpen ? "translate-x-0" : "translate-x-full"
//         } w-80`}
//       >
//         <div className="w-full h-full flex flex-col">
//           {/* Header */}
//           <div className="relative p-6 border-b bg-linear-to-r from-slate-900 to-slate-800">
//             <button
//               onClick={() => setIsSidebarOpen(false)}
//               className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors text-white"
//             >
//               <AiOutlineClose size={20} />
//             </button>

//             <div className="flex items-center gap-4 mt-2">
//               <div className="w-16 h-16 bg-amber-500 text-white rounded-2xl flex justify-center items-center text-2xl font-bold shadow-lg">
//                 {firstLetter}
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-white">{name}</h3>
//                 <p className="text-slate-300 text-sm">{email}</p>
//               </div>
//             </div>
//           </div>

//           {/* MENU */}
//           <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
//             <SidebarItem
//               icon={<MdDashboard />}
//               label="Home"
//               onClick={() => {
//                 navigate("/buyer");
//                 setIsSidebarOpen(false);
//               }}
//             />
//             <SidebarItem
//               icon={<MdFavoriteBorder />}
//               label="Saved"
//               onClick={() => {
//                 navigate("/buyer/saved");
//                 setIsSidebarOpen(false);
//               }}
//             />
//             <SidebarItem
//               icon={<MdShoppingBag />}
//               label="Purchased"
//               onClick={() => {
//                 navigate("/buyer/purchased");
//                 setIsSidebarOpen(false);
//               }}
//             />

//             {/* Divider */}
//             <div className="py-2">
//               <div className="h-px bg-slate-200" />
//             </div>

//             {/* Switch to Seller */}
//             {user?.role === "seller" && (
//               <SidebarItem
//                 icon={<MdStorefront />}
//                 label="Switch to Seller Mode"
//                 onClick={() => {
//                   navigate("/seller");
//                   setIsSidebarOpen(false);
//                 }}
//                 isHighlight
//               />
//             )}

//             {/* Become Seller */}
//             {user?.role === "buyer" && user?.sellerRequest !== "pending" && (
//               <SidebarItem
//                 icon={<MdStorefront />}
//                 label="Become Seller"
//                 onClick={() => {
//                   setOpenModal(true);
//                   setIsSidebarOpen(false);
//                 }}
//                 isHighlight
//               />
//             )}

//             {/* Pending Request */}
//             {user?.role === "buyer" && user?.sellerRequest === "pending" && (
//               <SidebarItem
//                 icon={<MdStorefront />}
//                 label="Request Pending"
//                 disabled
//               />
//             )}

//             {/* <SidebarItem
//               icon={<MdStorefront />}
//               label="View Artists"
//               onClick={() => {
//                 navigate("/buyer/artists");
//                 setIsSidebarOpen(false);
//               }}
//             /> */}

//             {/* <SidebarItem
//               icon={<MdStorefront />}
//               label="Custom Orders"
//               onClick={() => {
//                 navigate("/buyer/custom-orders");
//                 setIsSidebarOpen(false);
//               }}
//             /> */}
//           </div>

//           {/* Logout */}
//           <div className="border-t bg-slate-50 p-4 space-y-1">
//             <SidebarItem
//               icon={<MdLogout />}
//               label="Logout"
//               isDanger
//               onClick={logout}
//             />
//             <SidebarItem
//               icon={<MdDeleteOutline />}
//               label="Delete Account"
//               isDanger
//               onClick={deleteAccount}
//             />
//           </div>
//         </div>
//       </div>

//       {/* ==== MAIN AREA ==== */}
//       <div className="flex-1">
//         {/* NAVBAR */}
//         <nav className="sticky top-0 bg-white/90 backdrop-blur-md shadow-sm px-6 py-4 border-b border-slate-200 z-30 flex justify-between items-center">
//           {/* LOGO */}
//           <div
//             className="flex items-center gap-3 cursor-pointer group"
//             onClick={() => navigate("/buyer")}
//           >
//             <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-md group-hover:bg-amber-600 transition-colors">
//               <span className="text-white font-bold text-lg">A</span>
//             </div>
//             <h1 className="text-2xl font-semibold text-slate-900">ArtPoint</h1>
//           </div>

//           {/* SEARCH */}
//           <div className="hidden md:block flex-1 mx-8 max-w-2xl">
//             <div className="relative">
//               <input
//                 placeholder="Search for art, artists, categories..."
//                 className="w-full border border-slate-200 bg-slate-50/50 rounded-full pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
//                 onChange={(e) => {
//                   window.dispatchEvent(
//                     new CustomEvent("doSearch", { detail: e.target.value })
//                   );
//                 }}
//               />
//               <AiOutlineSearch className="absolute left-4 top-3.5 text-slate-400 text-lg" />
//             </div>
//           </div>

//           {/* ICONS */}
//           <div className="flex items-center gap-3">

//             {/* If NOT logged in → show Login + Sign Up */}
//             {!user && (
//               <>
//                 <button
//                   onClick={() => navigate("/login")}
//                   className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-amber-600 transition"
//                 >
//                   Login
//                 </button>

//                 <button
//                   onClick={() => navigate("/signup")}
//                   className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 transition"
//                 >
//                   Sign Up
//                 </button>
//               </>
//             )}

//             {/* If logged in → show Cart + Profile */}
//             {user && (
//               <>
//                 <div
//                   className="relative cursor-pointer p-2.5 hover:bg-slate-100 rounded-full transition-colors"
//                   onClick={() => navigate("/buyer/cart")}
//                 >
//                   <AiOutlineShoppingCart className="text-xl text-slate-600" />

//                   {cartCount > 0 && (
//                     <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-5 text-center shadow-md">
//                       {cartCount}
//                     </span>
//                   )}
//                 </div>

//                 <div className="w-px h-8 bg-slate-200 mx-2" />

//                 <button
//                   onClick={() => setIsSidebarOpen(true)}
//                   className="w-11 h-11 bg-slate-900 hover:bg-amber-600 text-white rounded-xl flex justify-center items-center font-semibold text-base shadow-md transition-all hover:shadow-lg"
//                 >
//                   {firstLetter}
//                 </button>
//               </>
//             )}

//           </div>

//         </nav>

//         {/* PAGE OUTLET */}
//         <main className="max-w-7xl mx-auto px-6 py-8">
//           <Outlet />
//         </main>
//       </div>

//       {/* SELLER REQUEST MODAL */}
//       <SellerRequestModal
//         isOpen={openModal}
//         onClose={() => setOpenModal(false)}
//         user={user}
//         onSuccess={() => window.location.reload()}
//       />
//     </div>
//   );
// }

// /* Sidebar Button */
// const SidebarItem = ({ icon, label, isDanger, onClick, disabled, isHighlight }) => (
//   <button
//     onClick={!disabled ? onClick : undefined}
//     disabled={disabled}
//     className={`
//       w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium
//       ${
//         disabled
//           ? "bg-slate-50 text-slate-400 cursor-not-allowed"
//           : isDanger
//           ? "text-red-500 hover:bg-red-50 hover:text-red-600"
//           : isHighlight
//           ? "text-amber-700 bg-amber-50 hover:bg-amber-100"
//           : "text-slate-700 hover:bg-slate-100"
//       }
//     `}
//   >
//     <span className="text-lg">{icon}</span>
//     <span>{label}</span>
//   </button>
// );


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