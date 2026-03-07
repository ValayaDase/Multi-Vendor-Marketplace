import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import api from "../config/api";

export default function Login() {
  const [show, setShow] = useState(false);
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const res = await api.post("/auth/login", { email, password });

    if (!res.data.token) {
      alert(res.data.msg);
      return;
    }

    login(res.data.user, res.data.token);

    // redirect based on role
    if (res.data.user.role === "admin") window.location.href = "/admin";
    else if (res.data.user.role === "seller") window.location.href = "/seller";
    else window.location.href = "/buyer";
  };



  return (
    <div>
      <h2 className="text-3xl font-semibold text-center text-gray-900 mb-6">
        Login
      </h2>

      <div className="space-y-4">
        {/* Email */}
        <div>
          <label className="text-sm text-gray-700">Email</label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="w-full mt-1 px-3 py-2 rounded-lg bg-gray-50 text-gray-800 border border-gray-300 focus:ring-2 focus:ring-indigo-500"
            placeholder="you@example.com"
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-sm text-gray-700">Password</label>
          <div className="relative">
            <input
              onChange={(e) => setPassword(e.target.value)}
              type={show ? "text" : "password"}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-gray-50 text-gray-800 border border-gray-300 focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
            <span
              className="absolute right-3 top-3 cursor-pointer text-gray-500"
              onClick={() => setShow(!show)}
            >
              {show ? "🙈" : "👁️"}
            </span>
          </div>
        </div>

        {/* Forgot */}
        <Link
          to="/forgot-password"
          className="block text-right text-black text-sm hover:underline"
        >
          Forgot Password?
        </Link>

        {/* Button */}
        <button onClick={handleLogin} className="w-full bg-gray-900 hover:bg-gray-700 text-white py-2 rounded-lg">
          Login
        </button>

        <p className="text-gray-600 text-center text-sm">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-black hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
