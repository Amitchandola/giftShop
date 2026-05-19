import React, { useState, useContext } from "react";
import AppContext from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

function Register() {
  const { register, loading } = useContext(AppContext);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.name || !form.email || !form.password) {
      setMessage("⚠️ Please fill all fields");
      return;
    }

    const res = await register(form.name, form.email, form.password);
    if (res.success) {
      setMessage("Registered successfully!");

      setForm({
        name: "",
        email: "",
        password: "",
      });

      // Auto-logged in, redirect to home
      setTimeout(() => {
        navigate("/");
      }, 500);
    } else {
      setMessage(res?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4">
      {/* Card */}
      <div className="w-full max-w-md bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-amber-500/20">
        {/* Heading */}
        <h2 className="text-3xl font-bold text-center text-amber-400 mb-6">
          Create Account 🚀
        </h2>
        {/* Message */}
        {message && (
          <p className="text-center text-sm mb-4 text-white bg-black/20 py-2 rounded-lg">
            {message}
          </p>
        )}
        {/* Form */}
        <form onSubmit={submit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm text-amber-400/80 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-amber-400/80 mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
            <p className="text-xs text-white mt-2">
              Please enter a valid email address. Your order confirmation
              details will be sent to this email after your order is placed.
            </p>
          </div>

          {/* Password */}

          <div className="relative">
            <label className="block text-sm text-amber-400/80 mb-1">Password</label>

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 pr-10 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />

            {/* Eye Icon */}
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 cursor-pointer text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-semibold transition duration-300 shadow-md ${
              loading
                ? "bg-gray-600 cursor-not-allowed text-gray-400"
                : "bg-amber-500 text-black hover:bg-amber-600 font-bold"
            }`}
          >
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>
        {/* Footer */}

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="underline hover:text-gray-200">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
