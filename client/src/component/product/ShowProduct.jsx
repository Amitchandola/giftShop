import React from "react";
import AppContext from "../../context/AppContext";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Minus, Trash2, Heart } from "lucide-react";

function ShowProduct() {
  const { products, filteredData, addToCart, cart, decreaseQty, removeFromCart, toggleWishlist, isWishlisted } =
    React.useContext(AppContext);
  const navigate = useNavigate();

  const getCartQty = (productId) => {
    const item = cart.find(
      (i) => (i.productId || i._id) === productId,
    );
    return item ? item.qty : 0;
  };

  // Buy Now Function
  const handleBuyNow = async (product) => {
    await addToCart(
      product._id,
      product.title,
      product.price,
      product.images?.[0] || product.imageSrc || "",
    );

    // Directly go to cart page
    navigate("/cart");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      {/* Product Grid */}
      <div className="p-4 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {(filteredData?.length ? filteredData : products)?.map((product) => (
          <div
            key={product._id}
            className="bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl hover:shadow-amber-500/10 transition duration-300 overflow-hidden group border border-amber-500/10"
          >
            {/* Image Container */}
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
                  className={`h-36 object-contain rounded-lg transform group-hover:scale-105 transition duration-500 ${
                    product.qty === 0 ? "opacity-50" : ""
                  }`}
                />
              </Link>

              {/* Out of Stock Badge */}
              {product.qty === 0 && (
                <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
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
                  className="mt-3 w-full py-2 rounded-lg bg-gray-400 text-white cursor-not-allowed font-semibold"
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
                  className="mt-3 w-full py-2 rounded-lg transition font-semibold bg-amber-500 text-black hover:bg-amber-600"
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

              {/* Buy Now / Go to Cart Button */}
              {product.qty > 0 && (
                getCartQty(product._id) > 0 ? (
                  <button
                    className="mt-2 w-full bg-amber-600 text-black py-2 rounded-lg hover:bg-amber-700 transition font-semibold"
                    onClick={() => navigate("/cart")}
                  >
                    Go to Cart
                  </button>
                ) : (
                  <button
                    className="mt-2 w-full bg-amber-600 text-black py-2 rounded-lg hover:bg-amber-700 transition font-semibold"
                    onClick={() => handleBuyNow(product)}
                  >
                    Buy Now
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

export default ShowProduct;
// import React from "react";
// import AppContext from "../../context/AppContext";
// import { Link } from "react-router-dom";

// function ShowProduct() {
//   const { products, filteredData, addToCart } = React.useContext(AppContext);

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       {/* Grid Layout */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//         {(filteredData?.length ? filteredData : products)?.map((product) => (
//           <div
//             key={product._id}
//             className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition duration-300 overflow-hidden group"
//           >
//             {/* Image Container */}
//             <div className="relative p-4 bg-gray-50 flex justify-center items-center">
//               <Link to={`/product/${product._id}`}>
//                 <img
//                   src={
//                     product.imageSrc?.startsWith("http")
//                       ? product.imageSrc
//                       : `http://localhost:1000/uploads/${product.imageSrc}`
//                   }
//                   alt={product.title}
//                   className={`h-36 object-contain rounded-lg transform group-hover:scale-105 transition duration-500 ${
//                     product.qty === 0 ? "opacity-50" : ""
//                   }`}
//                 />
//               </Link>

//               {/* Out of Stock Badge */}
//               {product.qty === 0 && (
//                 <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
//                   Out of Stock
//                 </div>
//               )}

//               {/* Low Stock Badge */}
//               {product.qty > 0 && product.qty <= 5 && (
//                 <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
//                   Only {product.qty} Left Hurry Up!
//                 </div>
//               )}
//             </div>

//             {/* Content */}
//             <div className="px-4 pb-4">
//               <h2 className="text-md font-semibold text-gray-800 truncate">
//                 {product.title}
//               </h2>

//               <p className="text-lg font-bold text-green-600 mt-1">
//                 ₹{product.price}
//               </p>

//               {/* Button */}
//               <button
//                 disabled={product.qty === 0}
//                 className={`mt-3 w-full py-2 rounded-lg transition font-semibold ${
//                   product.qty === 0
//                     ? "bg-gray-400 text-white cursor-not-allowed"
//                     : "bg-blue-500 text-white hover:bg-blue-600"
//                 }`}
//                 onClick={() =>
//                   addToCart(
//                     product._id,
//                     product.title,
//                     product.price,
//                     product.imageSrc,
//                   )
//                 }
//               >
//                 {product.qty === 0 ? "Out of Stock" : "Add to Cart"}
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default ShowProduct;

// import React from "react";
// import AppContext from "../../context/AppContext";
// import { Link } from "react-router-dom";

// function ShowProduct() {
//   const { products, filteredData, addToCart } = React.useContext(AppContext);

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       {/* Grid Layout */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//         {(filteredData?.length ? filteredData : products)?.map((product) => (
//           <div
//             key={product._id}
//             className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition duration-300 overflow-hidden group"
//           >
//             {/* Image Container */}
//             <div className="p-4 bg-gray-50 flex justify-center items-center">
//               <Link to={`/product/${product._id}`}>
//                 <img
//                   src={
//                     product.imageSrc?.startsWith("http")
//                       ? product.imageSrc
//                       : `http://localhost:1000/uploads/${product.imageSrc}`
//                   }
//                   alt={product.title}
//                   className="h-36 object-contain rounded-lg transform group-hover:scale-105 transition duration-500"
//                 />
//               </Link>
//             </div>

//             {/* Content */}
//             <div className="px-4 pb-4">
//               <h2 className="text-md font-semibold text-gray-800 truncate">
//                 {product.title}
//               </h2>

//               <p className="text-lg font-bold text-green-600 mt-1">
//                 ₹{product.price}
//               </p>

//               {/* Button */}
//               <button
//                 className="mt-3 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
//                 onClick={() =>
//                   addToCart(
//                     product._id,
//                     product.title,
//                     product.price,
//                     product.imageSrc,
//                   )
//                 }
//               >
//                 Add to Cart
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default ShowProduct;
