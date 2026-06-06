import React, { useEffect, useState, useContext } from "react";
import AppContext from "../context/AppContext";
import { Trash2, Plus, Minus, ShoppingCart, Sparkles, ArrowRight, Gift } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

function Cart() {
  const { cart, decreaseQty, removeFromCart, clearCart, addToCart, isAuthenticated, products } =
    useContext(AppContext);

  const [qty, setQty] = useState(0);
  const [price, setPrice] = useState(0);

  const navigate = useNavigate();

  // IDs of products already in cart
  const cartProductIds = cart?.map((item) => item.productId) || [];

  // Pick up to 6 random suggested products not in cart
  const suggestions = products
    .filter((p) => !cartProductIds.includes(p._id) && p.qty > 0)
    .sort(() => 0.5 - Math.random())
    .slice(0, 6);

  const getImgSrc = (product) => {
    const img = product.images?.[0] || product.imageSrc || "";
    return img.startsWith("http") || img.startsWith("data:")
      ? img
      : `${import.meta.env.VITE_API_URL}/uploads/${img}`;
  };

  // ✅ Calculate total qty & price
  useEffect(() => {
    let totalQty = 0;
    let totalPrice = 0;

    if (cart?.length) {
      cart.forEach((item) => {
        totalQty += item.qty;
        totalPrice += item.price * item.qty;
      });
    }

    setQty(totalQty);
    setPrice(totalPrice);
  }, [cart]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <ShoppingCart size={24} className="text-amber-400" /> My Cart
          {cart?.length > 0 && (
            <span className="text-sm font-normal text-gray-400">
              ({qty} item{qty > 1 ? "s" : ""})
            </span>
          )}
        </h1>

        {cart?.length === 0 ? (
          <div>
            {/* Empty state */}
            <div className="text-center py-12 bg-gray-800 rounded-2xl shadow-sm border border-amber-500/10">
              <div className="relative inline-block mb-6">
                <ShoppingCart size={72} className="text-gray-600" />
                <Sparkles size={24} className="absolute -top-1 -right-1 text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Your cart is empty
              </h2>
              <p className="text-gray-400 mb-1 max-w-md mx-auto">
                {isAuthenticated
                  ? "Add products to your cart and they'll show up here!"
                  : "Sign in to sync your cart across devices, or start shopping as a guest!"}
              </p>
              {!isAuthenticated && (
                <p className="text-sm text-amber-500/70 mb-4">
                  Guest carts are saved in your browser only.
                </p>
              )}
              <div className="flex flex-wrap gap-3 justify-center mt-5">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 bg-amber-500 text-black px-6 py-2.5 rounded-full hover:bg-amber-600 transition font-semibold shadow-md"
                >
                  <Gift size={18} /> Browse Products
                </Link>
                {!isAuthenticated && (
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 border-2 border-amber-500 text-amber-400 px-6 py-2.5 rounded-full hover:bg-amber-500/10 transition font-semibold"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>

            {/* Suggested products */}
            {suggestions.length > 0 && (
              <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles size={20} className="text-amber-500" />
                    You might like these
                  </h2>
                  <Link
                    to="/"
                    className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
                  >
                    View all <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {suggestions.map((product) => (
                    <Link
                      key={product._id}
                      to={`/product/${product.slug || product._id}`}
                      className="bg-gray-800 rounded-xl shadow-sm border border-amber-500/10 overflow-hidden group hover:shadow-lg hover:shadow-amber-500/5 transition"
                    >
                      <div className="p-3 bg-gray-700/50 flex justify-center">
                        <img
                          src={getImgSrc(product)}
                          alt={product.title}
                          className="h-24 object-contain group-hover:scale-105 transition duration-300"
                        />
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-semibold text-white truncate">
                          {product.title}
                        </p>
                        <p className="text-sm font-bold text-amber-400 mt-0.5">
                          ₹{product.price}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Cart Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {cart.map((product) => (
                <div
                  key={product.productId}
                  className="bg-gray-800 rounded-2xl shadow-md overflow-hidden group hover:shadow-xl hover:shadow-amber-500/5 transition border border-amber-500/10"
                >
                  {/* Image */}
                  <div className="relative p-4 bg-gray-700/30 flex justify-center items-center">
                    <img
                      src={
                        product.imageSrc
                          ? (product.imageSrc.startsWith("http") || product.imageSrc.startsWith("data:")
                              ? product.imageSrc
                              : `${import.meta.env.VITE_API_URL}/uploads/${product.imageSrc}`)
                          : "https://placehold.co/150x150?text=No+Image"
                      }
                      alt={product.title}
                      className="h-36 object-contain rounded-lg group-hover:scale-105 transition duration-500"
                    />

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCart(product.productId)}
                      className="absolute top-3 right-3 p-1.5 bg-white rounded-full shadow-md hover:scale-110 transition"
                      title="Remove from cart"
                    >
                      <Trash2 size={18} className="text-red-500" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="px-4 pb-4">
                    <h2 className="text-md font-semibold text-white truncate mt-3">
                      {product.title}
                    </h2>

                    <p className="text-lg font-bold text-amber-400 mt-1">
                      ₹{product.price}
                    </p>

                    {/* Qty Controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-600 rounded-lg overflow-hidden">
                        <button
                          onClick={() => decreaseQty(product.productId, 1)}
                          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white transition"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-4 font-medium text-white text-sm">{product.qty}</span>
                        <button
                          onClick={() =>
                            addToCart(
                              product.productId,
                              product.title,
                              product.price,
                              product.imageSrc,
                            )
                          }
                          disabled={product.qty >= product.stockQty}
                          className={`px-3 py-1.5 transition ${
                            product.qty >= product.stockQty
                              ? "bg-gray-600 cursor-not-allowed text-gray-400"
                              : "bg-gray-700 hover:bg-gray-600 text-white"
                          }`}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <span className="text-sm font-semibold text-amber-400">
                        ₹{product.price * product.qty}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary & Actions */}
            <div className="mt-8 bg-gray-800 border border-amber-500/10 p-5 rounded-2xl shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Order Summary</h2>
                <h2 className="text-2xl font-bold text-amber-400">₹{price}</h2>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={() => navigate("/checkout")}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl 
                  bg-amber-500 text-black 
                  font-semibold text-sm shadow-md hover:shadow-lg hover:bg-amber-600 
                  transition-all duration-300 active:scale-95"
                >
                  <ShoppingCart size={16} />
                  Checkout
                </button>

                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to clear the cart?")) {
                      clearCart();
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl 
                  border border-red-500/30 bg-red-500/10 text-red-400 font-medium text-sm 
                  hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300 active:scale-95"
                >
                  <Trash2 size={16} />
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Suggested Products */}
            {suggestions.length > 0 && (
              <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles size={20} className="text-amber-500" />
                    You might also like
                  </h2>
                  <Link
                    to="/"
                    className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
                  >
                    View all <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {suggestions.map((product) => (
                    <Link
                      key={product._id}
                      to={`/product/${product.slug || product._id}`}
                      className="bg-gray-800 rounded-xl shadow-sm border border-amber-500/10 overflow-hidden group hover:shadow-lg hover:shadow-amber-500/5 transition"
                    >
                      <div className="p-3 bg-gray-700/50 flex justify-center">
                        <img
                          src={getImgSrc(product)}
                          alt={product.title}
                          className="h-24 object-contain group-hover:scale-105 transition duration-300"
                        />
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-semibold text-white truncate">
                          {product.title}
                        </p>
                        <p className="text-sm font-bold text-amber-400 mt-0.5">
                          ₹{product.price}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;
