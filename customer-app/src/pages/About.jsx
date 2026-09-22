import React from "react";

function About() {
  return (
    <main className="main-content">
      <section className="categories-section" style={{ paddingTop: '10px', paddingBottom: '60px' }}>
        
        {/* Header Section */}
        <div className="section-heading" style={{ marginBottom: '10px' }}>
          <span className="section-label">ABOUT US</span>
          <h2 style={{ color: '#0284c7' }}>About GD & ASSOCIATES</h2>
        </div>

        {/* Core Team Section */}
        <div className="section-heading" style={{ marginTop: '20px', marginBottom: '30px' }}>
          <h2 style={{ color: '#0284c7' }}>Our Core Team</h2>
        </div>
        
        <div className="categories-grid">
          
          {/* MD */}
          <div className="category-card" style={{ textAlign: "center" }}>
            <div className="category-card-content">
              <h2 style={{ color: '#111' }}>K. Deenathayalan</h2>
              <p style={{ color: "#2563eb", fontWeight: "800", fontSize: "12px", textTransform: "uppercase" }}>
                Managing Director (MD)
              </p>
              <p style={{ fontSize: "15px", fontWeight: "600", color: "#1e40af", marginTop: "12px" }}>📞 989429999</p>
            </div>
          </div>

          {/* Senior Manager */}
          <div className="category-card" style={{ textAlign: "center" }}>
            <div className="category-card-content">
              <h2 style={{ color: '#111' }}>M. Sivalingam</h2>
              <p style={{ color: "#2563eb", fontWeight: "800", fontSize: "12px", textTransform: "uppercase" }}>
                Senior Engineer 
              </p>
              <p style={{ fontSize: "15px", fontWeight: "600", color: "#1e40af", marginTop: "12px" }}>📞 9047593999</p>
            </div>
          </div>

          {/* Admin */}
          <div className="category-card" style={{ textAlign: "center" }}>
            <div className="category-card-content">
              <h2 style={{ color: '#111' }}>D. Poongothai</h2>
              <p style={{ color: "#2563eb", fontWeight: "800", fontSize: "12px", textTransform: "uppercase" }}>
                Admin
              </p>
              <p style={{ fontSize: "15px", fontWeight: "600", color: "#1e40af", marginTop: "12px" }}>📞 9790259999</p>
            </div>
          </div>
          
        </div>

        {/* Contact & Location Section */}
        <div className="section-heading" style={{ marginTop: '80px', marginBottom: '30px' }}>
          <h2 style={{ color: '#0284c7' }}>Get In Touch</h2>
        </div>
        
        <div className="categories-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
          
          {/* Address Card */}
          <div className="category-card" style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
            {/* 👉 UPDATED: Light blue background with a deep blue icon */}
            <div style={{
              margin: 0,
              flexShrink: 0,
              width: '50px',
              height: '50px',
              backgroundColor: '#e0f2fe',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            
            <div className="category-card-content">
              <h2 style={{ color: '#111' }}>Office Address</h2>
              <p style={{ color: '#1e40af' }}>
                204, K.P Nagar By Pass Road,<br />
                Sungam, Coimbatore - 641045
              </p>
            </div>
          </div>

          {/* Email Card */}
          <div className="category-card" style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
            {/* 👉 UPDATED: Light orange background with a deep orange icon to match the text */}
            <div style={{
              margin: 0,
              flexShrink: 0,
              width: '50px',
              height: '50px',
              backgroundColor: '#ffedd5', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            
            <div className="category-card-content">
              <h2 style={{ color: '#111' }}>Email Us</h2>
              <p style={{ marginBottom: "12px", color: '#1e40af' }}>
                Send us an email for general inquiries and booking information.
              </p>
              <a href="mailto:gdandassociatesdeena@gmail.com" className="category-link" style={{ color: '#ea580c', fontWeight: 'bold', wordBreak: 'break-all' }}>
                gdandassociatesdeena@gmail.com
              </a>
            </div>
          </div>

        </div>

      </section>
    </main>
  );
}

export default About;