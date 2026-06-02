import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./index.css";

// Components
import { Navbar } from "./components/Navbar";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { TenantMenu } from "./pages/TenantMenu";
import { Checkout } from "./pages/Checkout";
import { Dashboard } from "./pages/Dashboard";
import { Success } from "./pages/Success";
import { MyOrders } from "./pages/MyOrders";

function App() {
  const [role, setRole] = useState("user"); // user, tenant
  const [cart, setCart] = useState([]);

  const location = useLocation();

  const handleAddToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, cartId: Date.now(), quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (cartId, delta) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.cartId === cartId) {
            return { ...item, quantity: item.quantity + delta };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const handleRemoveFromCart = (cartId) => {
    setCart(cart.filter((item) => item.cartId !== cartId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    setCart([]);
  };



  return (
    <div className="app-wrapper">
      {/* Navbar di-render di semua halaman KECUALI /login */}
      {location.pathname !== "/login" && (
        <Navbar 
          role={role} 
          cartCount={cartCount} 
          cartTotal={cartTotal} 
          onLogout={handleLogout} 
        />
      )}

      {/* Main Content */}
      <main
        className={location.pathname !== "/login" ? "container" : ""}
        style={location.pathname !== "/login" ? { padding: "32px 24px", minHeight: "80vh" } : {}}
      >
        <Routes>
          <Route path="/login" element={<Login setRole={setRole} />} />
          <Route path="/" element={<Home />} />
          <Route 
            path="/tenant/:id" 
            element={
              <TenantMenu 
                handleAddToCart={handleAddToCart} 
              />
            } 
          />
          <Route 
            path="/checkout" 
            element={
              <Checkout 
                cart={cart} 
                cartTotal={cartTotal} 
                handleRemoveFromCart={handleRemoveFromCart}
                handleUpdateQuantity={handleUpdateQuantity}
                setCart={setCart} 
              />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <Dashboard />
            } 
          />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/success" element={<Success />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
