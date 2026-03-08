import React from "react";
import { NavLink } from "react-router-dom";
import { AiOutlineHome } from "react-icons/ai";
import {
  MdStorefront,
  MdShoppingBag,
  MdPersonAdd,
  MdLogout,
} from "react-icons/md";

const Sidebar = () => {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: <AiOutlineHome size={22} />,
    },
    {
      name: "Sellers",
      path: "/admin/sellers",
      icon: <MdStorefront size={22} />,
    },
    {
      name: "Orders",
      path: "/admin/orders",
      icon: <MdShoppingBag size={22} />,
    },
    {
      name: "Requests",
      path: "/admin/requests",
      icon: <MdPersonAdd size={22} />,
    },
    {
      name: "Approval Queue",
      path: "/admin/approval-queue",
      icon: <MdPersonAdd size={22} />,
    },
  ];

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="w-64 bg-white shadow-xl fixed h-full z-20 border-r border-gray-100 flex flex-col">
      <div className="p-6 border-b border-gray-50 bg-indigo-600 text-white">
        <h1 className="text-xl font-bold tracking-tight">ART POINT</h1>
        <p className="text-[10px] opacity-80 uppercase tracking-widest">
          Admin Panel
        </p>
      </div>

      <nav className="mt-6 flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all
              ${isActive ? "bg-indigo-50 text-indigo-600 shadow-sm" : "text-gray-500 hover:bg-gray-50"}
            `}
          >
            {item.icon}
            <span className="font-semibold text-sm">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
        >
          <MdLogout size={20} />
          <span className="font-bold text-sm">Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
