import React, { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Search, Heart, ShoppingCart, User } from "lucide-react";
import logo from "../assets/logo.jfif";
import AppContext from "../context/AppContext";
import { FaWhatsapp } from "react-icons/fa";
import { Package, Shield } from "lucide-react";


function Navbar() {
  const { setFilteredData, products, logout, isAuthenticated, cart, wishlist, user } =
    useContext(AppContext);
  // console.log(cart);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const filterByCategory = (category) => {
    setActiveCategory(category);
    const filtered = products.filter((product) =>
      product.category.toLowerCase().includes(category.toLowerCase()),
    );

    setFilteredData(filtered);
    navigate("/");
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/product/search/${searchTerm}`);
    setSearchTerm("");
    setMenuOpen(false);
  };

  return (
    <>
      {isHomePage && (
        <div className="relative w-full">
          <img
            src="/banner.jfif"
            alt="House of Return Gift"
            className="w-full h-[calc(15rem+20px)] sm:h-[calc(18rem+20px)] md:h-[calc(20rem+20px)] lg:h-[calc(24rem+20px)] object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/90" />

          <div className="absolute top-0 left-0 right-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2 leading-tight">
                <img src={logo} alt="House of Return Gift" className="h-10 sm:h-12 w-auto object-contain rounded-lg" />
                <div className="flex flex-col">
                  <span className="text-base sm:text-lg font-bold text-amber-400 tracking-tight leading-tight">House of Return Gift .com</span>
                  <span className="text-[9px] sm:text-[10px] text-amber-500/70 tracking-widest uppercase">Gifts for every occasion</span>
                </div>
              </Link>

              <form onSubmit={submitHandler} className="hidden md:flex flex-1 max-w-lg mx-6 relative">
                <Search className="absolute left-3 top-2.5 text-amber-400/60" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-amber-500/30 bg-black/40 backdrop-blur-sm text-white placeholder-gray-400 focus:bg-black/60 focus:ring-2 focus:ring-amber-400/50 outline-none transition"
                />
              </form>

              <div className="hidden md:flex items-center gap-5 text-amber-400">
                <Link to="/cart" className="relative hover:text-amber-300 transition">
                  {cart?.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amber-500 text-black text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                      {cart.reduce((total, item) => total + item.qty, 0)}
                    </span>
                  )}
                  <ShoppingCart size={20} />
                </Link>
                <Link to="/wishlist" className="relative hover:text-amber-300 transition">
                  {wishlist?.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amber-500 text-black text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                      {wishlist.length}
                    </span>
                  )}
                  <Heart size={20} />
                </Link>
                {isAuthenticated && (
                  <>
                    <Link to="/profile" className="hover:text-amber-300 transition"><User size={20} /></Link>
                    <Link to="/my-orders" className="flex items-center gap-1.5 hover:text-amber-300 font-medium transition text-sm"><Package size={18} /> My Orders</Link>
                    {user?.isAdmin && (
                      <Link to="/admin" className="flex items-center gap-1.5 hover:text-amber-300 font-medium transition text-sm text-amber-500"><Shield size={18} /> Admin</Link>
                    )}
                    <button onClick={() => { logout(); navigate("/"); }} className="bg-amber-500 hover:bg-amber-600 text-black px-3 py-1.5 rounded-lg text-sm font-semibold transition">Log out</button>
                  </>
                )}
                {!isAuthenticated && (
                  <>
                    <Link to="/login" className="bg-amber-500 hover:bg-amber-600 text-black px-4 py-1.5 rounded-lg text-sm font-semibold transition">Log in</Link>
                    <Link to="/register" className="border border-amber-400/60 text-amber-400 hover:bg-amber-500/10 px-4 py-1.5 rounded-lg text-sm transition">Register</Link>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 md:hidden">
                {!isAuthenticated && (
                  <Link to="/login" className="bg-amber-500 hover:bg-amber-600 text-black px-3 py-1.5 rounded-lg text-xs font-semibold transition">Log in</Link>
                )}
                <button className="p-2 rounded-lg hover:bg-white/10 text-amber-400" onClick={() => setMenuOpen(!menuOpen)}>
                  {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>

            <div className={`md:hidden transition-all duration-300 overflow-hidden ${menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="px-4 pb-4 pt-2 space-y-4 bg-gray-950/95 backdrop-blur-md mx-4 rounded-xl border border-amber-500/20">
                <form onSubmit={submitHandler} className="relative">
                  <Search className="absolute left-3 top-2.5 text-amber-400/50" size={18} />
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2 rounded-full border border-amber-500/30 bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-400/50 outline-none" />
                </form>
                <div className="flex flex-col gap-3 text-amber-400">
                  <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 hover:text-amber-300"><Heart size={18} /> Wishlist</Link>
                  <Link to="/cart" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 hover:text-amber-300"><ShoppingCart size={18} /> Cart</Link>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 hover:text-amber-300"><User size={18} /> Profile</Link>
                  {isAuthenticated ? (
                    <button onClick={() => { logout(); navigate("/"); setMenuOpen(false); }} className="bg-amber-500 text-black px-3 py-2 rounded-lg text-center font-semibold">Log out</button>
                  ) : (
                    <div className="flex gap-2">
                      <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 bg-amber-500 text-black py-2 rounded-lg text-center font-semibold text-sm">Log in</Link>
                      <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 border border-amber-500 text-amber-400 py-2 rounded-lg text-center text-sm">Register</Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isHomePage && (
        <nav className="sticky top-0 z-50 bg-gray-950 border-b border-amber-500/20 shadow-lg shadow-black/30">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 leading-tight">
              <img src={logo} alt="House of Return Gift" className="h-10 sm:h-12 w-auto object-contain rounded-lg" />
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold text-amber-400 tracking-tight leading-tight">House of Return Gift .com</span>
                <span className="text-[9px] sm:text-[10px] text-amber-500/70 tracking-widest uppercase">Gifts for every occasion</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-5 text-amber-400">
              <Link to="/cart" className="relative hover:text-amber-300 transition">
                {cart?.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-black text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                    {cart.reduce((total, item) => total + item.qty, 0)}
                  </span>
                )}
                <ShoppingCart size={20} />
              </Link>
              <Link to="/wishlist" className="relative hover:text-amber-300 transition">
                {wishlist?.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-black text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
                <Heart size={20} />
              </Link>
              {isAuthenticated && (
                <>
                  <Link to="/profile" className="hover:text-amber-300 transition"><User size={20} /></Link>
                  <Link to="/my-orders" className="flex items-center gap-1.5 hover:text-amber-300 font-medium transition text-sm"><Package size={18} /> My Orders</Link>
                  {user?.isAdmin && (
                    <Link to="/admin" className="flex items-center gap-1.5 hover:text-amber-300 font-medium transition text-sm text-amber-500"><Shield size={18} /> Admin</Link>
                  )}
                  <button onClick={() => { logout(); navigate("/"); }} className="bg-amber-500 hover:bg-amber-600 text-black px-3 py-1.5 rounded-lg text-sm font-semibold transition">Log out</button>
                </>
              )}
              {!isAuthenticated && (
                <>
                  <Link to="/login" className="bg-amber-500 hover:bg-amber-600 text-black px-4 py-1.5 rounded-lg text-sm font-semibold transition">Log in</Link>
                  <Link to="/register" className="border border-amber-400/60 text-amber-400 hover:bg-amber-500/10 px-4 py-1.5 rounded-lg text-sm transition">Register</Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 md:hidden">
              {!isAuthenticated && (
                <Link to="/login" className="bg-amber-500 hover:bg-amber-600 text-black px-3 py-1.5 rounded-lg text-xs font-semibold transition">Log in</Link>
              )}
              <button className="p-2 rounded-lg hover:bg-white/10 text-amber-400" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          <div className={`md:hidden transition-all duration-300 overflow-hidden ${menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="px-4 pb-4 pt-2 space-y-4 bg-gray-950/95 backdrop-blur-md mx-4 rounded-xl border border-amber-500/20 mb-2">
              <div className="flex flex-col gap-3 text-amber-400">
                <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 hover:text-amber-300">ðŸ  Home</Link>
                <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 hover:text-amber-300"><Heart size={18} /> Wishlist</Link>
                <Link to="/cart" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 hover:text-amber-300"><ShoppingCart size={18} /> Cart</Link>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 hover:text-amber-300"><User size={18} /> Profile</Link>
                {isAuthenticated ? (
                  <button onClick={() => { logout(); navigate("/"); setMenuOpen(false); }} className="bg-amber-500 text-black px-3 py-2 rounded-lg text-center font-semibold">Log out</button>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 bg-amber-500 text-black py-2 rounded-lg text-center font-semibold text-sm">Log in</Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 border border-amber-500 text-amber-400 py-2 rounded-lg text-center text-sm">Register</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}

      {isHomePage && (
        <nav className="sticky top-0 z-40 bg-gray-950 border-b border-amber-500/20 shadow-lg shadow-black/30">
          <div className="px-2 sm:px-4 py-3">
            <div className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide justify-evenly p-1">
              <button
                onClick={() => { setActiveCategory("all"); setFilteredData(products); navigate("/"); }}
                className="flex flex-col items-center gap-2 min-w-[68px] group"
              >
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl transition-all duration-300 border-2 ${
                  activeCategory === "all"
                    ? "border-amber-500 bg-amber-500/20 shadow-lg shadow-amber-500/20 scale-105"
                    : "border-gray-700 bg-gray-800 group-hover:border-amber-500/50 group-hover:bg-gray-700"
                }`}>
                  &#x2728;
                </div>
                <span className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                  activeCategory === "all" ? "text-amber-400" : "text-gray-400 group-hover:text-amber-400"
                }`}>Shop All</span>
              </button>

              {[
                { key: "home", label: "Home", img: "/categories/home.jfif" },
                { key: "soft toys", label: "Soft Toys", img: "/categories/softtoys.jfif" },
                { key: "jewellery", label: "Jewellery", img: "/categories/jewellery.jfif" },
                { key: "games", label: "Games", img: "/categories/game.jfif" },
                { key: "stationaries", label: "Stationaries", img: "/categories/stationary.jfif" },
                { key: "aipan", label: "Aipan Art", img: "/categories/aipan.jfif" },
                { key: "gifts", label: "Gift Hamper", img: "/categories/gifthamper.jfif" },
                { key: "toys", label: "Toys", img: "/categories/toys.jpeg" },
              ].map((cat) => (
                <button key={cat.key} onClick={() => filterByCategory(cat.key)} className="flex flex-col items-center gap-2 min-w-[68px] group">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 border-2 ${
                    activeCategory === cat.key
                      ? "border-amber-500 bg-amber-500/20 shadow-lg shadow-amber-500/20 scale-105"
                      : "border-gray-700 bg-gray-800 group-hover:border-amber-500/50 group-hover:bg-gray-700"
                  }`}>
                    {cat.img ? (
                      <img src={cat.img} alt={cat.label} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-2xl sm:text-3xl">{cat.icon}</span>
                    )}
                  </div>
                  <span className={`text-xs sm:text-sm font-medium transition-colors duration-300 whitespace-nowrap ${
                    activeCategory === cat.key ? "text-amber-400" : "text-gray-400 group-hover:text-amber-400"
                  }`}>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}
    </>
  );
}

export default Navbar;
