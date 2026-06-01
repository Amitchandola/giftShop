import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Lock, Eye, EyeOff, KeyRound } from "lucide-react";

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const url = `${import.meta.env.VITE_API_URL}/api`;

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
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
        setStep(2);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${url}/users/verify-reset-otp`, { email: email.trim(), otp: otp.trim() });
      if (res.data.success) {
        toast.success("OTP verified!");
        setResetToken(res.data.resetToken);
        setStep(3);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }
    if (password.length < 5) {
      toast.error("Password must be at least 5 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${url}/users/reset-password`, { token: resetToken, password });
      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/login");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4">
      <div className="w-full max-w-md bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-amber-500/20">
        <h2 className="text-2xl font-bold text-center text-amber-400 mb-2">
          {step === 1 && "Forgot Password"}
          {step === 2 && "Enter OTP"}
          {step === 3 && "Reset Password"}
        </h2>
        <p className="text-center text-gray-400 text-sm mb-6">
          {step === 1 && "Enter your email to receive a verification code"}
          {step === 2 && "Enter the 6-digit OTP sent to your email"}
          {step === 3 && "Set your new password"}
        </p>

        {/* Step 1: Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-5">
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
              {loading ? "Sending..." : "Send OTP"}
            </button>
            <p className="text-center text-sm text-gray-400">
              <span onClick={() => navigate("/login")} className="underline cursor-pointer hover:text-gray-200">
                Back to Login
              </span>
            </p>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-2">
              <div className="flex items-center gap-2 text-amber-300 text-sm">
                <Mail size={16} />
                <span>OTP sent to <strong>{email}</strong></span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-amber-400/80 mb-1">Enter OTP</label>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white text-center text-xl tracking-[0.5em] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
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
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <p className="text-center text-sm text-gray-400">
              <span onClick={handleSendOtp} className="underline cursor-pointer hover:text-gray-200">
                Resend OTP
              </span>
            </p>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="relative">
              <label className="block text-sm text-amber-400/80 mb-1">New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 cursor-pointer text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
            <div>
              <label className="block text-sm text-amber-400/80 mb-1">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
