import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { MdGridView, MdLogout, MdDeleteOutline } from "react-icons/md";
import { AiOutlineHome } from "react-icons/ai";
import api from "../../config/api";

const SellerLayout = () => {
  const navigate = useNavigate();
  const [accessState, setAccessState] = useState("loading");
  const [currentUser, setCurrentUser] = useState(null);

  const loadProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      const user = res.data;
      setCurrentUser(user);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "seller" && (user.status || "active") === "active") {
        setAccessState("allowed");
        return;
      }

      setAccessState((user.status || "active") === "suspended" ? "suspended" : "denied");
    } catch {
      setAccessState("denied");
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const requestAccountDeletion = async () => {
    if (!window.confirm("Submit an account deletion request for admin review? Your products will stay live until the request is approved.")) {
      return;
    }

    try {
      const res = await api.post("/seller/request-account-deletion");
      alert(res.data?.msg || "Account deletion request submitted.");
      await loadProfile();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Failed to submit deletion request");
      await loadProfile();
    }
  };

  const deletionStatus = currentUser?.deletionStatus || "none";
  const hasPendingDeletionRequest = deletionStatus === "pending";
  const deletionRequestedAt = currentUser?.deletionRequestedAt
    ? new Date(currentUser.deletionRequestedAt).toLocaleString()
    : null;

  if (accessState === "loading") {
    return <div className="min-h-screen bg-[#FCFCFD] flex items-center justify-center font-semibold text-gray-500">Loading seller portal...</div>;
  }

  if (accessState !== "allowed") {
    return (
      <div className="min-h-screen bg-[#FCFCFD] p-10 flex items-center justify-center">
        <div className="max-w-md w-full rounded-3xl border border-gray-100 bg-white p-10 shadow-xl text-center">
          <h1 className="text-2xl font-bold text-gray-800">Access Unavailable</h1>
          <p className="mt-4 text-gray-500 leading-relaxed">
            {accessState === "suspended"
              ? "Your seller account is suspended. Please contact support to resolve this."
              : "This account does not have permission to access the seller portal."}
          </p>
          <button
            onClick={() => navigate("/buyer")}
            className="mt-8 w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            Continue as Buyer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FCFCFD]">
      <aside className="w-64 bg-white shadow-xl border-r border-gray-100 fixed h-full z-20 flex flex-col">
        <div className="p-6 border-b border-gray-50 bg-gray-800 text-white">
          <h1 className="text-xl font-bold tracking-tight uppercase">Art Point</h1>
          <p className="text-[10px] opacity-80 uppercase tracking-widest">Seller Portal</p>
        </div>

        <nav className="mt-6 flex-1 px-4 space-y-1">
          <NavItem to="/seller" icon={<AiOutlineHome size={22} />} label="Dashboard" />
          <NavItem to="/seller/products" icon={<MdGridView size={22} />} label="Collection" />
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-1">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
          >
            <MdLogout size={20} />
            <span className="font-bold text-sm">Log Out</span>
          </button>

          <button
            onClick={requestAccountDeletion}
            disabled={hasPendingDeletionRequest}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              hasPendingDeletionRequest
                ? "cursor-not-allowed bg-gray-50 text-gray-300"
                : "text-red-400 hover:bg-red-50 hover:text-red-600"
            }`}
          >
            <MdDeleteOutline size={20} />
            <span className="font-bold text-sm">
              {hasPendingDeletionRequest ? "Deletion Request Pending" : "Request Account Deletion"}
            </span>
          </button>
        </div>
      </aside>

      <div className="ml-64 flex-1 flex flex-col">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-800">Management Portal</h2>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Overview & Performance</p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/buyer")}
                className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all border border-indigo-100"
              >
                Switch to Buyer Mode
              </button>

              <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                <span className="text-xs font-bold text-gray-700 hidden sm:block">
                  {currentUser?.name || JSON.parse(localStorage.getItem("user"))?.name || "Seller"}
                </span>
                <div className="h-9 w-9 rounded-xl bg-gray-800 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                  {currentUser?.name?.charAt(0) || JSON.parse(localStorage.getItem("user"))?.name?.charAt(0) || "S"}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 flex-1">
          <div className="max-w-6xl mx-auto">
            {deletionStatus !== "none" && (
              <div
                className={`mb-6 rounded-2xl border px-5 py-4 ${
                  deletionStatus === "pending"
                    ? "border-amber-200 bg-amber-50 text-amber-900"
                    : deletionStatus === "approved"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-rose-200 bg-rose-50 text-rose-900"
                }`}
              >
                <div className="text-sm font-bold uppercase tracking-wide">
                  Account deletion request: {deletionStatus}
                </div>
                {deletionRequestedAt && (
                  <p className="mt-1 text-sm">Requested on {deletionRequestedAt}</p>
                )}
                {currentUser?.deletionReason && (
                  <p className="mt-1 text-sm">Reason: {currentUser.deletionReason}</p>
                )}
                {deletionStatus === "pending" && (
                  <p className="mt-1 text-sm">
                    Your request is under admin review. You can continue managing orders until a decision is made.
                  </p>
                )}
              </div>
            )}
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
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3 rounded-xl transition-all
      ${isActive ? "bg-indigo-50 text-gray-800 shadow-sm" : "text-gray-500 hover:bg-gray-50"}
    `}
  >
    <span>{icon}</span>
    <span className="font-semibold text-sm">{label}</span>
  </NavLink>
);

export default SellerLayout;
