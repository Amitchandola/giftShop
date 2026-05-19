import React, { useContext, useEffect, useState } from "react";
import AppContext from "../../context/AppContext";
import { User, Package, Clock, ChevronDown, ChevronUp, MapPin, Trash2, Plus, Pencil, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

function Profile() {
  const {
    user,
    getMyOrders,
    userAddress,
    getAddress,
    deleteAddress,
    shippingAddress,
    updateName,
    loading,
  } = useContext(AppContext);

  const [recentOrders, setRecentOrders] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const res = await getMyOrders();
      if (res?.success) {
        setRecentOrders(res.orders.slice(0, 5));
      }
      getAddress?.();
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (user?.name) setNameInput(user.name);
  }, [user]);

  const handleNameSave = async () => {
    if (!nameInput.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    if (nameInput.trim() === user?.name) {
      setEditingName(false);
      return;
    }
    const res = await updateName(nameInput.trim());
    if (res?.success) setEditingName(false);
  };

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

  const statusColor = {
    Placed: "bg-blue-500/20 text-blue-400",
    Packed: "bg-yellow-500/20 text-yellow-400",
    Shipped: "bg-purple-500/20 text-purple-400",
    Delivered: "bg-green-500/20 text-green-400",
    Cancelled: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ─── Profile Card ─── */}
        <div className="bg-gray-800 shadow-xl rounded-2xl p-6 border border-amber-500/10">
          <div className="flex items-center gap-5">
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-4 rounded-full shadow-lg shadow-amber-500/20 flex-shrink-0">
              <User size={36} className="text-black" />
            </div>
            <div className="flex-1 min-w-0">
              {/* Editable Name */}
              <div className="flex items-center gap-2">
                {editingName ? (
                  <div className="flex items-center gap-2 flex-1 flex-wrap">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
                      className="px-3 py-1.5 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-amber-400/50 outline-none text-base sm:text-lg font-semibold flex-1 min-w-[120px]"
                      autoFocus
                    />
                    <button onClick={handleNameSave} className="p-1.5 text-green-400 hover:bg-green-500/10 rounded-lg transition">
                      <Check size={18} />
                    </button>
                    <button onClick={() => { setEditingName(false); setNameInput(user?.name || ""); }} className="p-1.5 text-gray-400 hover:bg-gray-700 rounded-lg transition">
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-white truncate">
                      {user?.name || "Guest User"}
                    </h2>
                    <button
                      onClick={() => setEditingName(true)}
                      className="p-1.5 text-amber-400 hover:bg-amber-500/10 rounded-lg transition"
                      title="Edit name"
                    >
                      <Pencil size={14} />
                    </button>
                  </>
                )}
              </div>
              <p className="text-gray-400 text-sm mt-0.5">{user?.email || "No email available"}</p>
              <p className="text-gray-500 text-xs mt-1">
                Member since{" "}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Order History ─── */}
        <div className="bg-gray-800 shadow-xl rounded-2xl p-6 border border-amber-500/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Package size={20} className="text-amber-400" /> Order History
            </h3>
            <Link
              to="/my-orders"
              className="text-amber-400 hover:text-amber-300 text-sm font-medium transition"
            >
              View All →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Clock size={40} className="mx-auto mb-3 text-gray-600" />
              <p>No orders yet. Start shopping!</p>
              <Link
                to="/"
                className="mt-3 inline-block text-amber-400 hover:text-amber-300 transition"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="border border-gray-700 rounded-xl overflow-hidden"
                >
                  {/* Order Header */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-700/50 transition"
                    onClick={() =>
                      setExpanded(expanded === order._id ? null : order._id)
                    }
                  >
                    <div>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="font-semibold text-white">
                        {order.items.length} item{order.items.length > 1 ? "s" : ""} · ₹{order.totalAmount}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor[order.orderStatus] || "bg-gray-700 text-gray-400"}`}>
                        {order.orderStatus}
                      </span>
                      {expanded === order._id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expanded === order._id && (
                    <div className="border-t border-gray-700 px-4 pb-4 pt-3 bg-gray-800/50 space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                item.imageSrc
                                  ? item.imageSrc.startsWith("http") || item.imageSrc.startsWith("data:")
                                    ? item.imageSrc
                                    : `${import.meta.env.VITE_API_URL}/uploads/${item.imageSrc}`
                                  : "https://placehold.co/40x40?text=No+Img"
                              }
                              alt={item.title}
                              className="w-10 h-10 object-contain rounded"
                            />
                            <span className="text-gray-300">{item.title}</span>
                          </div>
                          <span className="text-gray-500">₹{item.price} × {item.qty}</span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 border-t border-gray-700 text-sm">
                        <span className="text-gray-500">Payment ({order.paymentMethod || "UPI"})</span>
                        <span className={`font-medium ${order.paymentStatus === "Paid" ? "text-green-400" : "text-orange-400"}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Saved Addresses ─── */}
        <div className="bg-gray-800 shadow-xl rounded-2xl p-6 border border-amber-500/10">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <MapPin size={20} className="text-amber-400" /> Saved Addresses
          </h3>

          {userAddress?.length > 0 ? (
            <div className="space-y-3 mb-4">
              {userAddress.map((addr) => (
                <div
                  key={addr._id}
                  className="p-4 rounded-xl border border-gray-700 bg-gray-700/30 flex items-start justify-between gap-3"
                >
                  <div className="text-sm space-y-0.5">
                    <p className="font-semibold text-white">{addr.fullName}</p>
                    <p className="text-gray-400">{addr.address}</p>
                    <p className="text-gray-400">{addr.city}, {addr.state} - {addr.pinCode}</p>
                    <p className="text-gray-500">{addr.country} · {addr.phoneNumber}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm("Delete this address?")) {
                        deleteAddress(addr._id);
                      }
                    }}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition flex-shrink-0"
                    title="Delete address"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm mb-4">No saved addresses yet.</p>
          )}

          {/* Add New Address */}
          {!showAddressForm ? (
            <button
              onClick={() => setShowAddressForm(true)}
              className="w-full py-2.5 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 hover:border-amber-500/50 hover:text-amber-400 transition text-sm flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add New Address
            </button>
          ) : (
            <form onSubmit={handleAddAddress} className="border-t border-gray-700 pt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" placeholder="Full Name" value={addressForm.fullName} onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })} className="w-full border border-gray-600 bg-gray-700 text-white placeholder-gray-400 p-2.5 rounded-lg text-sm" required />
                <input type="tel" placeholder="Phone (10 digits)" value={addressForm.phoneNumber} onChange={(e) => { const val = e.target.value.replace(/\D/g, "").slice(0, 10); setAddressForm({ ...addressForm, phoneNumber: val }); }} maxLength={10} className="w-full border border-gray-600 bg-gray-700 text-white placeholder-gray-400 p-2.5 rounded-lg text-sm" required />
              </div>
              <textarea placeholder="Full Address" value={addressForm.address} onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })} className="w-full border border-gray-600 bg-gray-700 text-white placeholder-gray-400 p-2.5 rounded-lg text-sm" rows={2} required />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="City" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} className="border border-gray-600 bg-gray-700 text-white placeholder-gray-400 p-2.5 rounded-lg text-sm" required />
                <input type="text" placeholder="State" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} className="border border-gray-600 bg-gray-700 text-white placeholder-gray-400 p-2.5 rounded-lg text-sm" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Country" value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} className="border border-gray-600 bg-gray-700 text-white placeholder-gray-400 p-2.5 rounded-lg text-sm" required />
                <input type="text" placeholder="Pincode" value={addressForm.pinCode} onChange={(e) => setAddressForm({ ...addressForm, pinCode: e.target.value })} className="border border-gray-600 bg-gray-700 text-white placeholder-gray-400 p-2.5 rounded-lg text-sm" required />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-amber-500 text-black rounded-lg text-sm hover:bg-amber-600 transition font-semibold">
                  {loading ? "Saving..." : "Save Address"}
                </button>
                <button type="button" onClick={() => setShowAddressForm(false)} className="px-5 py-2.5 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 transition">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
