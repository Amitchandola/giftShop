import React, { useContext, useEffect, useState } from "react";
import AppContext from "../../context/AppContext";
import { Package, Clock, Sparkles, Gift, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function MyOrders() {
  const { getMyOrders, cancelOrder, products } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await getMyOrders();
    if (res?.success) {
      setOrders(res.orders);
    }
  };

  const statusColor = {
    Placed: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    Packed: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    Shipped: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    Delivered: "bg-green-500/20 text-green-400 border border-green-500/30",
    Cancelled: "bg-red-500/20 text-red-400 border border-red-500/30",
  };

  const filters = ["All", "Placed", "Packed", "Shipped", "Delivered", "Cancelled"];
  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter((o) => o.orderStatus === filter);

  const getImgSrc = (item) => {
    const img = item.imageSrc || "";
    return img.startsWith("http") || img.startsWith("data:")
      ? img
      : `${import.meta.env.VITE_API_URL}/uploads/${img}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Package size={24} className="text-amber-400" /> My Orders
          {orders.length > 0 && (
            <span className="text-sm font-normal text-gray-400">
              ({orders.length} order{orders.length > 1 ? "s" : ""})
            </span>
          )}
        </h1>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                filter === f
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 border border-amber-500/10"
              }`}
            >
              {f}
              {f !== "All" && (
                <span className="ml-1 text-xs">
                  ({orders.filter((o) => o.orderStatus === f).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div>
            {/* Empty state */}
            <div className="text-center py-12 bg-gray-800 rounded-2xl shadow-sm border border-amber-500/10">
              <div className="relative inline-block mb-6">
                <Package size={72} className="text-gray-600" />
                <Sparkles size={24} className="absolute -top-1 -right-1 text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                No orders found
              </h2>
              <p className="text-gray-400 mb-1 max-w-md mx-auto">
                {filter === "All"
                  ? "You haven't placed any orders yet. Start shopping!"
                  : `No orders with status "${filter}"`}
              </p>
              <div className="flex flex-wrap gap-3 justify-center mt-5">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 bg-amber-500 text-black px-6 py-2.5 rounded-full hover:bg-amber-600 transition font-semibold shadow-md"
                >
                  <Gift size={18} /> Browse Products
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-gray-800 rounded-2xl shadow-md overflow-hidden group hover:shadow-xl hover:shadow-amber-500/5 transition border border-amber-500/10 flex flex-col"
              >
                {/* Order Items Preview (image area) */}
                <div className="relative p-4 bg-gray-700/30 flex items-center justify-center gap-2 min-h-[140px]">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <img
                      key={idx}
                      src={
                        item.imageSrc
                          ? getImgSrc(item)
                          : "https://placehold.co/80x80?text=No+Img"
                      }
                      alt={item.title}
                      className="h-20 w-20 object-contain rounded-lg bg-gray-800/50 p-1"
                    />
                  ))}
                  {order.items.length > 3 && (
                    <div className="h-20 w-20 rounded-lg bg-gray-800/80 flex items-center justify-center text-amber-400 font-bold text-sm">
                      +{order.items.length - 3} more
                    </div>
                  )}

                  {/* Status Badge */}
                  <span
                    className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full ${statusColor[order.orderStatus] || "bg-gray-700 text-gray-300"}`}
                  >
                    {order.orderStatus}
                  </span>
                </div>

                {/* Content */}
                <div className="px-4 pb-4 flex flex-col flex-1">
                  <p className="text-xs text-gray-400 mt-3">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>

                  {/* Items list */}
                  <div className="mt-2 space-y-1 flex-1">
                    {order.items.slice(0, 2).map((item, idx) => (
                      <p key={idx} className="text-sm text-white truncate">
                        {item.title} <span className="text-gray-400">×{item.qty}</span>
                      </p>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-xs text-gray-500">
                        +{order.items.length - 2} more item{order.items.length - 2 > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>

                  {/* Price & Payment */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                    <div>
                      <p className="text-lg font-bold text-amber-400">₹{order.totalAmount}</p>
                      <p className="text-xs text-gray-500">
                        Payment:{" "}
                        <span className={order.paymentStatus === "Paid" ? "text-green-400" : "text-orange-400"}>
                          {order.paymentStatus}
                        </span>
                      </p>
                    </div>

                    {order.orderStatus === "Placed" && (
                        <button
                          onClick={async () => {
                            const confirmCancel = window.confirm("Cancel this order?");
                            if (!confirmCancel) return;
                            const res = await cancelOrder(order._id);
                            if (res?.success) {
                              fetchOrders();
                            }
                          }}
                          className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium rounded-lg hover:bg-red-500/20 transition"
                        >
                          Cancel
                        </button>
                      )}
                  </div>

                  {/* Tracking ID */}
                  {order.trackingId && (
                    <div className="mt-2 px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <p className="text-xs text-purple-300">
                        Tracking ID: <span className="font-mono font-semibold text-purple-200">{order.trackingId}</span>
                      </p>
                    </div>
                  )}

                  {/* Status Timeline */}
                  {order.statusHistory && order.statusHistory.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-xs font-semibold text-gray-400 mb-2">Status Timeline</p>
                      <div className="space-y-1">
                        {order.statusHistory.map((entry, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <span className={`w-2 h-2 rounded-full ${statusColor[entry.status]?.includes("green") ? "bg-green-400" : statusColor[entry.status]?.includes("blue") ? "bg-blue-400" : statusColor[entry.status]?.includes("yellow") ? "bg-yellow-400" : statusColor[entry.status]?.includes("purple") ? "bg-purple-400" : "bg-red-400"}`}></span>
                            <span className="text-gray-300">{entry.status}</span>
                            <span className="text-gray-500 ml-auto">
                              {new Date(entry.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" })},{" "}
                              {new Date(entry.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;
