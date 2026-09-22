import React, { useEffect, useState } from "react";
import logoImg from "./assets/logo.png";

function App() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [returnModal, setReturnModal] = useState(null);
  const [actualDays, setActualDays] = useState(1);
  const [defectCharges, setDefectCharges] = useState(0);
  
  // Track which items are selected (checked) for return
  const [selectedForReturn, setSelectedForReturn] = useState({});

  const fetchBookings = async () => {
    try {
      const response = await fetch("https://gd-and-associates.onrender.com/api/products");
      const result = await response.json();
      if (result.success) {
        setBookings(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // UTILITY: Calculate true rental days based on dates to avoid DB corruption errors
  const getTrueRentalDays = (start, end, fallback) => {
    if (!start || !end) return fallback || 1;
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return fallback || 1;
    
    // Use UTC to prevent daylight saving time differences from skewing the day count
    const utc1 = Date.UTC(s.getFullYear(), s.getMonth(), s.getDate());
    const utc2 = Date.UTC(e.getFullYear(), e.getMonth(), e.getDate());
    
    // +1 ensures inclusive counting (e.g. 15th to 19th = 5 days)
    const diffDays = Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : (fallback || 1);
  };

  const handleConfirmAdvance = async (bookingId) => {
    try {
      const response = await fetch(`https://gd-and-associates.onrender.com:5000:5000/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Advance Paid & Confirmed" })
      });
      
      const result = await response.json();
      if (result.success) {
        alert("Advance payment confirmed in database!");
        fetchBookings(); 
        setActiveInvoice(result.data); 
      }
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update status. Check backend connection.");
    }
  };

  // NEW FEATURE: Instantly clear dues and mark as Payment Completed
  const handleClearDues = async (booking) => {
    if (!window.confirm(`Are you sure you want to clear the due of ₹${booking.balanceAmount.toFixed(2)}? This will mark the payment as completed.`)) return;

    try {
      const response = await fetch(`https://gd-and-associates.onrender.com:5000:5000/api/bookings/${booking._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "Payment Completed",
          advancePayment: booking.totalPrice, // Force advance to match total, making balance 0
          balanceAmount: 0 
        })
      });
      
      const result = await response.json();
      if (result.success) {
        alert("Payment Completed and dues cleared!");
        
        // Force frontend override
        const finalData = { 
          ...booking, 
          status: "Payment Completed",
          advancePayment: booking.totalPrice,
          balanceAmount: 0 
        };
        
        setBookings(prev => prev.map(b => b._id === finalData._id ? finalData : b));
        if (activeInvoice && activeInvoice._id === finalData._id) {
          setActiveInvoice(finalData);
        }
      }
    } catch (error) {
      console.error("Clear dues failed:", error);
      alert("Failed to clear dues. Check backend connection.");
    }
  };

  const handleFinalizeReturn = async () => {
    if (!returnModal) return;

    const trueEstDays = getTrueRentalDays(returnModal.startDate, returnModal.endDate, returnModal.rentalDays);

    // 1. Calculate updated items based on exactly what was checked
    const updatedItems = returnModal.items.map((item, i) => {
      const pendingQty = item.quantity - (item.returnedQty || 0);
      const returningNow = selectedForReturn[i] ? pendingQty : 0;
      
      // ONLY assign the typed "actualDays" to the specific items being returned right now
      const currentDaysUsed = returningNow > 0 ? Number(actualDays) : (item.daysUsed || trueEstDays);

      return {
        ...item,
        returnedQty: (item.returnedQty || 0) + returningNow,
        daysUsed: currentDaysUsed
      };
    });

    // 2. Check if ALL items are now fully returned
    const isFullyReturned = updatedItems.every(item => item.returnedQty >= item.quantity);
    let newStatus = isFullyReturned ? "Completed" : "Partially Returned";

    // 3. SMART BILLING: Calculate subtotal based on Returned vs Pending independently
    const newSubtotal = updatedItems.reduce((sum, item) => {
      const returned = item.returnedQty || 0;
      const pending = item.quantity - returned;
      
      const returnedCost = returned * item.price * (item.daysUsed || trueEstDays);
      const pendingCost = pending * item.price * trueEstDays;
      
      return sum + returnedCost + pendingCost;
    }, 0);
    
    const newTotal = newSubtotal + Number(defectCharges);
    const newBalance = newTotal - returnModal.advancePayment;

    // If they overpaid or balance is 0 after this calculation, auto-flag it as Payment Completed
    if (newBalance <= 0 && isFullyReturned) newStatus = "Payment Completed";

    try {
      const response = await fetch(`https://gd-and-associates.onrender.com:5000:5000/api/bookings/${returnModal._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: newStatus,
          rentalDays: trueEstDays, 
          subtotal: newSubtotal,
          otherCharges: Number(defectCharges),
          totalPrice: newTotal,
          balanceAmount: newBalance,
          items: updatedItems 
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(isFullyReturned ? "Equipment returned and bill updated!" : "Partial return recorded successfully!");
        
        // FORCE FRONTEND OVERRIDE: Update local state immediately with perfect math
        const finalData = { 
          ...result.data, 
          status: newStatus,
          items: updatedItems, 
          subtotal: newSubtotal,
          otherCharges: Number(defectCharges),
          totalPrice: newTotal,
          balanceAmount: newBalance,
          rentalDays: trueEstDays 
        };
        
        setBookings(prev => prev.map(b => b._id === finalData._id ? finalData : b));
        setActiveInvoice(finalData);
        setReturnModal(null); 
      }
    } catch (error) {
      console.error("Finalize failed:", error);
      alert("Failed to finalize return. Check backend connection.");
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    const customerName = booking.customer?.name?.toLowerCase() || "";
    const customerPhone = booking.customer?.phone || "";
    const bookingId = booking.bookingId?.toLowerCase() || "";
    
    const hasMatchingItem = booking.items?.some((item) => 
      item.name.toLowerCase().includes(term)
    );

    const matchesPhone = term.length > 3 ? customerPhone.includes(term) : false;

    return (
      customerName.includes(term) ||
      bookingId.includes(term) ||
      matchesPhone ||
      hasMatchingItem
    );
  });

  const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString; 
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  /* ====================================================================
     VIEW: BILL BOOK INVOICE PRINT SCREEN
  ==================================================================== */
  if (activeInvoice) {
    const b = activeInvoice;
    const currentDate = new Date().toLocaleDateString('en-GB'); 
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    const trueEstDays = getTrueRentalDays(b.startDate, b.endDate, b.rentalDays);

    // DYNAMIC INVOICE SPLITTER: Splits items into separate "Returned" rows and "Pending" rows
    const displayItems = [];
    b.items.forEach((item) => {
      const returned = item.returnedQty || 0;
      const pending = item.quantity - returned;

      if (pending > 0) {
        displayItems.push({
          name: `${item.name} (Pending)`,
          quantity: pending,
          price: item.price,
          days: trueEstDays, // Pending items always show the true estimated length
          amount: pending * item.price * trueEstDays,
          isReturned: false
        });
      }

      if (returned > 0) {
        displayItems.push({
          name: `${item.name} (Returned)`,
          quantity: returned,
          price: item.price,
          days: item.daysUsed || trueEstDays, // Returned items show the specific days used
          amount: returned * item.price * (item.daysUsed || trueEstDays),
          isReturned: true
        });
      }
    });

    const itemsSubtotal = displayItems.reduce((sum, item) => sum + item.amount, 0);

    // Determine the clear cut invoice type based on return status
    let invoiceLabel = "ADVANCE INVOICE";
    if (b.status === "Completed" || b.status === "Payment Completed") invoiceLabel = "FINAL INVOICE";
    else if (b.status === "Partially Returned") invoiceLabel = "PARTIAL RETURN INVOICE";

    return (
      <div style={{ backgroundColor: "#e2e8f0", minHeight: "100vh", padding: "20px", fontFamily: "Arial, sans-serif" }}>
        
        <div className="print-area" style={{ 
          maxWidth: "210mm", 
          margin: "0 auto", 
          backgroundColor: "#fff", 
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          position: "relative" 
        }}>
          
          {/* PAGE 1: INVOICE */}
          <div className="watermarked-page invoice-page" style={{ padding: "1in 20px", minHeight: "280mm", position: "relative", boxSizing: "border-box", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                <img src={logoImg} alt="GD Logo" style={{ height: "65px", objectFit: "contain" }} onError={(e) => { e.target.style.display = 'none'; }} />
                <div>
                  <h1 style={{ margin: 0, color: "#0284c7", fontSize: "26px", fontWeight: "900", letterSpacing: "1px" }}>GD & ASSOCIATES</h1>
                  <div style={{ color: "#0284c7", fontSize: "12px", marginTop: "2px", fontWeight: "500", lineHeight: "1.3" }}>
                    <p style={{ margin: 0 }}>204, K.P Nagar By Pass Road,</p>
                    <p style={{ margin: 0 }}>Sungam, Coimbatore - 641045</p>
                    <p style={{ margin: 0 }}>gdandassociatesdeena@gmail.com</p>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "center", fontSize: "15px", lineHeight: "1.5", fontWeight: "bold", border: "1px solid #000", padding: "6px 18px", borderRadius: "4px" }}>
                <div style={{ borderBottom: "1px dashed #000", paddingBottom: "3px", marginBottom: "3px" }}>
                  9894259999
                </div>
                <div>
                  9047593999
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center", borderTop: "2px solid #000", borderBottom: "2px solid #000", padding: "6px 0", margin: "10px 0", backgroundColor: "#f8fafc", position: "relative", zIndex: 1 }}>
              <h2 style={{ margin: 0, fontSize: "18px", letterSpacing: "2px", fontWeight: "bold", textTransform: "uppercase" }}>
                MATERIAL OUTWARD / TAKEN
                <span style={{ fontSize: "13px", fontWeight: "normal", color: "#555", marginLeft: "8px" }}>
                  ({invoiceLabel})
                </span>
              </h2>
            </div>

            <div style={{ display: "flex", border: "2px solid #000", marginBottom: "12px", position: "relative", zIndex: 1 }}>
              <div style={{ width: "60%", borderRight: "2px solid #000", padding: "10px 12px", fontSize: "14px", lineHeight: "1.8" }}>
                <div style={{ display: "flex" }}>
                  <strong style={{ width: "60px" }}>S. No.</strong>
                  <strong style={{ width: "15px" }}>:</strong>
                  <span>{b.bookingId}</span>
                </div>
                <div style={{ display: "flex", marginTop: "4px" }}>
                  <strong style={{ width: "60px" }}>Name</strong>
                  <strong style={{ width: "15px" }}>:</strong>
                  <span style={{ flexGrow: 1, borderBottom: "1px dashed #000" }}></span>
                </div>
                <div style={{ display: "flex", marginTop: "10px" }}>
                  <strong style={{ width: "60px" }}>Site</strong>
                  <strong style={{ width: "15px" }}>:</strong>
                  <span style={{ flexGrow: 1, borderBottom: "1px dashed #000" }}></span>
                </div>
              </div>
              <div style={{ width: "40%", padding: "10px 12px", fontSize: "14px", lineHeight: "1.8", display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
                <p style={{ margin: 0 }}><strong>Date :</strong> {currentDate}</p>
                <p style={{ margin: "4px 0 0 0" }}><strong>Time :</strong> {currentTime}</p>
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", border: "2px solid #000", marginBottom: "0", position: "relative", zIndex: 1, textAlign: "center" }}>
              <thead>
                <tr style={{ backgroundColor: "#f1f5f9" }}>
                  <th style={{ border: "1px solid #000", padding: "8px", width: "8%" }}>S.No.</th>
                  <th style={{ border: "1px solid #000", padding: "8px", width: "45%" }}>Particulars</th>
                  <th style={{ border: "1px solid #000", padding: "8px", width: "12%" }}>Quantity</th>
                  <th style={{ border: "1px solid #000", padding: "8px", width: "15%" }}>Rate/Day</th>
                  <th style={{ border: "1px solid #000", padding: "8px", width: "20%" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {displayItems.map((item, i) => (
                  <tr key={i}>
                    <td style={{ border: "1px solid #000", padding: "8px" }}>{i + 1}</td>
                    <td style={{ border: "1px solid #000", padding: "8px", textAlign: "left", fontWeight: "bold" }}>
                      {item.name}
                      {/* Explicitly diffentiate between Returned (Billed) and Pending (Estimated) */}
                      <span style={{ display: "block", fontSize: "11px", color: item.isReturned ? "#047857" : "#b45309", marginTop: "2px" }}>
                        ({item.isReturned ? `Billed for ${item.days} days` : `Est. for ${item.days} days`})
                      </span>
                    </td>
                    <td style={{ border: "1px solid #000", padding: "8px" }}>{item.quantity}</td>
                    <td style={{ border: "1px solid #000", padding: "8px" }}>₹{item.price}</td>
                    <td style={{ border: "1px solid #000", padding: "8px" }}>₹{item.amount.toFixed(2)}</td>
                  </tr>
                ))}

                <tr>
                  <td colSpan="3" rowSpan="5" style={{ border: "1px solid #000", padding: "10px", textAlign: "left", verticalAlign: "top", backgroundColor: "transparent", zIndex: 2, position: "relative" }}>
                    <p style={{ margin: "0 0 5px 0", fontSize: "14px" }}>Est. Rental Days: <strong style={{ fontSize: "15px" }}>{trueEstDays}</strong></p>
                    <div style={{ fontSize: "13px", lineHeight: "1.6", color: "#334155" }}>
                      <div>From : <strong>{formatDateToDDMMYYYY(b.startDate)}</strong></div>
                      <div>To &nbsp;&nbsp;&nbsp;&nbsp;: <strong>{formatDateToDDMMYYYY(b.endDate)}</strong></div>
                    </div>
                  </td>
                  <td style={{ border: "1px solid #000", padding: "6px 10px", textAlign: "right", fontWeight: "bold", whiteSpace: "nowrap", backgroundColor: "transparent", zIndex: 2, position: "relative" }}>Items Total :</td>
                  <td style={{ border: "1px solid #000", padding: "6px 10px", fontWeight: "bold", backgroundColor: "transparent", zIndex: 2, position: "relative" }}>₹{itemsSubtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "6px 10px", textAlign: "right", fontWeight: "bold", whiteSpace: "nowrap", color: "#d97706", backgroundColor: "transparent", zIndex: 2, position: "relative" }}>Other Charges :</td>
                  <td style={{ border: "1px solid #000", padding: "6px 10px", fontWeight: "bold", color: "#d97706", backgroundColor: "transparent", zIndex: 2, position: "relative" }}>₹{(b.otherCharges || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "6px 10px", textAlign: "right", fontWeight: "bold", whiteSpace: "nowrap", backgroundColor: "transparent", zIndex: 2, position: "relative" }}>Grand Total :</td>
                  <td style={{ border: "1px solid #000", padding: "6px 10px", fontWeight: "bold", fontSize: "15px", backgroundColor: "transparent", zIndex: 2, position: "relative" }}>₹{b.totalPrice.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "6px 10px", textAlign: "right", fontWeight: "bold", whiteSpace: "nowrap", backgroundColor: "transparent", zIndex: 2, position: "relative" }}>Advance Paid :</td>
                  <td style={{ border: "1px solid #000", padding: "6px 10px", fontWeight: "bold", backgroundColor: "transparent", zIndex: 2, position: "relative" }}>₹{b.advancePayment.toFixed(2)}</td>
                </tr>
                <tr style={{ backgroundColor: (b.status === "Completed" || b.status === "Payment Completed") ? "#d1fae5" : "#fee2e2" }}>
                  <td style={{ border: "1px solid #000", padding: "8px 10px", textAlign: "right", fontWeight: "bold", whiteSpace: "nowrap", zIndex: 2, position: "relative" }}>
                    {b.status === "Completed" || b.status === "Payment Completed" ? "Final Balance Settled :" : "Balance Due :"}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "8px 10px", fontWeight: "bold", fontSize: "15px", zIndex: 2, position: "relative" }}>₹{b.balanceAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ border: "2px solid #000", borderBottom: "none", padding: "8px 10px", flexGrow: 1, position: "relative", zIndex: 1, backgroundColor: "transparent" }}>
              <span style={{ fontWeight: "bold", fontSize: "14px" }}>Important Note :</span>
            </div>

            <div style={{ display: "flex", border: "2px solid #000", position: "relative", zIndex: 1, backgroundColor: "transparent" }}>
              
              <div style={{ width: "35%", borderRight: "2px solid #000", padding: "12px", fontSize: "13px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "100px 10px 1fr", rowGap: "10px", alignItems: "end" }}>
                  <div style={{ fontWeight: "bold" }}>Customer Name</div>
                  <div style={{ fontWeight: "bold" }}>:</div>
                  <div style={{ fontFamily: "monospace", fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.customer.name}</div>
                  
                  <div style={{ fontWeight: "bold" }}>Cell No.</div>
                  <div style={{ fontWeight: "bold" }}>:</div>
                  <div style={{ fontFamily: "monospace", fontSize: "14px" }}>{b.customer.phone}</div>
                  
                  <div style={{ fontWeight: "bold" }}>Vehicle No.</div>
                  <div style={{ fontWeight: "bold" }}>:</div>
                  <div style={{ color: "#555" }}>...................................</div>
                  
                  <div style={{ fontWeight: "bold" }}>Driver Name</div>
                  <div style={{ fontWeight: "bold" }}>:</div>
                  <div style={{ color: "#555" }}>...................................</div>
                  
                  <div style={{ fontWeight: "bold" }}>Contact No.</div>
                  <div style={{ fontWeight: "bold" }}>:</div>
                  <div style={{ color: "#555" }}>...................................</div>
                </div>
              </div>

              <div style={{ width: "30%", borderRight: "2px solid #000", padding: "12px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ textAlign: "center", marginTop: "45px", borderTop: "1px dashed #000", paddingTop: "4px", width: "80%", margin: "45px auto 0 auto" }}>
                  Signature
                </div>
                <div style={{ textAlign: "center", marginTop: "45px", borderTop: "1px dashed #000", paddingTop: "4px", width: "80%", margin: "45px auto 0 auto" }}>
                  Driver Signature
                </div>
              </div>

              <div style={{ width: "35%", padding: "12px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ border: "2px solid #000", padding: "8px", backgroundColor: "#f8fafc" }}>
                  <p style={{ margin: "0 0 4px 0", color: "#0284c7", fontWeight: "900", fontSize: "15px", textTransform: "uppercase" }}>Not for Sale</p>
                  <p style={{ margin: 0, color: "#dc2626", fontWeight: "900", fontSize: "13px", textTransform: "uppercase" }}>This Material is only for Lease</p>
                </div>
                <div style={{ marginTop: "25px" }}>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: "bold", whiteSpace: "nowrap" }}>
                    For : GD & ASSOCIATES
                  </p>
                  <div style={{ marginTop: "45px", borderTop: "1px dashed #000", paddingTop: "4px", width: "80%", margin: "45px auto 0 auto" }}>
                    Authorized Signatory
                  </div>
                </div>
              </div>
            </div>

          </div>
          
          {/* PAGE 2: TERMS AND CONDITIONS */}
          <div className="watermarked-page terms-page" style={{ padding: "1in 20px", minHeight: "280mm", position: "relative", boxSizing: "border-box", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ border: "2px solid #000", padding: "30px 40px", flexGrow: 1, boxSizing: "border-box", backgroundColor: "transparent", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              
              <div>
                <div style={{ textAlign: "center", marginBottom: "25px" }}>
                  <span style={{ backgroundColor: "#222", color: "#fff", padding: "8px 25px", borderRadius: "6px", fontSize: "18px", fontWeight: "bold" }}>
                    ஒப்பந்தம் & விதிமுறைகள்
                  </span>
                </div>

                <h3 style={{ textDecoration: "underline", fontSize: "16px", marginBottom: "15px", color: "#000" }}>நிபந்தனைகள்</h3>

                <ol style={{ fontSize: "13px", lineHeight: "1.9", paddingLeft: "20px", textAlign: "justify", color: "#000", margin: 0 }}>
                  <li>வாடகைக்கு எடுத்த பொருட்கள் சேதமடைந்தால் அதற்கு முழு பொறுப்பு ஏற்று அதற்கான பணத்தை கொடுக்க வேண்டும்.</li>
                  <li>சீட், காளம் பாக்ஸ், ஜாக்கி, ஸ்பேன் திருப்பி ஒப்படைக்கும் போது நன்றாக சுத்தம் செய்து ஆயில் போட்டு கொடுக்க வேண்டும், இல்லை என்றால் சுத்தம் செய்து ஆயில் அடிக்கும் லேபர் தொகை அட்வான்சில் பிடித்தம் செய்யப்படும்.</li>
                  <li>பொருட்களை வாடகைக்கு எடுக்கும் போது 45 நாட்களுக்கு உண்டான பணத்தை முன் பணமாக கொடுக்க வேண்டும்.</li>
                  <li>வாடகை பொருட்கள் குறிப்பிட்ட சைட்டை தவிர வேறு சைட்-ல் கண்டிப்பாக உபயோகிக்கக்கூடாது.</li>
                  <li>கட்டிட உரிமையாளர் [Aadhaar Redacted] நகல் சமர்ப்பிக்க வேண்டும்.</li>
                  <li>பில்டிங் சென்ட்ரிங் காண்டிராக்டர் மற்றும் உரிமையாளர் இடையில் ஏதேனும் மனக்கசப்பு ஏற்படும் பட்சத்தில் எங்களது நிறுவனத்திற்கு யாருடைய அனுமதியும் இன்றி எங்களுடைய பொருட்களை திரும்ப எடுத்துக் கொள்ளும் உரிமை உள்ளது.</li>
                  <li>வாடகைத் தொகை 50000 க்கு மேல் இருந்தால், 20 ரூபாய் முத்திரைத் தாளில் ஒப்பந்தம் கையொப்பமிட வேண்டும்.</li>
                </ol>
              </div>

              <div style={{ fontSize: "13px", lineHeight: "1.6", color: "#000" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                   <div>சீட் எடுக்கும் வாகன எண் : ..............................................................</div>
                   <div>செல் நெ : ..............................................</div>
                 </div>

                 <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                   <div>
                     <p style={{ fontWeight: "bold", margin: "0 0 5px 0" }}>குறிப்பு:</p>
                     <p style={{ margin: 0 }}>மேற்கண்ட நிபந்தனைகள் அனைத்திற்கும் சம்மதிக்கிறேன்</p>
                     <p style={{ margin: "10px 0 0 0" }}>வாடகைக்கு எடுப்பவரது கையொப்பம்</p>
                   </div>
                   <div style={{ textAlign: "right" }}>
                     <p style={{ margin: 0, fontSize: "12px", fontWeight: "bold", whiteSpace: "nowrap" }}>
                       For : GD & ASSOCIATES
                     </p>
                   </div>
                 </div>
              </div>

            </div>
          </div>

        </div>

        {/* Action Buttons (Hidden during Print) */}
        <div style={{ textAlign: "center", marginTop: "30px" }} className="no-print">
          <button onClick={() => window.print()} style={{ padding: "12px 25px", backgroundColor: "#0ea5e9", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", marginRight: "15px", fontSize: "16px", fontWeight: "bold", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
            🖨 Print 2-Sided Invoice
          </button>
          <button onClick={() => setActiveInvoice(null)} style={{ padding: "12px 25px", backgroundColor: "#64748b", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px", fontWeight: "bold", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
            Close Invoice
          </button>
        </div>

        <style>{`
          .watermarked-page {
            position: relative;
          }
          .watermarked-page::before {
            content: "";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 350px;
            height: 350px;
            background-image: url(${JSON.stringify(logoImg)});
            background-repeat: no-repeat;
            background-position: center;
            background-size: contain;
            opacity: 0.07;
            pointer-events: none;
            z-index: 0;
          }

          @media print { 
            @page {
              size: A4;
              margin: 0;
            }

            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; padding: 0; }
            .no-print { display: none !important; } 
            
            /* Clean single page break between the two sheets */
            .invoice-page {
              page-break-after: always !important;
              break-after: page !important;
            }
          }
        `}</style>
      </div>
    );
  }

  /* ====================================================================
     VIEW: MAIN MANAGEMENT DASHBOARD
  ==================================================================== */
  return (
    <div style={{ backgroundColor: "#f1f5f9", minHeight: "100vh", fontFamily: "sans-serif" }}>
      
      <style>
        {`
          .admin-booking-card {
            transition: all 0.3s ease-in-out;
          }
          .admin-booking-card:hover {
            border-color: #0ea5e9 !important; 
            box-shadow: 0 8px 20px rgba(14, 165, 233, 0.2) !important;
            transform: translateY(-2px);
          }
          
          .modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;
          }
        `}
      </style>

      {returnModal && (
        <div className="modal-overlay">
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", width: "450px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <h2 style={{ margin: "0 0 20px 0", color: "#0f172a" }}>Finalize Return</h2>
            <p style={{ margin: "0 0 20px 0", fontSize: "14px", color: "#64748b" }}>
              Booking ID: <strong>{returnModal.bookingId}</strong><br/>
              Originally booked for <strong>{getTrueRentalDays(returnModal.startDate, returnModal.endDate, returnModal.rentalDays)} days</strong>.
            </p>

            {/* PARTIAL RETURN CHECKBOX UI (Defaults to Unchecked) */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "bold" }}>Select Items Returning Now:</label>
              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                {returnModal.items.map((item, i) => {
                  const maxReturn = item.quantity - (item.returnedQty || 0);
                  
                  if (maxReturn <= 0) {
                    return (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#10b981", marginBottom: "8px" }}>
                        <span style={{ fontWeight: "bold" }}>✓ {item.name}</span>
                        <span>Fully Returned</span>
                      </div>
                    );
                  }

                  return (
                    <label key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", cursor: "pointer", userSelect: "none" }}>
                      <span style={{ fontSize: "13px", color: "#334155" }}>
                        {item.name} <span style={{ color: "#ef4444" }}>(Pending: {maxReturn})</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={!!selectedForReturn[i]}
                        onChange={(e) => setSelectedForReturn({...selectedForReturn, [i]: e.target.checked})}
                        style={{ transform: "scale(1.2)", cursor: "pointer", accentColor: "#10b981" }}
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "bold" }}>Actual Days Used (for checked items):</label>
              <input 
                type="number" 
                min="1" 
                value={actualDays} 
                onChange={(e) => setActualDays(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
              />
              <small style={{ color: "#0284c7" }}>This updates the bill for the checked items only. Unchecked items keep original estimate.</small>
            </div>

            <div style={{ marginBottom: "25px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "bold" }}>Defect/Damage Charges (₹):</label>
              <input 
                type="number" 
                min="0" 
                value={defectCharges} 
                onChange={(e) => setDefectCharges(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                onClick={handleFinalizeReturn} 
                style={{ flex: 1, backgroundColor: "#10b981", color: "white", border: "none", padding: "12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
              >
                Confirm Return & Update Bill
              </button>
              <button 
                onClick={() => setReturnModal(null)} 
                style={{ backgroundColor: "#e2e8f0", color: "#334155", border: "none", padding: "12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER WITH LOGO AND TITLE CENTERED */}
      <header style={{ backgroundColor: "white", padding: "15px 30px", display: "flex", justifyContent: "center", alignItems: "center", gap: "15px", borderBottom: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
        <img src={logoImg} alt="GD Logo" style={{ height: "50px", objectFit: "contain" }} onError={(e) => { e.target.style.display = 'none'; }} />
        <h2 style={{ margin: "0", fontSize: "24px", color: "#0f172a", fontWeight: "bold", letterSpacing: "0.5px" }}>
          GD & ASSOCIATES
        </h2>
      </header>

      <div style={{ padding: "40px 20px", maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ marginBottom: "20px", textAlign: "center" }}>
          <h1 style={{ marginTop: "10px", color: "#1e293b", marginBottom: "25px" }}>Active Bookings & Returns</h1>
        </div>

        <div style={{ marginBottom: "30px" }}>
          <input
            type="text"
            placeholder="🔍 Search by Customer Name, Phone, Booking ID, or Equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", padding: "14px 20px", fontSize: "16px", borderRadius: "8px", border: "1px solid #cbd5e1", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {loading ? (
          <p style={{ textAlign: "center" }}>Loading database...</p>
        ) : filteredBookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <h2>No Bookings Found</h2>
            <p style={{ color: "#64748b" }}>Try adjusting your search terms.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {filteredBookings.map((booking) => {
              const customer = booking.customer || {};
              const isPending = booking.status === "Pending Advance";
              const isConfirmed = booking.status === "Advance Paid & Confirmed";
              const isPartial = booking.status === "Partially Returned";
              const isCompleted = booking.status === "Completed";
              const isPaymentCompleted = booking.status === "Payment Completed";
              
              // We check if any items are actually still pending
              const hasPendingItems = booking.items?.some(item => (item.quantity - (item.returnedQty || 0)) > 0);
              
              const isSearched = searchTerm.trim() !== "";
              const trueEstDays = getTrueRentalDays(booking.startDate, booking.endDate, booking.rentalDays);

              return (
                <div 
                  key={booking._id} 
                  className="admin-booking-card"
                  style={{ 
                    background: "white", 
                    borderRadius: "12px", 
                    padding: "24px", 
                    border: isSearched ? "3px solid #0284c7" : "1px solid #e2e8f0",
                    boxShadow: isSearched ? "0 8px 25px rgba(2, 132, 199, 0.25)" : "none",
                    transform: isSearched ? "translateY(-2px)" : "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #f1f5f9", paddingBottom: "15px", marginBottom: "15px" }}>
                    <div>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "bold" }}>BOOKING ID: {booking.bookingId}</span>
                        {isPaymentCompleted && <span style={{ fontSize: "10px", backgroundColor: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "12px", fontWeight: "bold" }}>PAYMENT COMPLETED</span>}
                        {isCompleted && !isPaymentCompleted && <span style={{ fontSize: "10px", backgroundColor: "#d1fae5", color: "#047857", padding: "2px 8px", borderRadius: "12px", fontWeight: "bold" }}>COMPLETED</span>}
                        {isConfirmed && <span style={{ fontSize: "10px", backgroundColor: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "12px", fontWeight: "bold" }}>ACTIVE RENTAL</span>}
                        {isPartial && !isPaymentCompleted && <span style={{ fontSize: "10px", backgroundColor: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: "12px", fontWeight: "bold" }}>PARTIAL RETURN</span>}
                      </div>
                      <h3 style={{ margin: "4px 0 0 0", fontSize: "18px" }}>{customer.name} ({customer.phone})</h3>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "15px", marginBottom: "20px", fontSize: "14px", color: "#334155" }}>
                    <div><strong>Days:</strong> {trueEstDays} (Est: {formatDateToDDMMYYYY(booking.startDate)} to {formatDateToDDMMYYYY(booking.endDate)})</div>
                    <div><strong>Total Amount:</strong> ₹{booking.totalPrice?.toFixed(2)}</div>
                    <div><strong style={{ color: "#0284c7" }}>Advance:</strong> ₹{booking.advancePayment?.toFixed(2)}</div>
                    <div><strong style={{ color: (isCompleted || isPaymentCompleted) ? "#10b981" : "#ef4444" }}>{(isCompleted || isPaymentCompleted) ? "Final Settled:" : "Balance:"}</strong> ₹{booking.balanceAmount?.toFixed(2)}</div>
                  </div>

                  <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>
                    <strong style={{ fontSize: "13px", color: "#475569", display: "block", marginBottom: "6px" }}>Rented Items:</strong>
                    <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px", color: "#334155" }}>
                      {booking.items?.map((item, i) => (
                        <li key={i}>
                          {item.name} — Qty: {item.quantity} (₹{item.price}/day) 
                          {item.returnedQty > 0 && <strong style={{ color: "#047857", marginLeft: "8px" }}>[Returned: {item.returnedQty}]</strong>}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                    {isPending && (
                      <button onClick={() => handleConfirmAdvance(booking._id)} style={{ backgroundColor: "#10b981", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                        ✓ Confirm Advance Paid
                      </button>
                    )}
                    
                    {/* The Process Return button stays visible as long as items are pending, even if they already paid! */}
                    {hasPendingItems && !isPending && (
                      <button 
                        onClick={() => {
                          setReturnModal(booking);
                          setActualDays(trueEstDays); 
                          setDefectCharges(0);
                          
                          const initialSelections = {};
                          booking.items.forEach((item, i) => {
                            initialSelections[i] = false;
                          });
                          setSelectedForReturn(initialSelections);
                        }} 
                        style={{ backgroundColor: "#f59e0b", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        📦 Process Return
                      </button>
                    )}

                    {/* NEW: Clear Dues Button */}
                    {booking.balanceAmount > 0 && !isPending && (
                      <button 
                        onClick={() => handleClearDues(booking)} 
                        style={{ backgroundColor: "#10b981", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        💳 Clear Dues
                      </button>
                    )}

                    {!isPending && (
                      <button onClick={() => setActiveInvoice(booking)} style={{ backgroundColor: "#0ea5e9", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                        🖨 {(isCompleted || isPaymentCompleted) ? "View Final Bill Book" : "View Outward Pass"}
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

export default App;