import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  // 👉 This hides the main customer Navbar when entering the Admin Portal
  useEffect(() => {
    const navbar = document.querySelector(".navbar");
    if (navbar) {
      navbar.style.display = "none";
    }

    // Load bookings
    const savedBookings = JSON.parse(localStorage.getItem("gdRentalBookings") || "[]");
    setBookings(savedBookings);

    // Show the customer Navbar again if we leave this page
    return () => {
      if (navbar) {
        navbar.style.display = "flex";
      }
    };
  }, []);

  const handleConfirmAdvanceAndGenerateInvoice = (indexToConfirm) => {
    const confirmedBooking = bookings[indexToConfirm];
    const updatedStatusBooking = { ...confirmedBooking, status: "Advance Paid & Confirmed" };

    const updatedBookings = bookings.map((b, index) => {
      if (index === indexToConfirm) {
        return updatedStatusBooking;
      }
      return b;
    });

    setBookings(updatedBookings);
    localStorage.setItem("gdRentalBookings", JSON.stringify(updatedBookings));
    localStorage.setItem("gdRentalBooking", JSON.stringify(updatedStatusBooking));

    alert("Advance payment confirmed! Opening invoice generation & print view.");
    navigate("/invoice");
  };

  const handleViewInvoice = (booking) => {
    localStorage.setItem("gdRentalBooking", JSON.stringify(booking));
    navigate("/invoice");
  };

  return (
    <div style={{ backgroundColor: "#f1f5f9", minHeight: "100vh" }}>
      
      {/* 👉 Dedicated Admin Portal Header */}
      <header style={{ 
        backgroundColor: "#0f172a", 
        color: "white", 
        padding: "15px 30px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "24px" }}>🛠️</span>
          <h2 style={{ margin: 0, fontSize: "18px", letterSpacing: "1px" }}>GD ASSOCIATES | ADMIN DASHBOARD</h2>
        </div>
        <Link to="/" style={{ color: "#38bdf8", textDecoration: "none", fontWeight: "bold", fontSize: "14px" }}>
          ← Back to Main Website
        </Link>
      </header>

      <div style={{ padding: "40px 20px", maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ marginBottom: "30px", textAlign: "center" }}>
          <span style={{ fontSize: "12px", fontWeight: "bold", color: "#0ea5e9", letterSpacing: "2px", textTransform: "uppercase" }}>MANAGEMENT SYSTEM</span>
          <h1 style={{ marginTop: "10px" }}>Booking &amp; Advance Payments</h1>
          <p style={{ color: "#64748b" }}>Review customer bookings, confirm advance payments, and generate official invoices.</p>
        </div>

        {bookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <h2>No Bookings Found</h2>
            <p>No customer bookings have been submitted yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {bookings.map((booking, index) => {
              const customer = booking.customer || {};
              const isPending = booking.status === "Pending Advance" || !booking.status;

              return (
                <div 
                  key={index} 
                  style={{ 
                    background: "white", 
                    border: "1px solid #e2e8f0", 
                    borderRadius: "12px", 
                    padding: "24px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.02)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "15px", borderBottom: "1px solid #f1f5f9", paddingBottom: "15px", marginBottom: "15px" }}>
                    <div>
                      <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "bold" }}>BOOKING ID: {booking.bookingId}</span>
                      <h3 style={{ margin: "4px 0 0 0", fontSize: "18px", color: "#0f172a" }}>{customer.name} ({customer.phone})</h3>
                    </div>
                    <div>
                      <span 
                        style={{ 
                          padding: "6px 12px", 
                          borderRadius: "20px", 
                          fontSize: "12px", 
                          fontWeight: "bold",
                          backgroundColor: isPending ? "#fef3c7" : "#d1fae5",
                          color: isPending ? "#92400e" : "#065f46"
                        }}
                      >
                        {booking.status || "Pending Advance"}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "15px", marginBottom: "20px", fontSize: "14px", color: "#334155" }}>
                    <div>
                      <strong>Rental Period:</strong> {booking.startDate} to {booking.endDate} ({booking.rentalDays} Days)
                    </div>
                    <div>
                      <strong>Total Amount:</strong> ₹{booking.totalPrice?.toFixed(2)}
                    </div>
                    <div>
                      <strong style={{ color: "#0284c7" }}>Advance Paid:</strong> ₹{booking.advancePayment?.toFixed(2)}
                    </div>
                    <div>
                      <strong style={{ color: "#ef4444" }}>Balance Due:</strong> ₹{booking.balanceAmount?.toFixed(2)}
                    </div>
                  </div>

                  <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>
                    <strong style={{ fontSize: "13px", color: "#475569", display: "block", marginBottom: "6px" }}>Rented Items:</strong>
                    <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px", color: "#334155" }}>
                      {booking.items?.map((item, i) => (
                        <li key={i}>
                          {item.name} — Qty: {item.quantity} (₹{item.price}/day)
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                    {isPending ? (
                      <button
                        onClick={() => handleConfirmAdvanceAndGenerateInvoice(index)}
                        style={{
                          backgroundColor: "#10b981",
                          color: "white",
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: "8px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          fontSize: "14px"
                        }}
                      >
                        ✓ Confirm Advance Paid &amp; Generate Invoice
                      </button>
                    ) : (
                      <button
                        onClick={() => handleViewInvoice(booking)}
                        style={{
                          backgroundColor: "#0ea5e9",
                          color: "white",
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: "8px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          fontSize: "14px"
                        }}
                      >
                        🖨 View / Print Invoice
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingHistory;