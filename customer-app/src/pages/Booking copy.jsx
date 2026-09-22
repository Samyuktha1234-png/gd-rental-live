import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import products from "../data/products";

function Booking() {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const productId = Number(queryParams.get("product"));

  const selectedProduct =
    products.find((product) => product.id === productId) || products[0];

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
  });

  const [booking, setBooking] = useState({
    productId: selectedProduct.id,
    quantity: 1,
    startDate: "",
    endDate: "",
    notes: "",
  });

  const [error, setError] = useState("");

  /*
   * Update selected product when URL changes
   */
  useEffect(() => {
    setBooking((previous) => ({
      ...previous,
      productId: selectedProduct.id,
    }));
  }, [selectedProduct.id]);

  /*
   * Find the currently selected equipment
   */
  const currentProduct =
    products.find((product) => product.id === Number(booking.productId)) ||
    selectedProduct;

  /*
   * Calculate number of rental days
   */
  const rentalDays = useMemo(() => {
    if (!booking.startDate || !booking.endDate) {
      return 0;
    }

    const start = new Date(`${booking.startDate}T00:00:00`);
    const end = new Date(`${booking.endDate}T00:00:00`);

    const difference = end.getTime() - start.getTime();

    if (difference < 0) {
      return 0;
    }

    return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
  }, [booking.startDate, booking.endDate]);

  /*
   * Automatic price calculation
   */
  const subtotal =
    currentProduct.price *
    Number(booking.quantity || 0) *
    rentalDays;

  /*
   * Tax calculation
   */
  const tax = subtotal * 0.18;

  /*
   * Final amount
   */
  const total = subtotal + tax;

  /*
   * Customer input handler
   */
  const handleCustomerChange = (event) => {
    const { name, value } = event.target;

    setCustomer((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  /*
   * Booking input handler
   */
  const handleBookingChange = (event) => {
    const { name, value } = event.target;

    setBooking((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  /*
   * Confirm booking
   */
  const handleSubmit = (event) => {
    event.preventDefault();

    if (!customer.name.trim()) {
      setError("Please enter the customer name.");
      return;
    }

    if (!customer.phone.trim()) {
      setError("Please enter the phone number.");
      return;
    }

    if (!customer.email.trim()) {
      setError("Please enter the email address.");
      return;
    }

    if (!customer.address.trim()) {
      setError("Please enter the customer address.");
      return;
    }

    if (!booking.startDate) {
      setError("Please select the rental start date.");
      return;
    }

    if (!booking.endDate) {
      setError("Please select the rental end date.");
      return;
    }

    if (rentalDays <= 0) {
      setError("End date must be the same as or after the start date.");
      return;
    }

    if (Number(booking.quantity) < 1) {
      setError("Quantity must be at least 1.");
      return;
    }

    const bookingId =
      "GD-" +
      Date.now().toString().slice(-8);

    const bookingData = {
      bookingId,

      customer,

      equipment: {
        id: currentProduct.id,
        name: currentProduct.name,
        category: currentProduct.category,
        price: currentProduct.price,
        unit: currentProduct.unit,
      },

      quantity: Number(booking.quantity),

      startDate: booking.startDate,

      endDate: booking.endDate,

      rentalDays,

      subtotal,

      tax,

      total,

      notes: booking.notes,

      bookingDate: new Date().toISOString(),

      status: "Confirmed",
    };

    /*
     * Save booking for Invoice page
     */
    localStorage.setItem(
      "gdRentalBooking",
      JSON.stringify(bookingData)
    );

    /*
     * Also keep a booking history
     */
    const existingBookings =
      JSON.parse(
        localStorage.getItem("gdRentalBookings") || "[]"
      );

    localStorage.setItem(
      "gdRentalBookings",
      JSON.stringify([
        ...existingBookings,
        bookingData,
      ])
    );

    /*
     * Move to invoice
     */
    navigate("/invoice");
  };

  return (
    <div className="booking-page">

      {/* HEADER */}

      <section className="booking-header">

        <div className="booking-header-content">

          <span className="section-label">
            RENTAL BOOKING
          </span>

          <h1>
            Book Your
            <span> Equipment</span>
          </h1>

          <p>
            Enter your details and rental requirements.
            The total amount will be calculated automatically.
          </p>

        </div>

      </section>


      {/* BOOKING CONTENT */}

      <section className="booking-section">

        <div className="booking-layout">

          {/* LEFT SIDE */}

          <form
            className="booking-form"
            onSubmit={handleSubmit}
          >

            {/* CUSTOMER INFORMATION */}

            <div className="booking-card">

              <div className="booking-card-heading">

                <div className="booking-step">
                  01
                </div>

                <div>
                  <h2>
                    Customer Information
                  </h2>

                  <p>
                    Enter the details of the person making the rental.
                  </p>
                </div>

              </div>


              <div className="form-grid">

                <div className="form-group">

                  <label>
                    Full Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter customer name"
                    value={customer.name}
                    onChange={handleCustomerChange}
                  />

                </div>


                <div className="form-group">

                  <label>
                    Phone Number *
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter phone number"
                    value={customer.phone}
                    onChange={handleCustomerChange}
                  />

                </div>


                <div className="form-group">

                  <label>
                    Email Address *
                  </label>

                  <input
                    type="email"
                    name="email"
                    placeholder="customer@email.com"
                    value={customer.email}
                    onChange={handleCustomerChange}
                  />

                </div>


                <div className="form-group">

                  <label>
                    City
                  </label>

                  <input
                    type="text"
                    name="city"
                    placeholder="Enter city"
                    value={customer.city}
                    onChange={handleCustomerChange}
                  />

                </div>


                <div className="form-group form-group-full">

                  <label>
                    Address *
                  </label>

                  <textarea
                    name="address"
                    rows="3"
                    placeholder="Enter complete address"
                    value={customer.address}
                    onChange={handleCustomerChange}
                  />

                </div>

              </div>

            </div>


            {/* EQUIPMENT INFORMATION */}

            <div className="booking-card">

              <div className="booking-card-heading">

                <div className="booking-step">
                  02
                </div>

                <div>
                  <h2>
                    Rental Equipment
                  </h2>

                  <p>
                    Select the equipment and rental quantity.
                  </p>
                </div>

              </div>


              <div className="equipment-selection">

                <div className="selected-equipment-icon">
                  {currentProduct.icon}
                </div>

                <div className="selected-equipment-info">

                  <span>
                    {currentProduct.category}
                  </span>

                  <h3>
                    {currentProduct.name}
                  </h3>

                  <p>
                    ₹{currentProduct.price} per day
                  </p>

                </div>

                <Link
                  to="/products"
                  className="change-equipment"
                >
                  Change
                </Link>

              </div>


              <div className="form-grid">

                <div className="form-group">

                  <label>
                    Equipment
                  </label>

                  <select
                    name="productId"
                    value={booking.productId}
                    onChange={handleBookingChange}
                  >

                    {products.map((product) => (

                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.name} — ₹{product.price}/day
                      </option>

                    ))}

                  </select>

                </div>


                <div className="form-group">

                  <label>
                    Quantity *
                  </label>

                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    value={booking.quantity}
                    onChange={handleBookingChange}
                  />

                </div>

              </div>

            </div>


            {/* RENTAL DATES */}

            <div className="booking-card">

              <div className="booking-card-heading">

                <div className="booking-step">
                  03
                </div>

                <div>
                  <h2>
                    Rental Period
                  </h2>

                  <p>
                    Select when you need the equipment.
                  </p>
                </div>

              </div>


              <div className="form-grid">

                <div className="form-group">

                  <label>
                    Rental Start Date *
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={booking.startDate}
                    onChange={handleBookingChange}
                  />

                </div>


                <div className="form-group">

                  <label>
                    Rental End Date *
                  </label>

                  <input
                    type="date"
                    name="endDate"
                    value={booking.endDate}
                    onChange={handleBookingChange}
                  />

                </div>

              </div>


              <div className="rental-days-display">

                <span>
                  Rental Duration
                </span>

                <strong>
                  {rentalDays > 0
                    ? `${rentalDays} Day${rentalDays > 1 ? "s" : ""}`
                    : "--"}
                </strong>

              </div>

            </div>


            {/* NOTES */}

            <div className="booking-card">

              <div className="booking-card-heading">

                <div className="booking-step">
                  04
                </div>

                <div>
                  <h2>
                    Additional Information
                  </h2>

                  <p>
                    Add any special requirements if needed.
                  </p>
                </div>

              </div>


              <div className="form-group">

                <label>
                  Notes / Special Requirements
                </label>

                <textarea
                  name="notes"
                  rows="4"
                  placeholder="Enter any additional requirements..."
                  value={booking.notes}
                  onChange={handleBookingChange}
                />

              </div>

            </div>


            {/* ERROR */}

            {error && (

              <div className="booking-error">
                ⚠ {error}
              </div>

            )}


            {/* SUBMIT */}

            <button
              type="submit"
              className="confirm-booking-button"
            >
              Confirm Booking →
            </button>

          </form>


          {/* RIGHT SIDE — PRICE SUMMARY */}

          <aside className="booking-summary">

            <div className="summary-card">

              <div className="summary-top">

                <span>
                  RENTAL SUMMARY
                </span>

                <div className="summary-icon">
                  ₹
                </div>

              </div>


              <h2>
                {currentProduct.name}
              </h2>

              <p className="summary-category">
                {currentProduct.category}
              </p>


              <div className="summary-divider" />


              <div className="summary-row">

                <span>
                  Daily Rate
                </span>

                <strong>
                  ₹{currentProduct.price}
                </strong>

              </div>


              <div className="summary-row">

                <span>
                  Quantity
                </span>

                <strong>
                  {booking.quantity}
                </strong>

              </div>


              <div className="summary-row">

                <span>
                  Rental Days
                </span>

                <strong>
                  {rentalDays || "--"}
                </strong>

              </div>


              <div className="summary-divider" />


              <div className="summary-row">

                <span>
                  Subtotal
                </span>

                <strong>
                  ₹{subtotal.toFixed(2)}
                </strong>

              </div>


              <div className="summary-row">

                <span>
                  GST (18%)
                </span>

                <strong>
                  ₹{tax.toFixed(2)}
                </strong>

              </div>


              <div className="summary-total">

                <span>
                  Total Amount
                </span>

                <strong>
                  ₹{total.toFixed(2)}
                </strong>

              </div>


              <div className="summary-note">

                <span>
                  🔒
                </span>

                Your booking information is securely
                stored in this browser.

              </div>

            </div>


            <div className="booking-help-card">

              <div>
                ?
              </div>

              <section>

                <h3>
                  Need Help?
                </h3>

                <p>
                  Contact our rental team for equipment
                  availability and pricing assistance.
                </p>

                <Link to="/contact">
                  Contact Us →
                </Link>

              </section>

            </div>

          </aside>

        </div>

      </section>

    </div>
  );
}

export default Booking;