import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RelatedProduct from "./RelatedProduct";
import AppContext from "../../context/AppContext";
import { ChevronLeft, ChevronRight, Plus, Minus, Trash2, Heart } from "lucide-react";

const getImageUrl = (src) => {
  if (!src) return "";
  if (src.startsWith("http") || src.startsWith("data:")) return src;
  return `${import.meta.env.VITE_API_URL}/uploads/${src}`;
};

function ProductDetailPage() {
  const { slug } = useParams();
  const url = `${import.meta.env.VITE_API_URL}/api`;

  const [product, setProduct] = useState(null);
  const [showImage, setShowImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart, cart, decreaseQty, removeFromCart, toggleWishlist, isWishlisted } = React.useContext(AppContext);

  const getCartQty = (productId) => {
    const item = cart.find(
      (i) => (i.productId || i._id) === productId,
    );
    return item ? item.qty : 0;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${url}/products/${slug}`);
        const data = res.data.product || res.data.products || res.data;
        setProduct(data);
        setSelectedImage(0);
      } catch (error) {
        console.log("ERROR:", error);
      }
    };

    fetchData();
  }, [slug]);

  if (!product) {
    return (
      <h1 className="text-center mt-10 text-xl font-semibold">Loading...</h1>
    );
  }

  // Build all images array (support both new `images` array and legacy `imageSrc`)
  const allImages =
    product.images?.length > 0
      ? product.images
      : product.imageSrc
        ? [product.imageSrc]
        : [];

  const mainImage = allImages[selectedImage] || allImages[0] || "";

  const prevImage = () => {
    setSelectedImage((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1,
    );
  };

  const nextImage = () => {
    setSelectedImage((prev) =>
      prev === allImages.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 p-6">
      {/* Product Detail Section */}
      <div className="flex justify-center items-center">
        <div className="bg-gray-800 rounded-2xl shadow-lg border border-amber-500/10 max-w-5xl w-full grid md:grid-cols-2 gap-6 p-6">
          {/* Image Slider Section */}
          <div>
            <div className="relative flex justify-center items-center bg-gray-700/50 rounded-xl p-4 min-h-[280px]">
              {/* Left Arrow */}
              {allImages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-2 z-10 bg-white/80 hover:bg-white shadow-md rounded-full p-1.5 transition"
                >
                  <ChevronLeft size={22} />
                </button>
              )}

              {/* Main Image */}
              <img
                onClick={(e) => {
                  e.stopPropagation();
                  setShowImage(true);
                }}
                src={getImageUrl(mainImage)}
                alt={product.title}
                className={`h-60 object-contain rounded-lg cursor-pointer transition duration-500 ${
                  product.qty === 0 ? "opacity-50" : ""
                }`}
              />

              {/* Right Arrow */}
              {allImages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-2 z-10 bg-white/80 hover:bg-white shadow-md rounded-full p-1.5 transition"
                >
                  <ChevronRight size={22} />
                </button>
              )}

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

              {/* Slide Indicator Dots */}
              {allImages.length > 1 && (
                <div className="absolute bottom-2 flex gap-1.5">
                  {allImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(idx);
                      }}
                      className={`w-2.5 h-2.5 rounded-full transition ${
                        selectedImage === idx
                          ? "bg-amber-500 scale-110"
                          : "bg-gray-600 hover:bg-gray-500"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 mt-3 justify-center flex-wrap">
                {allImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={getImageUrl(img)}
                    alt={`${product.title} ${idx + 1}`}
                    onClick={() => setSelectedImage(idx)}
                    className={`h-16 w-16 object-contain rounded-lg cursor-pointer border-2 transition ${
                      selectedImage === idx
                        ? "border-amber-500 shadow-md"
                        : "border-gray-600 hover:border-gray-400"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-2xl font-bold text-white">
                  {product.title}
                </h1>
                <button
                  onClick={() => toggleWishlist(product._id)}
                  className="p-2 bg-gray-700 rounded-full hover:scale-110 transition shrink-0"
                >
                  <Heart
                    size={22}
                    className={isWishlisted(product._id) ? "fill-red-500 text-red-500" : "text-gray-400"}
                  />
                </button>
              </div>

              <p className="text-gray-300 mt-4 leading-relaxed">
                {product.description}
              </p>

              <p className="text-3xl font-bold text-amber-400 mt-6">
                ₹{product.price}
              </p>
            </div>

            {/* Button */}
            <div className="mt-6">
              {product.qty === 0 ? (
                <button
                  disabled
                  className="w-full py-3 rounded-lg font-semibold bg-gray-400 text-white cursor-not-allowed"
                >
                  Out of Stock
                </button>
              ) : getCartQty(product._id) > 0 ? (
                <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
                  <button
                    onClick={() => {
                      if (getCartQty(product._id) === 1) {
                        removeFromCart(product._id);
                      } else {
                        decreaseQty(product._id, getCartQty(product._id));
                      }
                    }}
                    className="p-2 bg-gray-700 rounded-lg shadow hover:bg-gray-600 transition"
                  >
                    {getCartQty(product._id) === 1 ? <Trash2 size={18} className="text-red-500" /> : <Minus size={18} className="text-white" />}
                  </button>
                  <span className="font-bold text-xl text-white">{getCartQty(product._id)} in cart</span>
                  <button
                    disabled={getCartQty(product._id) >= product.qty}
                    onClick={() =>
                      addToCart(
                        product._id,
                        product.title,
                        product.price,
                        allImages[0] || product.imageSrc,
                      )
                    }
                    className={`p-2 rounded-lg shadow transition ${
                      getCartQty(product._id) >= product.qty
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              ) : (
                <button
                  className="w-full py-3 rounded-lg font-semibold transition bg-amber-500 text-black hover:bg-amber-600"
                  onClick={() =>
                    addToCart(
                      product._id,
                      product.title,
                      product.price,
                      allImages[0] || product.imageSrc,
                    )
                  }
                >
                  Add to Cart
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal with Slider */}
      {showImage && (
        <div
          className="fixed inset-0 bg-black/85 flex justify-center items-center z-50"
          onClick={() => setShowImage(false)}
        >
          {/* Modal Left Arrow */}
          {allImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 text-white bg-white/20 hover:bg-white/40 rounded-full p-2 transition z-50"
            >
              <ChevronLeft size={30} />
            </button>
          )}

          <img
            onClick={(e) => e.stopPropagation()}
            src={getImageUrl(mainImage)}
            alt="zoom"
            className="max-h-[85%] max-w-[85%] rounded-lg shadow-2xl"
          />

          {/* Modal Right Arrow */}
          {allImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 text-white bg-white/20 hover:bg-white/40 rounded-full p-2 transition z-50"
            >
              <ChevronRight size={30} />
            </button>
          )}

          {/* Modal Counter */}
          {allImages.length > 1 && (
            <div className="absolute bottom-6 text-white text-sm bg-black/50 px-4 py-1.5 rounded-full">
              {selectedImage + 1} / {allImages.length}
            </div>
          )}
        </div>
      )}

      {/* Related Products */}
      <div className="mt-10">
        <RelatedProduct category={product?.category} />
      </div>
    </div>
  );
}

export default ProductDetailPage;
