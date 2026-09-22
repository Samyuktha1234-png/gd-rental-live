import React from 'react';
import { useNavigate } from 'react-router-dom';
import hdHouseImg from '../assets/hd-house.png'; 
import '../App.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="main-content">
      {/* Hero Section */}
      <section className="hero" style={{ alignItems: 'flex-start', paddingTop: '60px' }}>
        
        <div className="hero-container" style={{ paddingTop: '0' }}>
          <div className="hero-content">
            
            {/* 👉 UPDATED: Added whiteSpace: 'nowrap' to force a single line, and used clamp() for responsive sizing so it doesn't overflow */}
            <div style={{ 
              textTransform: 'uppercase', 
              color: '#475569', 
              fontWeight: '700',
              fontSize: 'clamp(10px, 1.5vw, 13px)', 
              letterSpacing: '1px',
              marginBottom: '25px',
              whiteSpace: 'nowrap' 
            }}>
              Shuttering Materials <span style={{ color: '#0284c7', margin: '0 8px' }}>|</span> 
              Column Box <span style={{ color: '#0284c7', margin: '0 8px' }}>|</span> 
              Scaffolding Materials for Rental Purpose
            </div>

            <div className="hero-badge" style={{ marginBottom: '20px' }}>
              <span className="hero-badge-dot"></span>
              GD & ASSOCIATES
            </div>
            
            <h1 style={{ 
              fontSize: 'clamp(34px, 4vw, 52px)', 
              lineHeight: '1.2', 
              marginBottom: '35px',
              letterSpacing: '-1.5px'
            }}>
              Reliable Centering & <br/><span>Construction Equipment</span>
            </h1>
            
            <div className="hero-actions">
              <button className="primary-button" onClick={() => navigate('/products')}>
                Explore Equipment
              </button>
            </div>
            
          </div>

          {/* Hero Visual Display */}
          <div className="hero-visual" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '450px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src={hdHouseImg} 
                alt="Construction House" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
            </div>
          </div>
          
        </div>
      </section>
    </div>
  );
}