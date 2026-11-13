import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./components/NavBar";
import ProductList from "./components/ProductList";
import AccountView from "./views/AccountView";
import CreateAccountView from "./views/CreateAccountView";
import CartView from "./views/CartView";
import ProductDetailView from "./views/ProductDetailView";
import AccountDashboardView from "./views/AccountDashboardView";
import CheckoutView from "./views/CheckoutView";
import OrderConfirmationView from "./views/OrderConfirmationView";
import OrdersView from "./views/OrdersView";
import OrderDetailView from "./views/OrderDetailView";

const App = () => {
  const [products, setProducts] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetch("/api/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load products");
        }
        return response.json();
      })
      .then(setProducts)
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    fetch("/api/cart", { credentials: "include" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load cart");
        }
        return response.json();
      })
      .then(setCart)
      .catch((error) => console.error(error));
  }, []);

  const addToCart = async (item) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId: item.productId,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        }),
      });

      const cartItems = await response.json();

      if (!response.ok) {
        throw new Error(cartItems.message || "Could not add item to cart.");
      }

      setCart(cartItems);
    } catch (error) {
      console.error("Add to cart failed:", error);
      alert(error.message || "Could not add item to cart.");
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const cartItems = await response.json();

      if (!response.ok) {
        throw new Error(cartItems.message || "Could not remove item.");
      }

      setCart(cartItems);
    } catch (error) {
      console.error("Remove from cart failed:", error);
      alert(error.message || "Could not remove item.");
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ quantity }),
      });

      const cartItems = await response.json();

      if (!response.ok) {
        throw new Error(cartItems.message || "Could not update quantity.");
      }

      setCart(cartItems);
    } catch (error) {
      console.error("Update quantity failed:", error);
      alert(error.message || "Could not update quantity.");
    }
  };

  const handleCreateAccount = async (login, email, password) => {
    try {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ login, email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not create account.");
      }

      alert(result.message);
    } catch (error) {
      console.error("Account creation failed:", error);
      alert(error.message || "Could not create account.");
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not log in.");
      }

      setLoggedInUser(result.user);
      alert(result.message);
      return result.user;
    } catch (error) {
      console.error("Login failed:", error);
      alert(error.message || "Could not log in.");
      return null;
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not log out.");
      }

      setLoggedInUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      alert(error.message || "Could not log out.");
    }
  };

  const cartItemCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <Router>
      <Navbar cartItemsCount={cartItemCount} />

      <main className="container my-4">
        <Routes>
          <Route
            path="/product/:id"
            element={<ProductDetailView addToCart={addToCart} />}
          />

          <Route
            path="/"
            element={
              <>
                <h1 className="text-center mb-4">Welcome to My Shop</h1>
                <ProductList products={products} addToCart={addToCart} />
              </>
            }
          />

          <Route
            path="/shop"
            element={
              <ProductList products={products} addToCart={addToCart} />
            }
          />

          <Route
            path="/account"
            element={
              loggedInUser ? (
                <AccountDashboardView
                  user={loggedInUser}
                  onLogout={handleLogout}
                />
              ) : (
                <AccountView onLogin={handleLogin} />
              )
            }
          />

          <Route
            path="/create-account"
            element={
              <CreateAccountView onCreateAccount={handleCreateAccount} />
            }
          />

          <Route
            path="/cart"
            element={
              <CartView
                cartItems={cart}
                removeFromCart={removeFromCart}
                updateQuantity={updateQuantity}
              />
            }
          />

          <Route
            path="/checkout"
            element={<CheckoutView onOrderPlaced={() => setCart([])} />}
          />

          <Route path="/orders" element={<OrdersView />} />
          <Route path="/orders/:id" element={<OrderDetailView />} />

          <Route
            path="/order-confirmation"
            element={<OrderConfirmationView />}
          />
        </Routes>
      </main>
    </Router>
  );
};

export default App;