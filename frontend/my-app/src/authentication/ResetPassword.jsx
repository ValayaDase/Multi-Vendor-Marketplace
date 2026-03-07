import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../config/api";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const { state } = useLocation();
  const navigate = useNavigate();

  const email = state?.email;

  const resetNow = async () => {
    const res = await api.post("/auth/reset-password", {
      email,
      password,
    });

    alert(res.data.msg);
    navigate("/login");
  };

  return (
    <div>
      <h2 className="text-3xl font-semibold text-center mb-6">Reset Password</h2>

      <input
        type="password"
        placeholder="New Password"
        className="w-full px-3 py-2 mb-4 border rounded-lg"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={resetNow}
        className="w-full bg-gray-900 hover:bg-gray-700 text-white py-2 rounded-lg"
      >
        Update Password
      </button>
    </div>
  );
}
