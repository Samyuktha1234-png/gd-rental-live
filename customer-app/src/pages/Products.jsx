import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { products as defaultProducts } from '../data/products'; 
import { useCart } from '../CartContext'; 
import '../App.css'; 

export default function Products() {
  const navigate = useNavigate();
  const { addToCart, cart } = useCart(); 
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedVariants, setSelectedVariants] = useState({});

  const [productsList, setProductsList] = useState(() => {
    const savedProducts = localStorage.getItem('gdEquipmentData');
    if (savedProducts) {
      return JSON.parse(savedProducts);
    }
    return defaultProducts;
  });

  useEffect(() => {
    localStorage.setItem('gdEquipmentData', JSON.stringify(productsList));
  }, [productsList]);

  const handleVariantChange = (productId, variantIndex) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: variantIndex
    }));
  };

  const handleAddToCart = (product) => {
    if (product.availability > 0) {
      setProductsList(prevProducts => 
        prevProducts.map(p => 
          p.id === product.id 
            ? { ...p, availability: p.availability - 1 } 
            : p
        )
      );
      
      let itemToAdd = { ...product };

      if (product.hasVariants) {
        const variantIndex = selectedVariants[product.id] || 0;
        const selectedVariant = product.variants[variantIndex];
        
        itemToAdd = {
          ...product,
          id: Number(`${product.id}00${variantIndex}`), 
          name: `${product.name} (${selectedVariant.name})`,
          price: selectedVariant.price
        };
      }
      
      addToCart(itemToAdd); 
    }
  };

  const filteredProducts = productsList.filter((product) => {
    const matchesType = selectedType === 'all' || product.type === selectedType;
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleResetData = () => {
    localStorage.removeItem('gdEquipmentData');
    setProductsList(defaultProducts);
  };

  return (
    <div className="products-page">
      <div className="search-bar-container">
        <span className="search-icon-inside">🔍</span>
        <input
          type="text"
          className="search-input-with-icon"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className="clear-btn" onClick={() => setSearchTerm('')}>✕</button>
        )}
      </div>

      <div className="category-tabs">
        <button className={`tab-btn ${selectedType === 'all' ? 'active' : ''}`} onClick={() => setSelectedType('all')}>
          All Items ({productsList.length})
        </button>
        <button className={`tab-btn ${selectedType === 'machine' ? 'active' : ''}`} onClick={() => setSelectedType('machine')}>
          Machines ({productsList.filter((p) => p.type === 'machine').length})
        </button>
        <button className={`tab-btn ${selectedType === 'scaffolding' ? 'active' : ''}`} onClick={() => setSelectedType('scaffolding')}>
          Scaffolding ({productsList.filter((p) => p.type === 'scaffolding').length})
        </button>
        <button className="tab-btn" onClick={handleResetData} style={{ borderColor: '#0ea5e9', color: '#0ea5e9' }}>
          Reset Counts
        </button>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="no-products-msg">
          <p>No equipment found matching "{searchTerm}".</p>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => {
            
            const activeVariantIndex = selectedVariants[product.id] || 0;
            const activePrice = product.hasVariants ? product.variants[activeVariantIndex].price : product.price;

            return (
              <div 
                key={product.id} 
                className="product-box" 
                style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}
              >
                
                {/* Badges container */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className={`badge ${product.type}`}>
                    {product.type === 'machine' ? 'Machine' : 'Scaffolding'}
                  </span>

                  <span className="availability-badge" style={{ 
                    backgroundColor: product.availability === 0 ? '#fee2e2' : '#d1fae5',
                    color: product.availability === 0 ? '#991b1b' : '#047857',
                    border: `1px solid ${product.availability === 0 ? '#fecaca' : '#a7f3d0'}`,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {product.availability === 0 ? 'Out of Stock' : `${product.availability} Available`}
                  </span>
                </div>

                {/* Fixed-height image container to align all headings below it */}
                <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', flexShrink: 0 }}>
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="box-image" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  ) : (
                    <div className="box-placeholder" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <span style={{ fontSize: '40px', marginBottom: '10px' }}>🏗️</span>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        {product.hasVariants ? 'Select Size Below' : 'Image Coming Soon'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Flexible Details Container */}
                <div className="box-details" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  
                  {/* Headings pinned right under the fixed image container */}
                  <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{product.name}</h3>
                    <p className="box-category" style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{product.category}</p>
                  </div>

                  {/* marginTop: 'auto' forces these elements to snap exactly to the bottom of the card */}
                  <div style={{ marginTop: 'auto' }}>
                    {product.hasVariants && (
                      <div style={{ margin: '12px 0' }}>
                        <select 
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#f8fafc',
                            fontSize: '14px',
                            color: '#334155',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                          value={activeVariantIndex}
                          onChange={(e) => handleVariantChange(product.id, Number(e.target.value))}
                        >
                          {product.variants.map((variant, index) => (
                            <option key={index} value={index}>
                              {variant.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="box-price" style={{ textAlign: 'center', marginBottom: '12px', fontSize: '18px', fontWeight: 'bold', color: '#16a34a' }}>
                      ₹{product.type === 'scaffolding' ? activePrice.toFixed(2) : activePrice} <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#64748b' }}>/ per day</span>
                    </div>

                    <button 
                      className="rent-button" 
                      onClick={() => handleAddToCart(product)}
                      disabled={product.availability === 0}
                      style={{ 
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: 'none',
                        color: 'white',
                        fontWeight: 'bold',
                        backgroundColor: product.availability === 0 ? '#94a3b8' : '#0ea5e9',
                        cursor: product.availability === 0 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {product.availability === 0 ? 'Unavailable' : 'Add to Cart'}
                    </button>
                  </div>
                  
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {cart.length > 0 && (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000 }}>
          <button 
            onClick={() => navigate('/booking')}
            style={{ padding: '15px 25px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
          >
            Proceed to Checkout ({cart.reduce((sum, item) => sum + item.cartQuantity, 0)} items) →
          </button>
        </div>
      )}
    </div>
  );
}