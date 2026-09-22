import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../InvoicePrint.css";

const GST_RATE = 0.18;

/* =========================================================
   FORMAT CURRENCY
========================================================= */

const formatCurrency = (value) => {
  const number = Number(value) || 0;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(number);
};

/* =========================================================
   FORMAT DATE
========================================================= */

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* =========================================================
   CALCULATE RENTAL DAYS
========================================================= */

const calculateDays = (startDate, endDate, savedDays) => {
  if (savedDays !== undefined && savedDays !== null) {
    const days = Number(savedDays);

    if (!Number.isNaN(days) && days > 0) {
      return days;
    }
  }

  if (!startDate || !endDate) {
    return 0;
  }

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return 0;
  }

  const difference = end.getTime() - start.getTime();

  if (difference < 0) {
    return 0;
  }

  return (
    Math.floor(
      difference / (1000 * 60 * 60 * 24)
    ) + 1
  );
};

/* =========================================================
   INVOICE COMPONENT
========================================================= */

function Invoice() {
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const savedBooking =
      localStorage.getItem("gdRentalBooking");

    if (savedBooking) {
      try {
        const parsedBooking =
          JSON.parse(savedBooking);

        setBooking(parsedBooking);
      } catch (error) {
        console.error(
          "Unable to read booking information:",
          error
        );
      }
    }
  }, []);

  if (!booking) {
    return (
      <div className="invoice-page">
        <div className="invoice-loading">
          <h2>No Booking Found</h2>

          <p>
            Please complete a booking before opening
            the invoice.
          </p>

          <Link
            to="/products"
            className="back-button"
          >
            Browse Equipment
          </Link>
        </div>
      </div>
    );
  }

  const customer = booking.customer || {};

  const customerName =
    customer.name || "Customer Name";

  const phone =
    customer.phone || "-";

  const email =
    customer.email || "-";

  const address =
    customer.address || "-";

  const city =
    customer.city || "Coimbatore";

  /* =======================================================
     ITEMS ARRAY (Multi-item Support)
  ================================================       */

  const items = booking.items || [];

  const startDate =
    booking.startDate || "";

  const endDate =
    booking.endDate || "";

  const rentalDays = calculateDays(
    startDate,
    endDate,
    booking.rentalDays
  );

  const bookingId =
    booking.bookingId ||
    `GD-${Date.now().toString().slice(-8)}`;

  const bookingDate =
    booking.bookingDate ||
    new Date().toISOString();

  const status =
    booking.status || "Confirmed";

  /* =======================================================
     AUTOMATIC BILL CALCULATIONS
  ======================================================= */

  const calculatedSubtotal = items.reduce((acc, item) => {
    return acc + (Number(item.price) || 0) * (Number(item.quantity) || 1) * rentalDays;
  }, 0);

  const calculatedGST = calculatedSubtotal * GST_RATE;
  const calculatedGrandTotal = calculatedSubtotal + calculatedGST;

  const subtotal =
    Number(booking.subtotal) >= 0
      ? Number(booking.subtotal)
      : calculatedSubtotal;

  const gst =
    Number(booking.tax) >= 0
      ? Number(booking.tax)
      : calculatedGST;

  const grandTotal =
    Number(booking.totalPrice) >= 0
      ? Number(booking.totalPrice)
      : calculatedGrandTotal;

  // 👉 50% Advance & Balance Calculations
  const advancePayment =
    Number(booking.advancePayment) >= 0
      ? Number(booking.advancePayment)
      : grandTotal * 0.5;

  const balanceAmount =
    Number(booking.balanceAmount) >= 0
      ? Number(booking.balanceAmount)
      : grandTotal - advancePayment;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="invoice-page">

      {/* TOP HEADING */}
      <section className="invoice-heading">
        <div className="invoice-label">
          INVOICE
        </div>
        <h1>
          Rental Invoice
        </h1>
        <p>
          Your complete construction equipment
          rental billing information.
        </p>
      </section>

      {/* INVOICE PAPER */}
      <main className="invoice-wrapper">
        <div className="invoice-paper">

          {/* COMPANY HEADER */}
          <header className="invoice-company">
            <div className="company-logo">
              GD
            </div>
            <div className="company-details">
              <h2>
                GD Centering
              </h2>
              <p>
                MACHINE &amp; MATERIALS RENTAL
              </p>
            </div>
          </header>

          <div className="invoice-divider" />

          {/* INVOICE INFORMATION */}
          <div className="invoice-meta">
            <div className="meta-item">
              <span className="meta-label">
                INVOICE NUMBER
              </span>
              <strong>
                {bookingId}
              </strong>
            </div>

            <div className="meta-item">
              <span className="meta-label">
                BOOKING DATE
              </span>
              <strong>
                {formatDate(bookingDate)}
              </strong>
            </div>
          </div>

          {/* CUSTOMER + RENTAL INFORMATION */}
          <div className="invoice-info-grid">
            {/* CUSTOMER */}
            <section className="invoice-info-box">
              <div className="box-title">
                BILL TO
              </div>
              <h3>
                {customerName}
              </h3>

              <div className="info-line">
                <span>Phone</span>
                <strong>{phone}</strong>
              </div>

              <div className="info-line">
                <span>Email</span>
                <strong className="email-text">{email}</strong>
              </div>

              <div className="info-line">
                <span>Address</span>
                <strong>{address}</strong>
              </div>

              <div className="info-line">
                <span>City</span>
                <strong>{city}</strong>
              </div>
            </section>

            {/* RENTAL */}
            <section className="invoice-info-box">
              <div className="box-title">
                RENTAL PERIOD
              </div>

              <div className="rental-days">
                {rentalDays}{" "}
                {rentalDays === 1 ? "Day" : "Days"}
              </div>

              <div className="date-row">
                <div>
                  <span>START</span>
                  <strong>{formatDate(startDate)}</strong>
                </div>

                <div>
                  <span>END</span>
                  <strong>{formatDate(endDate)}</strong>
                </div>
              </div>

              <div className="status-row">
                <span>BOOKING STATUS</span>
                <strong className="status-badge">{status}</strong>
              </div>

              <div className="booking-id">
                <span>BOOKING ID</span>
                <strong>{bookingId}</strong>
              </div>
            </section>
          </div>

          {/* EQUIPMENT TABLE (Multi-Item List) */}
          <section className="equipment-section">
            <div className="section-title">
              RENTAL DETAILS ({items.length} Items)
            </div>

            <div className="invoice-table-wrapper">
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th className="equipment-column">
                      EQUIPMENT
                    </th>
                    <th>RATE / DAY</th>
                    <th>QTY</th>
                    <th>DAYS</th>
                    <th>AMOUNT</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item, index) => {
                    const itemRate = Number(item.price) || 0;
                    const itemQty = Number(item.quantity) || 1;
                    const itemTotal = itemRate * itemQty * rentalDays;

                    return (
                      <tr key={index}>
                        <td className="equipment-name">
                          <strong>{item.name}</strong>
                          <span>{item.category || "Construction Equipment"}</span>
                        </td>
                        <td>{formatCurrency(itemRate)}</td>
                        <td>{itemQty}</td>
                        <td>{rentalDays}</td>
                        <td className="amount-cell">
                          {formatCurrency(itemTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* CUSTOMER SERVICE + CALCULATIONS */}
          <div className="invoice-bottom-grid">
            {/* CUSTOMER SERVICE */}
            <section className="customer-service-box">
              <div className="service-title">
                CUSTOMER SERVICE
              </div>
              <p className="service-subtitle">
                We're here to help with your rental.
              </p>

              <div className="service-features">
                <div className="service-feature">
                  <div className="service-icon">👤</div>
                  <strong>Personal</strong>
                  <span>Support</span>
                </div>

                <div className="service-feature">
                  <div className="service-icon">📞</div>
                  <strong>Quick</strong>
                  <span>Assistance</span>
                </div>

                <div className="service-feature">
                  <div className="service-icon">🛠️</div>
                  <strong>Equipment</strong>
                  <span>Support</span>
                </div>
              </div>

              <div className="service-contact">
                <div>
                  <span>PHONE</span>
                  <strong>9342836169</strong>
                </div>

                <div>
                  <span>EMAIL</span>
                  <strong>support@gdcentering.com</strong>
                </div>
              </div>
            </section>

            {/* CALCULATIONS & ADVANCE PAYMENT SPLIT */}
            <section className="calculation-box">
              <div className="calculation-row">
                <span>Rental Days</span>
                <strong>{rentalDays}</strong>
              </div>

              <div className="calculation-divider" />

              <div className="calculation-row">
                <span>Subtotal</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>

              <div className="calculation-row">
                <span>GST (18%)</span>
                <strong>{formatCurrency(gst)}</strong>
              </div>

              <div className="grand-total-row">
                <span>Grand Total</span>
                <strong>{formatCurrency(grandTotal)}</strong>
              </div>

              <div className="calculation-divider" />

              {/* 👉 50% Advance & Balance Breakdown on Invoice */}
              <div className="calculation-row" style={{ color: "#0284c7", fontWeight: "bold" }}>
                <span>Advance Paid (50%)</span>
                <strong>{formatCurrency(advancePayment)}</strong>
              </div>

              <div className="calculation-row" style={{ color: "#ef4444", fontWeight: "bold" }}>
                <span>Balance Due at Pickup</span>
                <strong>{formatCurrency(balanceAmount)}</strong>
              </div>
            </section>
          </div>

          {/* FOOTER */}
          <footer className="invoice-footer">
            <strong>GD Centering</strong>
            <span>Professional Construction Equipment Rental</span>
            <small>Generated automatically</small>
          </footer>

        </div>
      </main>

      {/* ACTION BUTTONS */}
      <div className="invoice-actions">
        <Link to="/products" className="back-button">
          ← Browse Equipment
        </Link>

        <button
          type="button"
          className="print-button"
          onClick={handlePrint}
        >
          🖨 Print Invoice
        </button>
      </div>

    </div>
  );
}

export default Invoice;