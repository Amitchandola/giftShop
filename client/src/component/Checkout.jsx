import React, { useEffect, useState, useContext } from "react";
import AppContext from "../context/AppContext";
import { Plus, Minus, ShoppingCart, CreditCard, MapPin, Trash2, CheckCircle, XCircle, Banknote, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "react-toastify";

function Checkout() {
  const {
    cart,
    decreaseQty,
    addToCart,
    userAddress,
    getAddress,
    shippingAddress,
    deleteAddress,
    placeOrder,
    isAuthenticated,
    guestCheckout,
    loading,
    clearCart,
    // setCheckoutVerifiedEmail,
  
  } = useContext(AppContext);

  const [qty, setQty] = useState(0);
  const [price, setPrice] = useState(0);
  const [transactionId, setTransactionId] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // "success" | "failed" | null
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMode, setPaymentMode] = useState("upi"); // "upi" | "cod"
const [otpSent, setOtpSent] = useState(false);
const [otp, setOtp] = useState("");
const [otpLoading, setOtpLoading] = useState(false);
const { setOtpVerified } = useContext(AppContext);
  // Address form
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
  });

  // Guest form state
  const [guestStep, setGuestStep] = useState(!isAuthenticated ? "info" : "done");
  const [guestForm, setGuestForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const sendOtp = async () => {
  if (!guestForm.email) {
    toast.error("Enter email first");
    return;
  }

  setOtpLoading(true);

  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/checkout-otp/send`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
    email: guestForm.email.trim().toLowerCase(),
            otp: otp.trim(), 
        }),
      }
    );

    const data = await res.json();

    if (data.success) {
      toast.success("OTP sent to email");
      setOtpSent(true);
    } else {
      toast.error(data.message || "Failed to send OTP");
    }
  } catch (err) {
    toast.error("OTP error");
  } finally {
    setOtpLoading(false);
  }
};

  const navigate = useNavigate();

//   const verifyOtpAndContinue = async () => {
//   if (!otp) {
//     toast.error("Enter OTP");
//     return;
//   }

//   try {
//     const res = await fetch(
//       `${import.meta.env.VITE_API_URL}/api/users/verify-otp`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           email: guestForm.email,
        
          
//         }),
//       }
//     );

//     const data = await res.json();

//     if (!data.success) {
//       toast.error(data.message);
//       return;
//     }

//     const result = await guestCheckout(
//       guestForm.name,
//       guestForm.email,
//       guestForm.phone
//     );

//     if (result?.success) {
//       toast.success("Guest login successful");
//       setGuestStep("done");
//     }

//   } catch (err) {
//     toast.error("OTP verification failed");
//   }
// };
const verifyOtpAndContinue = async () => {
  if (!otp) {
    toast.error("Enter OTP");
    return;
  }

  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/checkout-otp/verify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: guestForm.email.trim().toLowerCase(),
      otp: String(otp).trim(),
        }),
      }
    );

    const data = await res.json();

if (!data.success) {
  toast.error(data.message);
  return;
}

const result = await guestCheckout(
  guestForm.name,
  guestForm.email,
  guestForm.phone
);

    if (result?.success) {
      toast.success("Guest login successful");
      setGuestStep("done");
    }
  } catch (err) {
    toast.error("OTP verification failed");
  }
};

  useEffect(() => {
    if (isAuthenticated) {
      setGuestStep("done");
      getAddress?.();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let totalQty = 0;
    let totalPrice = 0;
    (cart || []).forEach((item) => {
      totalQty += item.qty || 0;
      totalPrice += (item.price || 0) * (item.qty || 0);
    });
    setQty(totalQty);
    setPrice(totalPrice);
  }, [cart]);

  // UPI Payment
  const upiId = "poojarr9920-7@okicici";
  const payeeName = "Pooja Bahuguna";
  const upiAmount = parseFloat(price).toFixed(2);
  const message = `Order Payment Rs ${upiAmount}`;
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${upiAmount}&cu=INR&tn=${encodeURIComponent(message)}`;

  // Guest form submit
 const handleGuestSubmit = (e) => {
  e.preventDefault();

  if (!guestForm.name || !guestForm.email || !guestForm.phone) {
    toast.error("Please fill all fields");
    return;
  }

  if (!/^\d{10}$/.test(guestForm.phone)) {
    toast.error("Phone number must be exactly 10 digits");
    return;
  }

  sendOtp();
};

  // Add address inline
  const handleAddAddress = async (e) => {
    e.preventDefault();
    const { fullName, phoneNumber, address, city, state, country, pinCode } = addressForm;
    if (!fullName || !phoneNumber || !address || !city || !state || !country || !pinCode) {
      toast.error("Please fill all address fields");
      return;
    }
    if (!/^\d{10}$/.test(phoneNumber)) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }
    const res = await shippingAddress(fullName, phoneNumber, address, city, state, country, pinCode);
    if (res?.success) {
      setAddressForm({ fullName: "", phoneNumber: "", address: "", city: "", state: "", country: "", pinCode: "" });
      setShowAddressForm(false);
    }
  };

  // Place order handler
  const handlePlaceOrder = async () => {
    if (!userAddress?.length) {
      toast.error("Please add a delivery address");
      return;
    }
    if (!cart?.length) {
      toast.error("Cart is empty");
      return;
    }

    const formData = new FormData();
    formData.append("addressId", userAddress[selectedAddressIdx]?._id);

    if (paymentMode === "cod") {
      formData.append("paymentMethod", "COD");
      formData.append("transactionId", "COD");
    } else {
      if (!transactionId.trim()) {
        toast.error("Please enter UPI Transaction ID");
        return;
      }
      if (!paymentScreenshot) {
        toast.error("Please upload payment screenshot");
        return;
      }
      formData.append("paymentMethod", "UPI QR");
      formData.append("transactionId", transactionId.trim());
      formData.append("paymentScreenshot", paymentScreenshot);
    }

    const res = await placeOrder(formData);

    if (res?.success) {
      setPaymentStatus("success");
      setOrderPlaced(true);
    } else {
      setPaymentStatus("failed");
    }
  };

  // Order success screen
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md text-center border border-amber-500/20">
          <CheckCircle size={64} className="mx-auto text-amber-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Order Placed!</h2>
          {paymentMode === "cod" ? (
            <p className="text-gray-300 mb-2">Payment: <span className="font-semibold text-amber-400">Cash on Delivery</span></p>
          ) : (
            <p className="text-gray-300 mb-2">Transaction ID: <span className="font-mono font-semibold text-amber-400">{transactionId}</span></p>
          )}
          <p className="text-gray-400 mb-6">
            {paymentMode === "cod"
              ? "Please keep the exact amount ready at the time of delivery."
              : "Your order is being verified. You'll receive a confirmation soon."}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/my-orders")}
              className="px-5 py-2 bg-amber-500 text-black rounded-lg hover:bg-amber-600 transition font-semibold"
            >
              View Orders
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-5 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // GUEST INFO FORM
  if (guestStep === "info") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 p-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">Checkout</h1>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cart items */}
          <div className="md:col-span-2 space-y-4">
            {(cart || []).map((product) => (
              <div key={product.productId} className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-800 border border-gray-700 p-4 rounded-xl shadow gap-3">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <img
                    src={product.imageSrc ? (product.imageSrc.startsWith("http") || product.imageSrc.startsWith("data:") ? product.imageSrc : `${import.meta.env.VITE_API_URL}/uploads/${product.imageSrc}`) : "https://placehold.co/80x80?text=No+Img"}
                    alt={product.title}
                    className="h-16 w-16 sm:h-20 sm:w-20 object-contain rounded-lg flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="font-medium text-white truncate">{product.title}</h3>
                    <p className="text-amber-400 font-semibold">₹{product.price} × {product.qty}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="bg-gray-800 border border-gray-700 p-4 rounded-xl shadow flex justify-between">
              <span className="font-semibold text-white">Total: {qty} items</span>
              <span className="text-amber-400 font-bold text-lg">₹{price}</span>
            </div>
          </div>

          {/* Guest form */}
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow h-fit">
            <h2 className="text-xl font-semibold mb-4 text-white">Enter Your Details</h2>
            <p className="text-sm text-gray-400 mb-4">Sign in or we'll create an account for you.</p>
            <form onSubmit={handleGuestSubmit} className="space-y-4">
              <input type="text" placeholder="Full Name" value={guestForm.name} onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })} className="w-full border border-gray-600 bg-gray-700 text-white placeholder-gray-400 p-3 rounded-lg" required />
              <input type="email" placeholder="Email Address" value={guestForm.email} onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })} className="w-full border border-gray-600 bg-gray-700 text-white placeholder-gray-400 p-3 rounded-lg" required />
              <input type="tel" placeholder="Phone (10 digits)" value={guestForm.phone} onChange={(e) => { const val = e.target.value.replace(/\D/g, "").slice(0, 10); setGuestForm({ ...guestForm, phone: val }); }} maxLength={10} className="w-full border border-gray-600 bg-gray-700 text-white placeholder-gray-400 p-3 rounded-lg" required />
              {/* <button type="submit" disabled={loading} className={`w-full py-3 rounded-lg font-semibold transition ${loading ? "bg-gray-600 cursor-not-allowed text-gray-400" : "bg-amber-500 text-black hover:bg-amber-600"}`}>
                {loading ? "Processing..." : "Continue"}
              </button> */}
              {!otpSent && (
  <button
    type="button"
    onClick={sendOtp}
    disabled={otpLoading}
    className="w-full py-3 bg-amber-500 text-black rounded-lg"
  >
    {otpLoading ? "Sending OTP..." : "Send OTP"}
  </button>
)}
{otpSent && (
  <div className="space-y-3">
    <input
      type="text"
      placeholder="Enter OTP"
      value={otp}
      onChange={(e) => setOtp(e.target.value)}
      className="w-full p-3 bg-gray-700 text-white rounded-lg"
    />

    <button
      type="button"
      onClick={verifyOtpAndContinue}
      className="w-full py-3 bg-green-500 text-black rounded-lg"
    >
      Verify OTP & Continue
    </button>
  </div>
)}
            </form>
            <div className="mt-4 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <button onClick={() => navigate("/login", { state: { from: "/checkout" } })} className="text-amber-400 underline">Log in</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MAIN CHECKOUT
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">Checkout</h1>

      {!cart || cart.length === 0 ? (
        <div className="max-w-md mx-auto bg-gray-800 border border-gray-700 p-8 rounded-xl shadow text-center">
          <ShoppingCart size={48} className="mx-auto text-gray-500 mb-3" />
          <p className="text-gray-400 mb-4">Your cart is empty</p>
          <button onClick={() => navigate("/")} className="px-6 py-2 bg-amber-500 text-black rounded-lg font-semibold hover:bg-amber-600">Continue Shopping</button>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT — Cart Items + QR */}
          <div className="lg:col-span-2 space-y-4">
            {/* Cart Items */}
            {(cart || []).map((product) => (
              <div key={product.productId} className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-800 border border-gray-700 p-3 sm:p-4 rounded-xl shadow gap-3">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <img
                    src={product.imageSrc ? (product.imageSrc.startsWith("http") || product.imageSrc.startsWith("data:") ? product.imageSrc : `${import.meta.env.VITE_API_URL}/uploads/${product.imageSrc}`) : "https://placehold.co/80x80?text=No+Img"}
                    alt={product.title}
                    className="h-14 w-14 sm:h-20 sm:w-20 object-contain rounded-lg flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="font-medium text-white truncate">{product.title}</h3>
                    <p className="text-amber-400 font-semibold">₹{product.price}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button onClick={() => decreaseQty(product.productId)} className="p-2 bg-gray-700 rounded hover:bg-gray-600 text-white"><Minus size={14} /></button>
                  <span className="font-semibold w-6 text-center text-white">{product.qty}</span>
                  <button onClick={() => addToCart(product.productId, product.title, product.price, product.imageSrc)} className="p-2 bg-gray-700 rounded hover:bg-gray-600 text-white"><Plus size={14} /></button>
                </div>
              </div>
            ))}

            {/* Order Total */}
            <div className="bg-gray-800 border border-gray-700 p-4 rounded-xl shadow flex justify-between items-center">
              <span className="font-semibold text-white">Total ({qty} items)</span>
              <span className="text-2xl font-bold text-amber-400">₹{price}</span>
            </div>

            {/* Payment Mode Selector */}
            <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                <CreditCard size={20} /> Select Payment Method
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {/* COD Option */}
                <button
                  onClick={() => setPaymentMode("cod")}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${
                    paymentMode === "cod"
                      ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                      : "border-gray-600 bg-gray-700/50 hover:border-gray-500"
                  }`}
                >
                  <Banknote size={28} className={paymentMode === "cod" ? "text-amber-400" : "text-gray-400"} />
                  <span className={`font-semibold text-sm ${paymentMode === "cod" ? "text-amber-400" : "text-gray-300"}`}>
                    Cash on Delivery
                  </span>
                  {paymentMode === "cod" && (
                    <span className="absolute top-2 right-2 w-3 h-3 bg-amber-500 rounded-full" />
                  )}
                </button>

                {/* UPI Option */}
                <button
                  onClick={() => setPaymentMode("upi")}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${
                    paymentMode === "upi"
                      ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                      : "border-gray-600 bg-gray-700/50 hover:border-gray-500"
                  }`}
                >
                  <QrCode size={28} className={paymentMode === "upi" ? "text-amber-400" : "text-gray-400"} />
                  <span className={`font-semibold text-sm ${paymentMode === "upi" ? "text-amber-400" : "text-gray-300"}`}>
                    UPI / QR Code
                  </span>
                  {paymentMode === "upi" && (
                    <span className="absolute top-2 right-2 w-3 h-3 bg-amber-500 rounded-full" />
                  )}
                </button>
              </div>

              {/* COD Info */}
              {paymentMode === "cod" && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Banknote size={22} className="text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-white font-medium">Cash on Delivery</p>
                      <p className="text-gray-400 text-sm mt-1">
                        Pay <span className="text-amber-400 font-semibold">₹{price}</span> in cash when your order is delivered.
                        Please keep the exact amount ready.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* UPI Payment Section */}
              {paymentMode === "upi" && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* QR Code */}
                    <div className="flex flex-col items-center">
                      <QRCodeCanvas value={upiLink} size={180} />
                      <p className="text-sm text-gray-400 mt-3">Scan to pay ₹{price}</p>
                      <p className="text-xs text-gray-500 mt-1">UPI ID: {upiId}</p>
                      <a
                        href={upiLink}
                        className="mt-3 px-4 py-2 bg-amber-500 text-black rounded-lg text-sm hover:bg-amber-600 transition font-semibold"
                      >
                        Open UPI App
                      </a>
                    </div>

                    {/* Transaction Details */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-300 block mb-1">Transaction ID *</label>
                        <input
                          type="text"
                          placeholder="Enter UPI Transaction/UTR ID"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          className="w-full border border-gray-600 bg-gray-700 text-white placeholder-gray-400 p-3 rounded-lg focus:ring-2 focus:ring-amber-400/50 outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter the transaction ID from your UPI app after payment</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-300 block mb-1">Payment Screenshot *</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setPaymentScreenshot(e.target.files[0])}
                          className="w-full border border-gray-600 bg-gray-700 text-white p-2 rounded-lg"
                        />
                      </div>

                      {/* Payment status indicator */}
                      {paymentStatus === "failed" && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg">
                          <XCircle size={18} />
                          <span className="text-sm font-medium">Payment verification failed. Please check details and retry.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Address + Place Order */}
          <div className="space-y-4">
            {/* Address Section */}
            <div className="bg-gray-800 border border-gray-700 p-5 rounded-xl shadow">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
                <MapPin size={18} /> Delivery Address
              </h3>

              {/* Saved Addresses */}
              {userAddress?.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {userAddress.map((addr, idx) => (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedAddressIdx(idx)}
                      className={`relative p-3 rounded-lg border-2 cursor-pointer transition ${
                        selectedAddressIdx === idx
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-gray-600 hover:border-gray-500"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="text-sm">
                          <p className="font-semibold text-white">{addr.fullName}</p>
                          <p className="text-gray-400">{addr.address}</p>
                          <p className="text-gray-400">{addr.city}, {addr.state} - {addr.pinCode}</p>
                          <p className="text-gray-500">{addr.phoneNumber}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm("Delete this address?")) {
                              deleteAddress(addr._id);
                              if (selectedAddressIdx >= userAddress.length - 1) {
                                setSelectedAddressIdx(0);
                              }
                            }
                          }}
                          className="p-1 text-red-400 hover:text-red-600 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {selectedAddressIdx === idx && (
                        <span className="absolute top-2 right-8 text-amber-400 text-xs font-bold">✓ Selected</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-3">No saved addresses yet.</p>
              )}

              {/* Add New Address Toggle */}
              {!showAddressForm ? (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="w-full py-2 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-amber-500/50 hover:text-amber-400 transition text-sm"
                >
                  + Add New Address
                </button>
              ) : (
                <form onSubmit={handleAddAddress} className="space-y-3 border-t border-gray-600 pt-3">
                  <input type="text" placeholder="Full Name" value={addressForm.fullName} onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })} className="w-full border border-gray-600 bg-gray-700 text-white placeholder-gray-400 p-2.5 rounded-lg text-sm" required />
                  <input type="tel" placeholder="Phone (10 digits)" value={addressForm.phoneNumber} onChange={(e) => { const val = e.target.value.replace(/\D/g, "").slice(0, 10); setAddressForm({ ...addressForm, phoneNumber: val }); }} maxLength={10} className="w-full border border-gray-600 bg-gray-700 text-white placeholder-gray-400 p-2.5 rounded-lg text-sm" required />
                  <textarea placeholder="Full Address" value={addressForm.address} onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })} className="w-full border border-gray-600 bg-gray-700 text-white placeholder-gray-400 p-2.5 rounded-lg text-sm" rows={2} required />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="City" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} className="border border-gray-600 bg-gray-700 text-white placeholder-gray-400 p-2.5 rounded-lg text-sm" required />
                    <input type="text" placeholder="State" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} className="border border-gray-600 bg-gray-700 text-white placeholder-gray-400 p-2.5 rounded-lg text-sm" required />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Country" value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} className="border border-gray-600 bg-gray-700 text-white placeholder-gray-400 p-2.5 rounded-lg text-sm" required />
                    <input type="text" placeholder="Pincode" value={addressForm.pinCode} onChange={(e) => setAddressForm({ ...addressForm, pinCode: e.target.value })} className="border border-gray-600 bg-gray-700 text-white placeholder-gray-400 p-2.5 rounded-lg text-sm" required />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={loading} className="flex-1 py-2 bg-amber-500 text-black rounded-lg text-sm hover:bg-amber-600 transition font-semibold">
                      {loading ? "Saving..." : "Save Address"}
                    </button>
                    <button type="button" onClick={() => setShowAddressForm(false)} className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 transition">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-gray-800 border border-gray-700 p-5 rounded-xl shadow">
              <h3 className="text-lg font-semibold mb-3 text-white">Order Summary</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p className="flex justify-between"><span>Items ({qty})</span><span>₹{price}</span></p>
                <p className="flex justify-between"><span>Delivery</span><span className="text-amber-400">Free</span></p>
                <hr className="my-2 border-gray-600" />
                <p className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-amber-400">₹{price}</span></p>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={
                  !userAddress?.length ||
                  loading ||
                  (paymentMode === "upi" && (!transactionId.trim() || !paymentScreenshot))
                }
                className={`w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition ${
                  !userAddress?.length ||
                  loading ||
                  (paymentMode === "upi" && (!transactionId.trim() || !paymentScreenshot))
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-amber-500 text-black hover:bg-amber-600"
                }`}
              >
                {paymentMode === "cod" ? <Banknote size={18} /> : <CreditCard size={18} />}
                {loading ? "Placing Order..." : paymentMode === "cod" ? "Place Order (COD)" : "Place Order"}
              </button>

              <button
                onClick={() => clearCart()}
                className="w-full mt-3 border border-red-500/30 text-red-400 py-2 rounded-lg hover:bg-red-500/10 transition text-sm"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;
