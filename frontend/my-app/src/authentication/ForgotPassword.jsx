import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../config/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const sendOtp = async () => {
    const res = await api.post("/auth/forgot-password-otp", { email });
    alert(res.data.msg);

    // Go to Verify OTP page specifically for password reset
    navigate("/verify-otp", { state: { email, mode: "reset" } });
  };

  return (
    <div>
      <h2 className="text-3xl font-semibold text-center text-gray-900 mb-6">Forgot Password</h2>
      <p className="text-gray-600 text-sm mb-4 text-center">Enter your email to receive an OTP.</p>

      <div className="space-y-4">
        <input
          type="email"
          className="w-full px-3 py-2 rounded-lg bg-gray-50 text-gray-800 border border-gray-300 focus:ring-2 focus:ring-indigo-500"
          placeholder="you@example.com"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button onClick={sendOtp} className="w-full bg-gray-900 hover:bg-gray-700 text-white py-2 rounded-lg">
          Send OTP
        </button>

        <Link to="/login" className="block text-center text-black hover:underline text-sm">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
