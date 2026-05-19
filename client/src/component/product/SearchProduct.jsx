import React, { useEffect, useState, useContext } from "react";
import AppContext from "../../context/AppContext";
import { Link, useParams } from "react-router-dom";
import { Heart } from "lucide-react";

function SearchProduct({ category }) {
  const { products, toggleWishlist, isWishlisted } = useContext(AppContext);
  const [searchProducts, setSearchProducts] = useState([]);
  const { term } = useParams();
  useEffect(() => {
    setSearchProducts(
      products.filter((data) =>
        data.title?.toLowerCase().includes(term?.toLowerCase()),
      ),
    );
  }, [term, products]);

  return (
    <div className="bg-gradient-to-b from-gray-950 to-gray-900 py-10 px-6">
      {/* Grid */}
      {searchProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {searchProducts.map((product) => (
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

                {/* Button */}
                <button className="mt-3 w-full bg-amber-500 text-black py-2 rounded-lg hover:bg-amber-600 transition font-semibold">
                  Add to Cart
                </button>
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

export default SearchProduct;

// import React, { useContext } from "react";
// import { useParams } from "react-router-dom";
// import AppContext from "../../context/AppContext";
// import { Link } from "react-router-dom";

// function SearchProduct() {
//   const { term } = useParams();
//   const { products, addToCart } = useContext(AppContext);

//   const results = products.filter((item) =>
//     item.title?.toLowerCase().includes(term.toLowerCase()),
//   );

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <h1 className="text-2xl font-bold mb-6">Search Results for: "{term}"</h1>

//       {results.length === 0 ? (
//         <p>No products found</p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//           {results.map((product) => (
//             <div key={product._id} className="bg-white p-4 rounded-xl shadow">
//               <Link to={`/product/${product._id}`}>
//                 <img
//                   src={product.imageSrc}
//                   className="h-40 object-contain mx-auto"
//                 />
//               </Link>

//               <h2 className="mt-2 font-semibold">{product.title}</h2>
//               <p className="text-green-600 font-bold">₹{product.price}</p>

//               <button
//                 onClick={() =>
//                   addToCart(
//                     product._id,
//                     product.title,
//                     product.price,
//                     product.imageSrc,
//                   )
//                 }
//                 className="mt-2 w-full bg-blue-500 text-white py-2 rounded"
//               >
//                 Add to Cart
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// export default SearchProduct;
