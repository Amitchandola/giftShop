import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const url = `${import.meta.env.VITE_API_URL}/api`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${url}/users/forgot-password`, { email: email.trim() });
      if (res.data.success) {
        toast.success(res.data.message);
        setSent(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4">
      <div className="w-full max-w-md bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-amber-500/20">
        <h2 className="text-2xl font-bold text-center text-amber-400 mb-2">
          Forgot Password
        </h2>
        <p className="text-center text-gray-400 text-sm mb-6">
          Enter your email and we'll send you a reset link
        </p>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
              <Mail size={40} className="mx-auto text-green-400 mb-3" />
              <p className="text-green-300 font-medium">Reset link sent!</p>
              <p className="text-gray-400 text-sm mt-2">
                Check your email inbox and click the link to reset your password.
              </p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="text-amber-400 hover:text-amber-300 text-sm font-medium flex items-center gap-1 mx-auto"
            >
              <ArrowLeft size={14} /> Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-amber-400/80 mb-1">Email</label>
              <input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-lg font-semibold transition duration-300 shadow-md ${
                loading
                  ? "bg-gray-600 cursor-not-allowed text-gray-400"
                  : "bg-amber-500 text-black hover:bg-amber-600 font-bold"
              }`}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <p className="text-center text-sm text-gray-400">
              <span
                onClick={() => navigate("/login")}
                className="underline cursor-pointer hover:text-gray-200"
              >
                Back to Login
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
