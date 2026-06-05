import React, { useState, useContext } from "react";
import AppContext from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

function Login() {
  const { login, loginWithToken, loading } = useContext(AppContext);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState("password"); // "password" | "otp"
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Please fill all fields");
      return;
    }

    const res = await login(form.email, form.password);

    if (res.success) {
      navigate("/");
    }
  };

  const sendLoginOtp = async () => {
    if (!form.email) {
      toast.error("Enter your email first");
      return;
    }
    setOtpLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/checkout-otp/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email.trim().toLowerCase() }),
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success("OTP sent to your email");
        setOtpSent(true);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyLoginOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Enter OTP");
      return;
    }
    setOtpLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/checkout-otp/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email.trim().toLowerCase(),
            otp: otp.trim(),
            name: "User",
            phone: "",
          }),
        }
      );
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "OTP verification failed");
        return;
      }
      const result = await loginWithToken(data.token);
      if (result?.success) {
        toast.success(data.message || "Login successful");
        navigate("/");
      }
    } catch {
      toast.error("OTP verification failed");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4">
      {/* Card */}
      <div className="w-full max-w-md bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-amber-500/20">
        {/* Heading */}
        <h2 className="text-3xl font-bold text-center text-amber-400 mb-4">
          Welcome Back 👋
        </h2>

        {/* Login Mode Tabs */}
        <div className="flex rounded-lg bg-gray-700/50 p-1 mb-6">
          <button
            type="button"
            onClick={() => { setLoginMode("password"); setOtpSent(false); setOtp(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition ${
              loginMode === "password" ? "bg-amber-500 text-black" : "text-gray-400 hover:text-white"
            }`}
          >
            <Lock size={16} /> Password
          </button>
          <button
            type="button"
            onClick={() => { setLoginMode("otp"); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition ${
              loginMode === "otp" ? "bg-amber-500 text-black" : "text-gray-400 hover:text-white"
            }`}
          >
            <Mail size={16} /> OTP
          </button>
        </div>

        {/* Password Login Form */}
        {loginMode === "password" && (
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm text-amber-400/80 mb-1">Email</label>
              <input
                type="email"
                name="email"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                placeholder="example@email.com"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
            </div>

            <div className="relative">
              <label className="block text-sm text-amber-400/80 mb-1">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-2 pr-10 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 cursor-pointer text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
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
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        )}

        {/* OTP Login Form */}
        {loginMode === "otp" && (
          <form onSubmit={verifyLoginOtp} className="space-y-5">
            <div>
              <label className="block text-sm text-amber-400/80 mb-1">Email</label>
              <input
                type="email"
                name="email"
                autoComplete="off"
                placeholder="example@email.com"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={sendLoginOtp}
                disabled={otpLoading}
                className={`w-full py-2 rounded-lg font-semibold transition duration-300 shadow-md ${
                  otpLoading
                    ? "bg-gray-600 cursor-not-allowed text-gray-400"
                    : "bg-amber-500 text-black hover:bg-amber-600 font-bold"
                }`}
              >
                {otpLoading ? "Sending OTP..." : "Send OTP"}
              </button>
            ) : (
              <>
                <div>
                  <label className="block text-sm text-amber-400/80 mb-1">Enter OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 tracking-widest text-center text-lg"
                  />
                </div>
                <button
                  type="submit"
                  disabled={otpLoading}
                  className={`w-full py-2 rounded-lg font-semibold transition duration-300 shadow-md ${
                    otpLoading
                      ? "bg-gray-600 cursor-not-allowed text-gray-400"
                      : "bg-amber-500 text-black hover:bg-amber-600 font-bold"
                  }`}
                >
                  {otpLoading ? "Verifying..." : "Verify & Login"}
                </button>
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setOtp(""); }}
                  className="w-full text-sm text-amber-400/70 hover:text-amber-400 transition"
                >
                  Resend OTP
                </button>
              </>
            )}
          </form>
        )}

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="underline cursor-pointer hover:text-gray-200"
          >
            Register
          </span>
        </p>        <p className="text-center text-sm text-gray-400 mt-2">
          <span
            onClick={() => navigate("/forgot-password")}
            className="underline cursor-pointer hover:text-amber-400 text-amber-400/70"
          >
            Forgot Password?
          </span>
        </p>      </div>
    </div>
  );
}

export default Login;
