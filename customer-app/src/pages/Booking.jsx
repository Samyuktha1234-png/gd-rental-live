import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../CartContext";
import { io } from "socket.io-client";

// Initialize Socket connection to your backend
const socket = io(import.meta.env.VITE_API_URL || "http://10.166.13.45:5000");

function Booking() {
  const navigate = useNavigate();
  const { cart, clearCart, updateQuantity, removeFromCart } = useCart();

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [booking, setBooking] = useState({
    startDate: "",
    endDate: "",
  });

  const [error, setError] = useState("");

  // Automatically redirect to products if the cart is empty
  useEffect(() => {
    if (!cart || cart.length === 0) {
      navigate("/products", { replace: true });
    }
  }, [cart, navigate]);

  // Robust parser for date inputs (handles YYYY-MM-DD safely without timezone shifts)
  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-indexed
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(dateStr);
  };

  const rentalDays = useMemo(() => {
    if (!booking.startDate || !booking.endDate) return 0;
    
    const start = parseLocalDate(booking.startDate);
    const end = parseLocalDate(booking.endDate);

    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

    const utc1 = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const utc2 = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

    const difference = utc2 - utc1;
    if (difference < 0) return 0;

    return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
  }, [booking.startDate, booking.endDate]);

  const subtotal = useMemo(() => {
    if (rentalDays <= 0 || !cart) return 0;
    return cart.reduce((acc, item) => {
      const itemQty = Number(item.cartQuantity || 1);
      return acc + item.price * itemQty * rentalDays;
    }, 0);
  }, [cart, rentalDays]);

  const total = subtotal;
  const advancePayment = 0;
  const otherCharges = 0;
  const balanceAmount = total;

  const handleCustomerChange = (event) => {
    const { name, value } = event.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleBookingChange = (event) => {
    const { name, value } = event.target;
    setBooking((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Auto-validate order if both are picked
      if (updated.startDate && updated.endDate) {
        const s = parseLocalDate(updated.startDate);
        const e = parseLocalDate(updated.endDate);
        if (s && e && e < s) {
          setError("Rental End Date cannot be before Start Date.");
        } else {
          setError("");
        }
      }
      return updated;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!customer.name.trim() || !customer.phone.trim() || !customer.address.trim()) {
      setError("Please fill out all required customer details.");
      return;
    }

    const pincodeRegex = /\b\d{2,6}\b/;
    if (!pincodeRegex.test(customer.address)) {
      setError("Please include your City/Town and at least the last 2 digits of your PIN code in the address section.");
      return;
    }

    if (!booking.startDate || !booking.endDate || rentalDays <= 0) {
      setError("Please select valid rental dates (End date must be on or after start date).");
      return;
    }
    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const monthKey = `gd_booking_seq_${year}_${month}`;

    const currentCount = parseInt(localStorage.getItem(monthKey) || "0", 10) + 1;
    localStorage.setItem(monthKey, currentCount.toString());

    const bookingId = `GD-${month}-${String(currentCount).padStart(2, '0')}`;

    const formattedItems = cart.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      quantity: Number(item.cartQuantity || 1),
    }));

    const bookingPayload = {
      bookingId,
      customer,
      items: formattedItems,
      startDate: booking.startDate,
      endDate: booking.endDate,
      rentalDays,
      subtotal,
      tax: 0,
      otherCharges,
      totalPrice: total,
      advancePayment,
      balanceAmount,
      notes: "",
      bookingDate: new Date().toISOString(),
      status: "Pending Advance",
    };

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://10.166.13.45:5000";
      
      const response = await fetch(`${apiUrl}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to save booking.");
      }

      socket.emit("customer_created_booking", data.data || bookingPayload);

      const existingBookings = JSON.parse(localStorage.getItem("gdRentalBookings") || "[]");
      localStorage.setItem(
        "gdRentalBookings",
        JSON.stringify([bookingPayload, ...existingBookings])
      );
      localStorage.setItem("gdRentalBooking", JSON.stringify(bookingPayload));

      clearCart();

      alert(`Booking submitted successfully! ID: ${bookingId}. Please coordinate with management for your advance payment.`);
      navigate("/");

    } catch (err) {
      console.error("Booking submission error:", err);
      setError("Unable to save booking. Please make sure the backend server is running.");
    }
  };

  if (!cart || cart.length === 0) {
    return null;
  }

  // Get today's date in YYYY-MM-DD format to set as min selectable date
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="booking-page" style={{ paddingTop: "20px" }}>
      <section className="booking-section" style={{ paddingTop: "10px" }}>
        <div className="booking-layout">
          <form className="booking-form" onSubmit={handleSubmit}>
            
            <div style={{ marginBottom: "20px" }}>
              <span className="section-label">RENTAL BOOKING</span>
              <h1 style={{ fontSize: "28px", color: "#111", marginTop: "4px" }}>Complete Your Order</h1>
            </div>

            <div className="booking-card">
              <div className="booking-card-heading">
                <div className="booking-step">01</div>
                <div>
                  <h2>Customer Information</h2>
                  <p>Enter the details of the person making the rental.</p>
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" name="name" placeholder="Enter customer name" value={customer.name} onChange={handleCustomerChange} />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input type="tel" name="phone" placeholder="Enter phone number" value={customer.phone} onChange={handleCustomerChange} />
                </div>
                <div className="form-group form-group-full">
                  <label>Delivery Address (Include City/Town & PIN Code) *</label>
                  <textarea 
                    name="address" 
                    rows="3" 
                    placeholder="Enter street address, city/town, and PIN code (or last 2 digits)" 
                    value={customer.address} 
                    onChange={handleCustomerChange} 
                  />
                </div>
              </div>
            </div>

            <div className="booking-card">
              <div className="booking-card-heading">
                <div className="booking-step">02</div>
                <div>
                  <h2>Rental Period</h2>
                  <p>Select the rental dates for your items.</p>
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Rental Start Date *</label>
                  <input 
                    type="date" 
                    name="startDate" 
                    min={todayStr}
                    value={booking.startDate} 
                    onChange={handleBookingChange} 
                  />
                </div>
                <div className="form-group">
                  <label>Rental End Date *</label>
                  <input 
                    type="date" 
                    name="endDate" 
                    min={booking.startDate || todayStr}
                    value={booking.endDate} 
                    onChange={handleBookingChange} 
                  />
                </div>
              </div>
              <div className="rental-days-display">
                <span>Rental Duration</span>
                <strong>{rentalDays > 0 ? `${rentalDays} Day${rentalDays > 1 ? "s" : ""}` : "--"}</strong>
              </div>
            </div>

            {error && <div className="booking-error">⚠ {error}</div>}
            
            <button type="submit" className="confirm-booking-button">
              Book Now →
            </button>
          </form>

          <aside className="booking-summary">
            <div className="summary-card">
              <div className="summary-top">
                <span>CART SUMMARY</span>
                <div className="summary-icon">📦</div>
              </div>

              <div style={{ maxHeight: "380px", overflowY: "auto", paddingRight: "6px", margin: "12px 0" }}>
                {cart.map((item) => (
                  <div key={item.id} style={{ borderBottom: "1px solid #eee", padding: "15px 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                    <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                      <h4 style={{ margin: "0 0 6px 0", fontSize: "14px", lineHeight: "1.3" }}>{item.name}</h4>
                      <button type="button" onClick={() => removeFromCart(item.id)} style={{ background: "none", border: "none", color: "#ef4444", fontSize: "12px", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                        Remove Item
                      </button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px", textTransform: "uppercase", fontWeight: "bold" }}>Qty</span>
                      <input
                        type="number"
                        min="1"
                        value={item.cartQuantity || 1}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val > 0) updateQuantity(item.id, val);
                        }}
                        style={{ width: "60px", padding: "8px 6px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "14px", textAlign: "center", outline: "none" }}
                      />
                    </div>
                    <div style={{ flexShrink: 0, textAlign: "right", minWidth: "75px" }}>
                      <strong style={{ fontSize: "15px", display: "block" }}>₹{item.price * (item.cartQuantity || 1)}</strong>
                      <span style={{ fontSize: "11px", color: "#64748b", display: "block", marginTop: "4px" }}>(₹{item.price}/day)</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: "right", margin: "10px 0 20px 0" }}>
                <Link to="/products" style={{ fontSize: "13px", color: "#0284c7", textDecoration: "underline", fontWeight: "500" }}>+ Add More Equipment</Link>
              </div>

              <div className="summary-divider" />
              <div className="summary-row">
                <span>Rental Duration</span>
                <strong>{rentalDays ? `${rentalDays} Days` : "--"}</strong>
              </div>
              <div className="summary-row">
                <span>Subtotal</span>
                <strong>₹{subtotal.toFixed(2)}</strong>
              </div>
              <div className="summary-total">
                <span>Total Amount</span>
                <strong>₹{total.toFixed(2)}</strong>
              </div>
              
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default Booking;