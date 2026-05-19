import React, { useContext } from "react";
import AppContext from "../context/AppContext";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, Gift, Sparkles, ArrowRight } from "lucide-react";

function Wishlist() {
  const { products, wishlist, toggleWishlist, addToCart, cart, isAuthenticated } =
    useContext(AppContext);

  const wishlistedProducts = products.filter((p) => wishlist.includes(p._id));

  // Pick up to 6 random suggested products (not already in wishlist)
  const suggestions = products
    .filter((p) => !wishlist.includes(p._id) && p.qty > 0)
    .sort(() => 0.5 - Math.random())
    .slice(0, 6);

  const getCartQty = (productId) => {
    const item = cart.find((i) => (i.productId || i._id) === productId);
    return item ? item.qty : 0;
  };

  const getImgSrc = (product) => {
    const img = product.images?.[0] || product.imageSrc || "";
    return img.startsWith("http") || img.startsWith("data:")
      ? img
      : `${import.meta.env.VITE_API_URL}/uploads/${img}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Heart size={24} className="text-amber-400" /> My Wishlist
          {wishlistedProducts.length > 0 && (
            <span className="text-sm font-normal text-gray-400">
              ({wishlistedProducts.length} item
              {wishlistedProducts.length > 1 ? "s" : ""})
            </span>
          )}
        </h1>

        {wishlistedProducts.length === 0 ? (
          <div>
            {/* Empty state */}
            <div className="text-center py-12 bg-gray-800 rounded-2xl shadow-sm border border-amber-500/10">
              <div className="relative inline-block mb-6">
                <Heart size={72} className="text-gray-600" />
                <Sparkles size={24} className="absolute -top-1 -right-1 text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-gray-400 mb-1 max-w-md mx-auto">
                {isAuthenticated
                  ? "Tap the ❤️ on any product to save it here for later!"
                  : "Sign in to save your wishlist across devices, or start browsing as a guest!"}
              </p>
              {!isAuthenticated && (
                <p className="text-sm text-amber-500/70 mb-4">
                  Guest wishlists are saved in your browser only.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {wishlistedProducts.map((product) => {
              const imgSrc = getImgSrc(product);
              const img = product.images?.[0] || product.imageSrc || "";

              return (
                <div
                  key={product._id}
                  className="bg-gray-800 rounded-2xl shadow-md overflow-hidden group hover:shadow-xl hover:shadow-amber-500/5 transition border border-amber-500/10"
                >
                  {/* Image */}
                  <div className="relative p-4 bg-gray-700/30 flex justify-center items-center">
                    <Link to={`/product/${product.slug || product._id}`}>
                      <img
                        src={imgSrc}
                        alt={product.title}
                        className={`h-36 object-contain rounded-lg group-hover:scale-105 transition duration-500 ${
                          product.qty === 0 ? "opacity-50" : ""
                        }`}
                      />
                    </Link>

                    {/* Remove from wishlist */}
                    <button
                      onClick={() => toggleWishlist(product._id)}
                      className="absolute top-3 right-3 p-1.5 bg-white rounded-full shadow-md hover:scale-110 transition"
                      title="Remove from wishlist"
                    >
                      <Heart
                        size={18}
                        className="fill-red-500 text-red-500"
                      />
                    </button>

                    {product.qty === 0 && (
                      <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        Out of Stock
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="px-4 pb-4">
                    <Link to={`/product/${product.slug || product._id}`}>
                      <h2 className="text-md font-semibold text-white truncate hover:text-amber-400 transition">
                        {product.title}
                      </h2>
                    </Link>

                    <p className="text-lg font-bold text-amber-400 mt-1">
                      ₹{product.price}
                    </p>

                    <div className="flex gap-2 mt-3">
                      {product.qty > 0 ? (
                        getCartQty(product._id) > 0 ? (
                          <Link
                            to="/cart"
                            className="flex-1 bg-amber-600 text-black py-2 rounded-lg text-center hover:bg-amber-700 transition font-semibold text-sm"
                          >
                            Go to Cart
                          </Link>
                        ) : (
                          <button
                            onClick={() =>
                              addToCart(
                                product._id,
                                product.title,
                                product.price,
                                img,
                              )
                            }
                            className="flex-1 flex items-center justify-center gap-1 bg-amber-500 text-black py-2 rounded-lg hover:bg-amber-600 transition font-semibold text-sm"
                          >
                            <ShoppingCart size={16} /> Add to Cart
                          </button>
                        )
                      ) : (
                        <button
                          disabled
                          className="flex-1 bg-gray-400 text-white py-2 rounded-lg cursor-not-allowed font-semibold text-sm"
                        >
                          Out of Stock
                        </button>
                      )}

                      <button
                        onClick={() => toggleWishlist(product._id)}
                        className="px-3 py-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition"
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
