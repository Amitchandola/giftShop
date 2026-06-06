import React, { useState, useContext } from "react";
import AppContext from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

function Register() {
  const { register, loading } = useContext(AppContext);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [timer, setTimer] = useState(30);
  const [passwordError, setPasswordError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "password") {
      if (e.target.value.length < 5) {
        setPasswordError("Password must be at least 5 characters");
      } else {
        setPasswordError("");
      }
    }
  };
  // Function to send OTP
  const sendOtp = async () => {
    try {
      if (!form.name || !form.email || !form.password) {
        setMessage("⚠️ Please fill all fields");
        return;
      }

      if (form.password.length < 5) {
        setMessage("Password must be at least 5 characters");
        return;
      } else {
        setPasswordError("");
      }

      setOtpLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        },
      );

      const data = await response.json();
      setMessage(data.message);

      if (data.success) {
        setOtpSent(true);
        setCanResend(false);
        setTimer(30);

        const interval = setInterval(() => {
          setTimer((prev) => {
            if (prev === 1) {
              clearInterval(interval);
              setCanResend(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      setMessage("Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };
  // REGISTER
  const submit = async (e) => {
    e.preventDefault();
    setMessage("");

    // If OTP not sent yet, send it first
    if (!otpSent) {
      sendOtp();
      return;
    }

    // OTP already sent — verify and register
    if (!form.name || !form.email || !form.password || !otp) {
      setMessage("Please fill all fields");
      return;
    }

    if (form.password.length < 5) {
      setMessage("Password must be at least 5 characters");
      return;
    }

    const res = await register(form.name, form.email, form.password, otp);

    if (res.success) {
      setMessage("Registered successfully! Redirecting...");

      setForm({
        name: "",
        email: "",
        password: "",
      });

      setOtp("");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } else {
      setMessage(res.message);
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
        <form autoComplete="off" onSubmit={submit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm text-amber-400/80 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter Name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-amber-400/80 mb-1">
              Email
            </label>
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
            {form.email && (
              <p className="text-xs text-white mt-2">
                Please enter a valid email address. Your order confirmation
                details will be sent to this email after your order is placed.
              </p>
            )}
          </div>

          {/* Password */}

          <div className="relative">
            <label className="block text-sm text-amber-400/80 mb-1">
              Password
            </label>

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              minLength={5}
              className="w-full px-4 py-2 pr-10 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />

            {/* Eye Icon */}
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 cursor-pointer text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
            {/*  PASSWORD ERROR MESSAGE HERE */}
            {passwordError && (
              <p className="text-red-400 text-xs mt-1">{passwordError}</p>
            )}
          </div>

          {/* OTP Input — shown after form submit triggers OTP send */}
          {otpSent && (
            <div>
              <label className="block text-sm text-amber-400/80 mb-1">Enter OTP sent to your email</label>

              <input
                type="text"
                placeholder="Enter 6 digit OTP"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 tracking-widest text-center text-lg"
              />
            </div>
          )}
          {otpSent && (
            <div className="text-center">
              {canResend ? (
                <button
                  type="button"
                  onClick={sendOtp}
                  className="text-amber-400 underline text-sm"
                >
                  Resend OTP
                </button>
              ) : (
                <p className="text-sm text-gray-400">Resend OTP in {timer}s</p>
              )}
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading || otpLoading}
            className={`w-full py-2 rounded-lg font-semibold transition duration-300 shadow-md ${
              loading || otpLoading
                ? "bg-gray-600 cursor-not-allowed text-gray-400"
                : "bg-amber-500 text-black hover:bg-amber-600 font-bold"
            }`}
          >
            {otpLoading ? "Sending OTP..." : loading ? "Registering..." : otpSent ? "Verify & Register" : "Register"}
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
