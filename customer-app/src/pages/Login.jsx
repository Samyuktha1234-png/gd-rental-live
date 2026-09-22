import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      setError("Please fill in both Full Name and Phone Number.");
      return;
    }

    localStorage.setItem("username", formData.fullName);
    localStorage.setItem("userPhone", formData.phone);
    localStorage.setItem("isAuthenticated", "true"); 

    alert("Login successful!");
    navigate("/products"); 
  };

  return (
    <div style={{ padding: "80px 20px", maxWidth: "450px", margin: "0 auto" }}>
      <div style={{ background: "white", padding: "30px", borderRadius: "16px", border: "1px solid var(--border)", boxShadow: "var(--shadow-small)" }}>
        
        <h2 style={{ marginBottom: "25px", fontFamily: "Manrope, sans-serif" }}>Customer Login</h2>

        {error && <div className="booking-error" style={{ marginBottom: "15px" }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          
          <div className="form-group">
            <label>Full Name *</label>
            <input 
              type="text" 
              name="fullName"
              placeholder="Enter your full name or company name" 
              value={formData.fullName}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input 
              type="tel" 
              name="phone"
              placeholder="+91 98765 43210" 
              value={formData.phone}
              onChange={handleChange}
              required 
            />
          </div>

          <button type="submit" className="primary-button" style={{ width: "100%", marginTop: "10px", cursor: "pointer" }}>
            Login & Continue to Products
          </button>

        </form>

        <p style={{ marginTop: "20px", fontSize: "13px", textAlign: "center", color: "var(--gray-600)" }}>
          Don't have an account? <Link to="/register" style={{ color: "var(--primary)", fontWeight: "700" }}>Register here</Link>
        </p>

      </div>
    </div>
  );
}

export default Login;