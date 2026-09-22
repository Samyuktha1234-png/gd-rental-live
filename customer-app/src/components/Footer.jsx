import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* BRAND */}
        <div className="footer-brand">
          <Link to="/" className="logo">
            
            {/* Custom Logo Image */}
            <img 
              src="/logo.png" 
              alt="GD Associates Logo" 
              style={{ height: '48px', width: 'auto', objectFit: 'contain' }} 
            />

            <div className="logo-text">
              <span className="logo-main">
                GD Associates
              </span>
              <span className="logo-sub">
                Machine & Materials Rental
              </span>
            </div>

          </Link>

          <p>
            Reliable construction machine and material rental
            solutions for projects of every size.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div className="footer-column">
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>

        {/* RENTALS */}
        <div className="footer-column">
          <h3>Rentals</h3>
          <Link to="/products">Centering Materials</Link>
          <Link to="/products">Scaffolding</Link>
          <Link to="/products">Machines</Link>
          <Link to="/booking">Book Equipment</Link>
        </div>

        {/* SUPPORT */}
        <div className="footer-column">
          <h3>Support</h3>
          <Link to="/contact">Contact Us</Link>
          <Link to="/login">Customer Login</Link>
          <Link to="/invoice">Invoice</Link>
        </div>

      </div>

      <div className="footer-bottom">
        <span>© 2026 GD Associates. All rights reserved.</span>
        <span>Construction Equipment Rental</span>
      </div>

    </footer>
  );
}

export default Footer;