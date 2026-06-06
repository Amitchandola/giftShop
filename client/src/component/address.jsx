
import React, { useState, useContext } from "react";
import AppContext from "../context/AppContext";
import { useNavigate } from "react-router-dom";

function Address() {
  const { shippingAddress, loading, userAddress } = useContext(AppContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");

    const { fullName, phoneNumber, address, city, state, country, pinCode } =
      form;

    // Validation
    if (
      !fullName ||
      !phoneNumber ||
      !address ||
      !city ||
      !state ||
      !country ||
      !pinCode
    ) {
      setMessage("Please fill all fields");
      return;
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      setMessage("Phone number must be exactly 10 digits");
      return;
    }

    const res = await shippingAddress(
      fullName,
      phoneNumber,
      address,
      city,
      state,
      country,
      pinCode,
    );

    if (res?.success) {
      setMessage("Address saved successfully!");

      // reset form
      setForm({
        fullName: "",
        phoneNumber: "",
        address: "",
        city: "",
        state: "",
        country: "",
        pinCode: "",
      });

      setTimeout(() => {
        navigate("/checkout");
      }, 1000);
    } else {
      setMessage(res?.error || "Failed to save address");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4">
      <div className="w-full max-w-lg bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-amber-500/20">
        <h2 className="text-2xl font-medium text-center text-amber-400 mb-6">
          Shipping Address 📦
        </h2>

        {message && (
          <p className="text-center text-sm mb-4 text-white bg-black/20 py-2 rounded-lg">
            {message}
          </p>
        )}

        <form onSubmit={submit} className="space-y-4">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 placeholder-gray-400"
          />

          <input
            type="tel"
            name="phoneNumber"
            placeholder="Phone Number (10 digits)"
            value={form.phoneNumber}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 10);
              setForm({ ...form, phoneNumber: val });
            }}
            maxLength={10}
            pattern="[0-9]{10}"
            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 placeholder-gray-400"
          />

          <textarea
            name="address"
            placeholder="Full Address"
            value={form.address}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 placeholder-gray-400"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
              className="px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 placeholder-gray-400"
            />

            <input
              type="text"
              name="state"
              placeholder="State"
              value={form.state}
              onChange={handleChange}
              className="px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 placeholder-gray-400"
            />
          </div>

          <input
            type="text"
            name="country"
            placeholder="Country"
            value={form.country}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 placeholder-gray-400"
          />

          <input
            type="number"
            name="pinCode"
            placeholder="Pincode"
            value={form.pinCode}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 placeholder-gray-400"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-medium transition ${
              loading
                ? "bg-gray-600 cursor-not-allowed text-gray-400"
                : "bg-amber-500 text-black hover:bg-amber-600 font-bold"
            }`}
          >
            {loading ? "Saving..." : "Save & Continue"}
          </button>
        </form>

        {/* OLD ADDRESS SECTION */}
        {userAddress?.length > 0 && (
          <div>
            <button
              onClick={() => navigate("/checkout")}
              className="w-full mt-4 py-3 rounded-lg font-medium bg-amber-500 text-black hover:bg-amber-600 font-bold"
            >
              Use Old Address
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Address;
