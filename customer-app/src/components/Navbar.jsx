import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../CartContext"; 

function Navbar() {
  const navigate = useNavigate();
  const { cart } = useCart(); 
  
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  // Calculate total items currently sitting in the cart
  const totalItems = cart.reduce((sum, item) => sum + item.cartQuantity, 0);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("username");
    alert("You have successfully logged out.");
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        
        <Link to="/" className="logo">
          <img 
            src="/logo.png" 
            alt="GD Associates Logo" 
            style={{ height: '48px', width: 'auto', objectFit: 'contain' }} 
          />
          <div className="logo-text">
            {/* 👉 Changed to GD & ASSOCIATES and removed the sub-text entirely */}
            <span className="logo-main">GD & ASSOCIATES</span>
          </div>
        </Link>

        <nav>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/about">About Us</Link></li>
            
            {isAuthenticated ? (
              <li>
                <a onClick={handleLogout} style={{ cursor: "pointer" }}>Logout</a>
              </li>
            ) : (
              <li><Link to="/login">Login</Link></li>
            )}

            <li>
              <Link 
                to="/booking" 
                style={{ 
                  fontWeight: "bold", 
                  color: "#0ea5e9", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "6px" 
                }}
              >
                🛒 Cart ({totalItems})
              </Link>
            </li>

            <li>
              <Link to="/booking" className="nav-button">
                Book Now
              </Link>
            </li>
          </ul>
        </nav>
        
      </div>
    </header>
  );
}

export default Navbar;