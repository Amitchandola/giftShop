import React, { useEffect, useState, useContext } from "react";
import AppContext from "../../context/AppContext";
import { Link, useParams } from "react-router-dom";
import { Plus, Minus, Trash2, Heart } from "lucide-react";

function RelatedProduct({ category }) {
  const { products, addToCart, cart, decreaseQty, removeFromCart, toggleWishlist, isWishlisted } = useContext(AppContext);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { id } = useParams();

  const getCartQty = (productId) => {
    const item = cart.find(
      (i) => (i.productId || i._id) === productId,
    );
    return item ? item.qty : 0;
  };

  useEffect(() => {
    setRelatedProducts(
      products.filter(
        (data) =>
          data.category?.toLowerCase() === category?.toLowerCase() &&
          data._id !== id, // current product hide
      ),
    );
  }, [category, products, id]);

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-950 py-10 px-6">
      {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 border-l-4 border-amber-500 pl-3">
        Related Products
      </h1>

      {/* Grid */}
      {relatedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {relatedProducts.map((product) => (
            <div
              key={product._id}
              className="bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-2 transition duration-300 overflow-hidden group border border-amber-500/10"
            >
              {/* Image */}
              <div className="relative p-4 bg-gray-700/50 flex justify-center items-center">
                <Link to={`/product/${product.slug || product._id}`}>
                  <img
                    src={
                      (() => {
                        const img = product.images?.[0] || product.imageSrc || "";
                        return img.startsWith("http") || img.startsWith("data:")
                          ? img
                          : `${import.meta.env.VITE_API_URL}/uploads/${img}`;
                      })()
                    }
                    alt={product.title}
                    className="h-36 object-contain rounded-lg transform group-hover:scale-105 transition duration-500"
                  />
                </Link>

                {/* OUT OF STOCK LABEL */}
                {product.qty === 0 && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    Out of Stock
                  </div>
                )}

                {/* Low Stock Badge */}
                {product.qty > 0 && product.qty <= 5 && (
                  <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse">
                    🔥 Hurry! Only {product.qty} left
                  </div>
                )}

                {/* Wishlist Heart */}
                <button
                  onClick={() => toggleWishlist(product._id)}
                  className="absolute top-3 right-3 p-1.5 bg-white rounded-full shadow-md hover:scale-110 transition z-10"
                >
                  <Heart
                    size={18}
                    className={isWishlisted(product._id) ? "fill-red-500 text-red-500" : "text-gray-400"}
                  />
                </button>

                {/* Overlay Button */}
                <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <Link
                    to={`/product/${product.slug || product._id}`}
                    className="bg-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-gray-200"
                  >
                    View
                  </Link>
                </div>
              </div>

              {/* Content */}
              <div className="px-4 pb-4">
                <h2 className="text-md font-semibold text-white truncate">
                  {product.title}
                </h2>

                <p className="text-lg font-bold text-amber-400 mt-1">
                  ₹{product.price}
                </p>

                {/* Add to Cart / Qty Controls */}
                {product.qty === 0 ? (
                  <button
                    disabled
                    className="mt-3 w-full py-2 rounded-lg bg-gray-300 text-gray-500 cursor-not-allowed"
                  >
                    Out of Stock
                  </button>
                ) : getCartQty(product._id) > 0 ? (
                  <div className="mt-3 flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                    <button
                      onClick={() => {
                        if (getCartQty(product._id) === 1) {
                          removeFromCart(product._id);
                        } else {
                          decreaseQty(product._id, getCartQty(product._id));
                        }
                      }}
                      className="p-1.5 bg-gray-700 rounded-lg shadow hover:bg-gray-600 transition"
                    >
                      {getCartQty(product._id) === 1 ? <Trash2 size={16} className="text-red-500" /> : <Minus size={16} className="text-white" />}
                    </button>
                    <span className="font-semibold text-lg text-white">{getCartQty(product._id)}</span>
                    <button
                      disabled={getCartQty(product._id) >= product.qty}
                      onClick={() =>
                        addToCart(
                          product._id,
                          product.title,
                          product.price,
                          product.images?.[0] || product.imageSrc || "",
                        )
                      }
                      className={`p-1.5 rounded-lg shadow transition ${
                        getCartQty(product._id) >= product.qty
                          ? "bg-gray-600 cursor-not-allowed"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    >
                      <Plus size={16} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    className="mt-3 w-full py-2 rounded-lg transition bg-amber-500 text-black hover:bg-amber-600 font-semibold"
                    onClick={() =>
                      addToCart(
                        product._id,
                        product.title,
                        product.price,
                        product.images?.[0] || product.imageSrc || "",
                      )
                    }
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-6">
          No related products found
        </p>
      )}
    </div>
  );
}

export default RelatedProduct;
