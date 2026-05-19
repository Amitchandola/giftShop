import React from "react";
import { useNavigate } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";

function Success() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-950 px-4 text-center">
      <h1 className="text-3xl font-bold text-amber-400">
        🎉 Thank You for Shopping!
      </h1>

      <p className="mt-3 text-gray-300 text-lg">
        Your order has been placed successfully.
      </p>

      {/* New Attractive Email Message */}
      <div className="mt-6 bg-gray-800 border border-amber-500/20 shadow-md rounded-xl p-6 max-w-xl">
        <h2 className="text-xl font-semibold text-amber-400 mb-2">
          📩 Please Check Your E-mail
        </h2>

        <p className="text-gray-400 leading-relaxed">
          We have sent your order confirmation, payment details, and delivery
          information to your registered email address. Please check your inbox
          (and spam folder if needed).
        </p>

        <p className="mt-4 text-gray-300 font-medium">
          Need help with your order?
        </p>

        <a
          href="https://wa.me/919917078468"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-lg transition"
        >
          <FaWhatsapp size={20} />
          Contact on WhatsApp: 9917078468
        </a>
      </div>

      <button
        onClick={() => navigate("/")}
        className="mt-8 px-6 py-3 bg-amber-500 text-black rounded-lg hover:bg-amber-600 transition font-semibold"
      >
        Continue Shopping
      </button>
    </div>
  );
}

export default Success;
