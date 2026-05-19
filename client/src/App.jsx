import React from "react";
import "./App.css";
import AppContext from "./context/AppContext";
import ShowProduct from "./component/product/ShowProduct";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductDetailPage from "./component/product/ProductDetailPage";
import Navbar from "./component/Navbar";
import SearchProduct from "./component/product/SearchProduct";
import Register from "./component/user/Register";
import Login from "./component/user/Login";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Profile from "./component/user/Profile";
import Cart from "./component/Cart";
import Address from "./component/address";
import Checkout from "./component/Checkout";
import Success from "./component/user/Success";
import MyOrders from "./component/user/MyOrder";
import Wishlist from "./component/Wishlist";
import AdminPanel from "./component/AdminPanel";
import { FaWhatsapp } from "react-icons/fa";

function App() {
  //const data = React.useContext(AppContext);
  return (
    <Router>
      <Navbar />
      <ToastContainer />
      <Routes>
        <Route path="/" element={<ShowProduct />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/product/search/:term" element={<SearchProduct />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/shipping" element={<Address />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/success" element={<Success />} />
         <Route path="/my-orders" element={<MyOrders />} />
         <Route path="/wishlist" element={<Wishlist />} />
         <Route path="/admin" element={<AdminPanel />} />
      </Routes>

      {/* WhatsApp Floating Button - Bottom Left */}
      <a
        href="https://wa.me/919917078468?text=Hi"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Send via WhatsApp"
      >
        <FaWhatsapp size={28} />
      </a>
    </Router>
  );
}

export default App;
