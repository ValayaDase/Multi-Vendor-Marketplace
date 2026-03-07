import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-gray-200 rounded-2xl p-8 shadow-lg border border-gray-400">
        <Outlet />
      </div>
    </div>
  );
}
