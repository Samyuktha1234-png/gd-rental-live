import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import CSS
import "./App.css";

// Import your Cart Context
import { CartProvider } from "./CartContext";

// Import your Navbar component
import Navbar from "./components/Navbar"; 

// Import all your public-facing pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Booking from "./pages/Booking";
import About from "./pages/About"; 

function App() {
  return (
    <CartProvider>
      <Router>
        {/* The Navbar sits outside the Routes so it appears at the top of every page */}
        <Navbar /> 
        
        {/* The Routes determine which page loads based on the URL */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/about" element={<About />} /> 
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;