import React, { useEffect, useState } from "react";
import AppContext from "./AppContext";
import axios from "axios";
import { toast } from "react-toastify";

function AppState(props) {
  const url = `${import.meta.env.VITE_API_URL}/api`;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ FIXED: token should NOT be array
  const [token, setToken] = useState("");

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [reloadCart, setReloadCart] = useState(false);


  // ✅ FIXED: always array (VERY IMPORTANT)
  const [userAddress, setUserAddress] = useState([]);

  // Wishlist state — array of product IDs
  const [wishlist, setWishlist] = useState([]);

  // checkout otp state
  // const [checkoutVerifiedEmail, setCheckoutVerifiedEmail] = useState(null);
const [otpVerified, setOtpVerified] = useState(false);
  // Load guest cart from localStorage on mount
  useEffect(() => {
    const guestCart = localStorage.getItem("guestCart");
    if (guestCart) {
      try {
        setCart(JSON.parse(guestCart));
      } catch (e) {
        localStorage.removeItem("guestCart");
      }
    }
    const guestWishlist = localStorage.getItem("guestWishlist");
    if (guestWishlist) {
      try {
        setWishlist(JSON.parse(guestWishlist));
      } catch (e) {
        localStorage.removeItem("guestWishlist");
      }
    }
  }, []);

  // Save guest cart to localStorage whenever it changes (only if not authenticated)
  useEffect(() => {
    if (!isAuthenticated && cart.length > 0) {
      localStorage.setItem("guestCart", JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  // 🔹 Fetch Products + CART + ADDRESS
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const api = await axios.get(`${url}/products/all`, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });

        setProducts(api.data.products);
        setFilteredData(api.data.products);

        // Only fetch user data if logged in
        if (token || localStorage.getItem("token")) {
          userProfile();
          userCart();
          getAddress();
          fetchWishlist();
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, reloadCart]);

  // 🔹 Load token once
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    } else {
      setToken("");
      setIsAuthenticated(false);
    }
  }, []);

  // 🔹 Register
  const register = async (name, email, password, otp) => {
    try {
      setLoading(true);

      const api = await axios.post(`${url}/users/register`, {
        name,
        email,
        password,
        otp,
      });

      toast.success(api.data.message || "Registered successfully");

      // Auto-login after registration
      if (api.data.token) {
        const newToken = api.data.token;
        localStorage.setItem("token", newToken);

        // Merge guest cart (don't send imageSrc — backend uses product's own image)
        const guestItems = JSON.parse(
          localStorage.getItem("guestCart") || "[]",
        );
        if (guestItems.length > 0) {
          try {
            for (const item of guestItems) {
              for (let i = 0; i < item.qty; i++) {
                await axios.post(
                  `${url}/cart/add`,
                  {
                    productId: item.productId,
                    title: item.title,
                    price: item.price,
                  },
                  {
                    headers: {
                      "Content-Type": "application/json",
                      Auth: newToken,
                    },
                    withCredentials: true,
                  },
                );
              }
            }
          } catch (mergeErr) {
            console.error("Cart merge error (non-fatal):", mergeErr);
          }
          localStorage.removeItem("guestCart");
        }

        // Directly fetch the merged cart
        try {
          const cartRes = await axios.get(`${url}/cart/user`, {
            headers: { "Content-Type": "application/json", Auth: newToken },
            withCredentials: true,
          });
          setCart(cartRes?.data?.cart?.items || []);
        } catch (e) {
          console.error("Cart fetch after merge failed:", e);
        }

        // Merge guest wishlist into backend
        const guestWishlistItems = JSON.parse(
          localStorage.getItem("guestWishlist") || "[]",
        );
        if (guestWishlistItems.length > 0) {
          try {
            for (const productId of guestWishlistItems) {
              await axios.post(
                `${url}/wishlist/toggle`,
                { productId },
                {
                  headers: {
                    "Content-Type": "application/json",
                    Auth: newToken,
                  },
                  withCredentials: true,
                },
              );
            }
          } catch (mergeErr) {
            console.error("Wishlist merge error (non-fatal):", mergeErr);
          }
          localStorage.removeItem("guestWishlist");
        }

        // Set auth state last
        setToken(newToken);
        setIsAuthenticated(true);
      }

      return api.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Registration failed";
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Logout
  const logout = () => {
    setToken("");
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    setWishlist([]);
    setCart([]);
    setUser(null);
    setUserAddress([]);

    toast.success("Logged out successfully");
  };

  // 🔹 User Profile
  const userProfile = async () => {
    try {
      setLoading(true);

      const api = await axios.get(`${url}/users/profile`, {
        headers: {
          "Content-Type": "application/json",
          Auth: token || localStorage.getItem("token"),
        },
        withCredentials: true,
      });

      setUser(api.data.user);
    } catch (err) {
      console.error(err);
      setError("Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Login
  const login = async (email, password) => {
    try {
      setLoading(true);

      const api = await axios.post(`${url}/users/login`, {
        email,
        password,
      });

      const newToken = api.data.token;
      localStorage.setItem("token", newToken);

      // Merge guest cart into backend BEFORE setting token state
      const guestItems = JSON.parse(localStorage.getItem("guestCart") || "[]");
      if (guestItems.length > 0) {
        try {
          for (const item of guestItems) {
            for (let i = 0; i < item.qty; i++) {
              await axios.post(
                `${url}/cart/add`,
                {
                  productId: item.productId,
                  title: item.title,
                  price: item.price,
                  // Don't send imageSrc — it's a huge base64 string that can
                  // exceed express.json() limits. Backend falls back to the
                  // product's own image from the database automatically.
                },
                {
                  headers: {
                    "Content-Type": "application/json",
                    Auth: newToken,
                  },
                  withCredentials: true,
                },
              );
            }
          }
        } catch (mergeErr) {
          console.error("Cart merge error (non-fatal):", mergeErr);
        }
        localStorage.removeItem("guestCart");
      }

      // Directly fetch the merged cart so it's available immediately
      try {
        const cartRes = await axios.get(`${url}/cart/user`, {
          headers: { "Content-Type": "application/json", Auth: newToken },
          withCredentials: true,
        });
        setCart(cartRes?.data?.cart?.items || []);
      } catch (e) {
        console.error("Cart fetch after merge failed:", e);
      }

      // Merge guest wishlist into backend
      const guestWishlistItems = JSON.parse(
        localStorage.getItem("guestWishlist") || "[]",
      );
      if (guestWishlistItems.length > 0) {
        try {
          for (const productId of guestWishlistItems) {
            await axios.post(
              `${url}/wishlist/toggle`,
              { productId },
              {
                headers: { "Content-Type": "application/json", Auth: newToken },
                withCredentials: true,
              },
            );
          }
        } catch (mergeErr) {
          console.error("Wishlist merge error (non-fatal):", mergeErr);
        }
        localStorage.removeItem("guestWishlist");
      }

      // NOW set auth state
      setToken(newToken);
      setIsAuthenticated(true);

      toast.success(api.data.message || "Login successful");
      return { ...api.data, hadGuestCart: guestItems.length > 0 };
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Add to Cart
  // const addToCart = async (productId, title, price, imageSrc) => {
  //   try {
  //     setLoading(true);

  //     setCart((prev) => {
  //       const existing = prev.find((i) => i.productId === productId);

  //       if (existing) {
  //         return prev.map((item) =>
  //           item.productId === productId
  //             ? { ...item, qty: item.qty + 1 }
  //             : item,
  //         );
  //       } else {
  //         return [...prev, { productId, title, price, imageSrc, qty: 1 }];
  //       }
  //     });

  //     const api = await axios.post(
  //       `${url}/cart/add`,
  //       { productId, title, price, imageSrc },
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //           Auth: token || localStorage.getItem("token"),
  //         },
  //         withCredentials: true,
  //       },
  //     );

  //     setReloadCart((prev) => !prev);

  //     toast.success(api.data.message || "Added to cart");
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Failed to add to cart");
  //     userCart(); // rollback sync
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const addToCart = async (productId, title, price, imageSrc) => {
    try {
      setLoading(true);

      // Guest cart — store locally
      if (!isAuthenticated) {
        const prod = products.find((p) => p._id === productId);
        const stockLimit = prod ? prod.qty : 0;

        let added = false;
        setCart((prev) => {
          const existing = prev.find((i) => i.productId === productId);
          if (existing) {
            if (existing.qty >= stockLimit) {
              toast.error("Stock limit reached", { toastId: "stock-limit" });
              return prev;
            }
            added = true;
            return prev.map((item) =>
              item.productId === productId
                ? { ...item, qty: item.qty + 1 }
                : item,
            );
          } else {
            if (stockLimit <= 0) {
              toast.error("Out of stock", { toastId: "out-of-stock" });
              return prev;
            }
            added = true;
            return [
              ...prev,
              {
                productId,
                title,
                price,
                imageSrc,
                qty: 1,
                stockQty: stockLimit,
              },
            ];
          }
        });
        if (added) toast.success("Added to cart", { toastId: "cart-add" });
        return;
      }

      // Logged-in cart — use backend
      const api = await axios.post(
        `${url}/cart/add`,
        { productId, title, price, imageSrc },
        {
          headers: {
            "Content-Type": "application/json",
            Auth: token || localStorage.getItem("token"),
          },
          withCredentials: true,
        },
      );

      // ✅ stock limit reached
      if (!api.data.success) {
        toast.error(api.data.message || "Stock limit reached", {
          toastId: "stock-limit",
        });
        return;
      }

      // ✅ update cart only after backend success
      setCart(api.data.cart?.items || []);
      toast.success(api.data.message || "Added to cart", {
        toastId: "cart-add",
      });

      setReloadCart((prev) => !prev);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add to cart", { toastId: "cart-error" });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Get Cart
  const userCart = async () => {
    try {
      setLoading(true);

      const api = await axios.get(`${url}/cart/user`, {
        headers: {
          "Content-Type": "application/json",
          Auth: token || localStorage.getItem("token"),
        },
        withCredentials: true,
      });

      setCart(api?.data?.cart?.items || []);
    } catch (err) {
      console.error(err);
      setCart([]); // ✅ FIXED
      setError("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Decrease Qty
  const decreaseQty = async (productId, qty) => {
    // Guest mode
    if (!isAuthenticated) {
      setCart((prev) => {
        const idx = prev.findIndex((i) => i.productId === productId);
        if (idx === -1) return prev;
        if (prev[idx].qty <= 1) {
          return prev.filter((i) => i.productId !== productId);
        }
        return prev.map((item) =>
          item.productId === productId ? { ...item, qty: item.qty - 1 } : item,
        );
      });
      return;
    }

    try {
      setLoading(true);

      const api = await axios.post(
        `${url}/cart/decrease-qty`,
        { productId, qty },
        {
          headers: {
            "Content-Type": "application/json",
            Auth: token || localStorage.getItem("token"),
          },
          withCredentials: true,
        },
      );

      setCart(api.data.cart?.items || []);
    } catch (err) {
      console.error(err);
      setError("Failed to update cart");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Remove Cart
  const removeFromCart = async (productId) => {
    // Guest mode
    if (!isAuthenticated) {
      setCart((prev) => prev.filter((i) => i.productId !== productId));
      localStorage.setItem(
        "guestCart",
        JSON.stringify(cart.filter((i) => i.productId !== productId)),
      );
      return;
    }

    try {
      setLoading(true);

      const api = await axios.delete(`${url}/cart/remove/${productId}`, {
        headers: {
          Auth: token || localStorage.getItem("token"),
        },
        withCredentials: true,
      });

      setReloadCart((prev) => !prev);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  // 🔹 Place Orde r
  const placeOrder = async (formData) => {
    try {
      setLoading(true);

      const api = await axios.post(`${url}/order/place-order`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Auth: token || localStorage.getItem("token"),
        },
        withCredentials: true,
      });

      if (api.data.success) {
        toast.success(api.data.message || "Order placed successfully");

        // clear frontend cart only after successful payment
        setCart([]);

        // refresh products
        const productApi = await axios.get(`${url}/products/all`);
        setProducts(productApi.data.products);
        setFilteredData(productApi.data.products);

        return api.data;
      } else {
        toast.error(api.data.message || "Order failed");
        return api.data;
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to place order");

      return {
        success: false,
        message: "Order failed",
      };
    } finally {
      setLoading(false);
    }
  };

  // cancel order, refund, update stock, send mails can be implemented later
  const cancelOrder = async (orderId) => {
    try {
      const api = await axios.put(
        `${url}/order/cancel-order/${orderId}`,
        {},
        {
          headers: {
            Auth: token || localStorage.getItem("token"),
          },
          withCredentials: true,
        },
      );

      return api.data;
    } catch (error) {
      console.log(error);
    }
  };

  //my orders
  const getMyOrders = async () => {
    const api = await axios.get(`${url}/order/my-orders`, {
      headers: {
        Auth: token,
      },
      withCredentials: true,
    });

    return api.data;
  };
  // 🔹 Clear Cart
  const clearCart = async () => {
    // Guest mode
    if (!isAuthenticated) {
      setCart([]);
      localStorage.removeItem("guestCart");
      toast.success("Cart cleared");
      return;
    }

    try {
      setLoading(true);

      const api = await axios.delete(`${url}/cart/clear`, {
        headers: {
          Auth: token || localStorage.getItem("token"),
        },
        withCredentials: true,
      });

      toast.success(api.data.message || "Cart cleared");

      setReloadCart((prev) => !prev);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Guest Checkout — find or create user, get token, sync cart
  // const guestCheckout = async (name, email, phone) => {
  //   try {
  //     setLoading(true);

  

  //     const api = await axios.post(`${url}/users/guest-checkout`, {
  //       name,
  //       email,
  //       phone,
    
  //     });

  //     if (!api.data.success) {
  //       toast.error(api.data.message || "Checkout failed");
  //       return { success: false };
  //     }

  //     // Save token and authenticate
  //     const newToken = api.data.token;
  //     setToken(newToken);
  //     setIsAuthenticated(true);
  //     localStorage.setItem("token", newToken);

  //     // Sync guest cart items to backend
  //     const guestItems = JSON.parse(localStorage.getItem("guestCart") || "[]");

  //     for (const item of guestItems) {
  //       for (let i = 0; i < item.qty; i++) {
  //         await axios.post(
  //           `${url}/cart/add`,
  //           {
  //             productId: item.productId,
  //             title: item.title,
  //             price: item.price,
  //             imageSrc: item.imageSrc,
  //           },
  //           {
  //             headers: {
  //               "Content-Type": "application/json",
  //               Auth: newToken,
  //             },
  //             withCredentials: true,
  //           },
  //         );
  //       }
  //     }

  //     // Clear guest cart from localStorage
  //     localStorage.removeItem("guestCart");

  //     // Refresh backend cart
  //     const cartApi = await axios.get(`${url}/cart/user`, {
  //       headers: { Auth: newToken },
  //       withCredentials: true,
  //     });
  //     setCart(cartApi?.data?.cart?.items || []);

  //     // Fetch user profile
  //     const profileApi = await axios.get(`${url}/users/profile`, {
  //       headers: { Auth: newToken },
  //       withCredentials: true,
  //     });
  //     setUser(profileApi.data.user);

  //     toast.success(api.data.message);
  //     return api.data;
  //   } catch (error) {
  //     console.error(error);
  //     toast.error(error.response?.data?.message || "Checkout failed");
  //     return { success: false };
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Login with a pre-obtained token (used after OTP verification at checkout)
  const loginWithToken = async (newToken) => {
    try {
      setLoading(true);
      setToken(newToken);
      setIsAuthenticated(true);
      localStorage.setItem("token", newToken);

      // Sync guest cart to backend
      const guestItems = JSON.parse(localStorage.getItem("guestCart") || "[]");
      for (const item of guestItems) {
        for (let i = 0; i < item.qty; i++) {
          await axios.post(
            `${url}/cart/add`,
            {
              productId: item.productId,
              title: item.title,
              price: item.price,
              imageSrc: item.imageSrc,
            },
            {
              headers: { "Content-Type": "application/json", Auth: newToken },
              withCredentials: true,
            }
          );
        }
      }
      localStorage.removeItem("guestCart");

      // Refresh cart
      const cartApi = await axios.get(`${url}/cart/user`, {
        headers: { Auth: newToken },
        withCredentials: true,
      });
      setCart(cartApi?.data?.cart?.items || []);

      // Get profile
      const profileApi = await axios.get(`${url}/users/profile`, {
        headers: { Auth: newToken },
        withCredentials: true,
      });
      setUser(profileApi.data.user);

      return { success: true };
    } catch (error) {
      console.error(error);
      toast.error("Login failed");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const guestCheckout = async (name, email, phone) => {
  try {
    setLoading(true);

    // normalize inputs
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    const api = await axios.post(`${url}/users/guest-checkout`, {
      name,
      email: cleanEmail,
      phone: cleanPhone,
    });

    if (!api.data.success) {
      toast.error(api.data.message || "Checkout failed");
      return { success: false };
    }

    // Save token and authenticate
    const newToken = api.data.token;
    setToken(newToken);
    setIsAuthenticated(true);
    localStorage.setItem("token", newToken);

    // Sync guest cart to backend
    const guestItems = JSON.parse(localStorage.getItem("guestCart") || "[]");

    for (const item of guestItems) {
      for (let i = 0; i < item.qty; i++) {
        await axios.post(
          `${url}/cart/add`,
          {
            productId: item.productId,
            title: item.title,
            price: item.price,
            imageSrc: item.imageSrc,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Auth: newToken,
            },
            withCredentials: true,
          }
        );
      }
    }

    // Clear guest cart
    localStorage.removeItem("guestCart");

    // Refresh cart
    const cartApi = await axios.get(`${url}/cart/user`, {
      headers: { Auth: newToken },
      withCredentials: true,
    });

    setCart(cartApi?.data?.cart?.items || []);

    // Get profile
    const profileApi = await axios.get(`${url}/users/profile`, {
      headers: { Auth: newToken },
      withCredentials: true,
    });

    setUser(profileApi.data.user);

    // toast.success(api.data.message || "Guest checkout successful");

    return api.data;
  } catch (error) {
    console.error(error);
    toast.error(error.response?.data?.message || "Checkout failed");
    return { success: false };
  } finally {
    setLoading(false);
  }
};

  // 🔹 Update user name
  const updateName = async (name) => {
    try {
      const res = await axios.put(
        `${url}/users/update-name`,
        { name },
        {
          headers: {
            "Content-Type": "application/json",
            Auth: token || localStorage.getItem("token"),
          },
          withCredentials: true,
        },
      );
      if (res.data.success) {
        setUser(res.data.user);
        toast.success("Name updated");
        return res.data;
      } else {
        toast.error(res.data.message || "Failed to update name");
        return res.data;
      }
    } catch (error) {
      toast.error("Failed to update name");
      return { success: false };
    }
  };

  // 🔹 Add Address
  const shippingAddress = async (
    fullName,
    phoneNumber,
    address,
    city,
    state,
    country,
    pinCode,
  ) => {
    try {
      setLoading(true);

      const api = await axios.post(
        `${url}/address/add`,
        { fullName, phoneNumber, address, city, state, country, pinCode },
        {
          headers: {
            Auth: token || localStorage.getItem("token"),
          },
          withCredentials: true,
        },
      );

      toast.success(api.data.message || "Address added");

      // ✅ FIXED: refresh properly
      await getAddress();

      return api.data;
    } catch (err) {
      console.error(err);
      setError("Failed to add address");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Get Address
  const getAddress = async () => {
    try {
      setLoading(true);

      const api = await axios.get(`${url}/address/get`, {
        headers: {
          Auth: localStorage.getItem("token"),
        },
        withCredentials: true,
      });

      setUserAddress(api.data?.userAddress || []);
    } catch (err) {
      console.error(err);
      setUserAddress([]); // ✅ FIXED
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Delete Address
  const deleteAddress = async (addressId) => {
    try {
      await axios.delete(`${url}/address/delete/${addressId}`, {
        headers: { Auth: token || localStorage.getItem("token") },
        withCredentials: true,
      });
      await getAddress();
      toast.success("Address deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete address");
    }
  };

  // 🔹 Fetch Wishlist
  const fetchWishlist = async () => {
    try {
      const api = await axios.get(`${url}/wishlist`, {
        headers: { Auth: token || localStorage.getItem("token") },
        withCredentials: true,
      });
      setWishlist(api.data.products?.map((p) => p._id) || []);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Toggle Wishlist
  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      // Guest wishlist — localStorage
      setWishlist((prev) => {
        const updated = prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId];
        localStorage.setItem("guestWishlist", JSON.stringify(updated));
        return updated;
      });
      return;
    }

    try {
      const api = await axios.post(
        `${url}/wishlist/toggle`,
        { productId },
        {
          headers: {
            "Content-Type": "application/json",
            Auth: token || localStorage.getItem("token"),
          },
          withCredentials: true,
        },
      );
      if (api.data.wishlisted) {
        setWishlist((prev) => [...prev, productId]);
      } else {
        setWishlist((prev) => prev.filter((id) => id !== productId));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update wishlist");
    }
  };

  const isWishlisted = (productId) => wishlist.includes(productId);

  // Refresh products from API (used by admin panel)
  const refreshProducts = async () => {
    try {
      const api = await axios.get(`${url}/products/all`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      setProducts(api.data.products);
      setFilteredData(api.data.products);
    } catch (err) {
      console.error("Failed to refresh products:", err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        products,
        loading,
        error,
        register,
        login,
        url,
        token,
        isAuthenticated,
        setIsAuthenticated,
        filteredData,
        setFilteredData,
        logout,
        user,
        addToCart,
        cart,
        setCart,
        decreaseQty,
        removeFromCart,
        clearCart,
        shippingAddress,
        userAddress,
        placeOrder,
        guestCheckout,
        loginWithToken,
        cancelOrder,
        getMyOrders,
        getAddress,
        deleteAddress,
        updateName,
        wishlist,
        toggleWishlist,
        isWishlisted,
        refreshProducts,
        otpVerified,
        setOtpVerified,
//         checkoutVerifiedEmail,
// setCheckoutVerifiedEmail,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
}

export default AppState;
