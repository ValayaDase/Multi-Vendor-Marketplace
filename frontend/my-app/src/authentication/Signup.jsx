import { useState } from "react";
import { Link , useNavigate } from "react-router-dom";
import api from "../config/api";


export default function Signup() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const[name , setName] = useState("");
  const[email , setEmail] = useState("");
  const[password , setPassword] = useState("");

  const handleSignup = async() => {
    const res = await api.post("/auth/signup", {
      name,
      email,
      password
    });
    alert(res.data.msg);
    navigate("/verify-otp", { state: { email } });
  }

  return (
    <div>
      <h2 className="text-3xl font-semibold text-center text-gray-900 mb-6">
        Create Account
      </h2>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="text-sm text-gray-700">Full Name</label>
          <input
            onChange={(e)=>{setName(e.target.value)}}
            type="text"
            className="w-full mt-1 px-3 py-2 rounded-lg bg-gray-50 text-gray-800 border border-gray-300 focus:ring-2 focus:ring-indigo-500"
            placeholder="John Doe"
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-sm text-gray-700">Email</label>
          <input
            onChange={(e)=>{setEmail(e.target.value)}}
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
              onChange={(e)=>{setPassword(e.target.value)}}
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

        {/* Button */}
        <button onClick={handleSignup} className="w-full bg-gray-900 hover:bg-gray-700 text-white py-2 rounded-lg">
          Create Account
        </button>

        <p className="text-gray-600 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-black hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
