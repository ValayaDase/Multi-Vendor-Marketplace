import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import api from "../config/api";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const [otp, setOtp] = useState("");

  const email = location.state?.email;
  const mode = location.state?.mode || "signup"; 
  // mode can be "signup" or "reset"

  const verifyNow = async () => {
    const res = await api.post("/auth/verify-otp", {
      email,
      otp,
    });

    alert(res.data.msg);

    if (mode === "reset") {
      // Go to reset password page
      navigate("/reset-password", { state: { email } });
    } else {
      // Normal signup flow
      navigate("/login");
    }
  };

  const resendOtp = async () => {
    const res = await api.post("/auth/resend-otp", {
      email,
    });

    alert(res.data.msg);
  };

  return (
    <div>
      <h2 className="text-3xl font-semibold text-center text-gray-900 mb-6">
        Verify OTP
      </h2>

      <p className="text-gray-600 text-sm mb-4 text-center">
        Enter the 6-digit OTP sent to your email.
      </p>

      <div className="space-y-4">
        <input
          onChange={(e) => setOtp(e.target.value)}
          type="text"
          maxLength="6"
          className="w-full tracking-widest text-center text-xl px-3 py-3 rounded-lg bg-gray-50 text-gray-800 border border-gray-300 focus:ring-2 focus:ring-indigo-500"
          placeholder="------"
        />

        <button
          onClick={verifyNow}
          className="w-full bg-gray-900 hover:bg-gray-700 text-white py-2 rounded-lg"
        >
          Verify
        </button>

        <button
          onClick={resendOtp}
          className="block w-full text-center text-gray-600 hover:underline text-sm"
        >
          Resend OTP
        </button>
      </div>
    </div>
  );
}
