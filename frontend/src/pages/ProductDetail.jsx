import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marketService } from '../services/marketService';
import { CartContext } from '../context/CartContext';
import { ArrowLeft, ShoppingCart, Package, ShieldCheck, Truck, Star } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart } = useContext(CartContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    marketService.getProduct(id)
      .then(res => {
        setProduct(res.data);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="loading-screen"><div className="spinner"></div></div>;
  }

  if (!product) {
    return (
      <div className="empty-state">
        <h2>Product not found</h2>
        <button className="btn btn-primary" onClick={() => navigate('/marketplace')}>Back to Marketplace</button>
      </div>
    );
  }

  const inStock = product.stock_quantity > 0;
  const cartItem = cart.find(i => i.id === product.id);
  const cartQty = cartItem?.quantity ?? 0;

  const highlightPoints = [
    "Premium quality verified by agricultural experts",
    "High yield potential under optimal conditions",
    "Resistant to common pests and diseases"
  ];
  
  const specs = [
    { label: "Category", value: product.category },
    { label: "Weight / Vol", value: "Standard Packaging" },
    { label: "Origin", value: "Verified Supplier" },
    { label: "Storage", value: "Store in a cool, dry place" }
  ];

  return (
    <div className="product-detail-page">
      <button className="btn btn-outline" onClick={() => navigate('/marketplace')} style={{ marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back to Marketplace
      </button>

      <div className="product-detail-layout">
        {/* Images */}
        <div className="product-image-container card">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="product-main-img" />
          ) : (
            <div className="product-img-placeholder">
              <span style={{ fontSize: '4rem' }}>
                {product.category === 'Seeds' ? '🌱' : product.category === 'Fertilizer' ? '🌿' : product.category === 'Pesticide' ? '🧪' : product.category === 'Tools' ? '🌾' : product.category === 'Equipment' ? '⚙️' : '📦'}
              </span>
            </div>
          )}
        </div>

        {/*  Details */}
        <div className="product-info-container card">
          <span className="badge badge-primary">{product.category}</span>
          <h1 className="product-title">{product.name}</h1>
          <div className="product-rating">
            <Star size={16} fill="var(--warning)" color="var(--warning)" />
            <Star size={16} fill="var(--warning)" color="var(--warning)" />
            <Star size={16} fill="var(--warning)" color="var(--warning)" />
            <Star size={16} fill="var(--warning)" color="var(--warning)" />
            <Star size={16} color="var(--warning)" />
            <span style={{ marginLeft: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>(4.0 based on 24 reviews)</span>
          </div>
          
          <div className="product-price-section">
            <h2 className="price">₹{parseFloat(product.price).toFixed(2)}</h2>
            <span className={`stock-status ${inStock ? 'in-stock' : 'out-stock'}`}>
              {inStock ? `In Stock (${product.stock_quantity} available)` : 'Out of Stock'}
            </span>
          </div>

          <div style={{ margin: '20px 0' }}>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px', fontSize: '1rem', justifyContent: 'center' }}
              onClick={() => addToCart(product.id, 1)}
              disabled={!inStock}
            >
              <ShoppingCart size={18} />
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
            {cartQty > 0 && <p className="cart-feedback">You have {cartQty} of this item in your cart.</p>}
          </div>

          <div className="trust-badges">
            <div className="trust-badge">
              <ShieldCheck size={20} color="var(--primary)" />
              <span>Verified Seller: <br/><strong>FarmFi Official Network</strong></span>
            </div>
            <div className="trust-badge">
              <Truck size={20} color="var(--primary)" />
              <span>Standard Delivery <br/>(2-4 business days)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="product-extended-details grid-2" style={{ marginTop: 20 }}>
        <div className="card">
          <div className="card-header">
            <h2>About this product</h2>
          </div>
          <p className="about-text">{product.description || "No detailed description available for this product."}</p>
          
          <h3 className="sub-heading">Best Use For</h3>
          <p className="about-text">Ideal for traditional and modern farming setups looking to maximize their agricultural output and ensure long-term soil health and crop resilience.</p>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2>Highlights & Specifications</h2>
          </div>
          <ul className="highlights-list">
            {highlightPoints.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
          
          <div className="specs-table">
            {specs.map((s, i) => (
              <div key={i} className="spec-row">
                <span className="spec-label">{s.label}</span>
                <span className="spec-value">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .product-detail-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 768px) {
          .product-detail-layout { grid-template-columns: 1fr; }
        }
        
        .product-image-container { display: flex; align-items: center; justify-content: center; background: #fff; min-height: 400px; padding: 0; overflow: hidden; }
        .product-main-img { width: 100%; height: 100%; object-fit: cover; }
        .product-img-placeholder { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; background: var(--gray-100); }
        
        .product-title { font-size: 2rem; margin: 12px 0 8px; line-height: 1.2; }
        .product-rating { display: flex; align-items: center; gap: 2px; margin-bottom: 20px; }
        
        .product-price-section { padding: 16px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); display: flex; align-items: baseline; gap: 16px; }
        .price { font-size: 2.5rem; color: var(--text); font-weight: 700; margin: 0; }
        .stock-status { font-weight: 600; font-size: 0.9rem; }
        .in-stock { color: var(--primary); }
        .out-stock { color: var(--danger); }
        
        .cart-feedback { color: var(--primary); font-size: 0.85rem; margin-top: 8px; text-align: center; font-weight: 500; }
        
        .trust-badges { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 24px; }
        .trust-badge { display: flex; align-items: flex-start; gap: 10px; background: var(--bg); padding: 12px; border-radius: var(--radius-sm); font-size: 0.85rem; line-height: 1.4; color: var(--text-muted); }
        
        .sub-heading { font-size: 1.1rem; font-weight: 600; margin: 20px 0 10px; color: var(--text); }
        .about-text { color: var(--gray-600); line-height: 1.6; }
        
        .highlights-list { padding-left: 20px; color: var(--gray-600); margin-bottom: 24px; }
        .highlights-list li { margin-bottom: 8px; }
        
        .specs-table { border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden; }
        .spec-row { display: flex; border-bottom: 1px solid var(--border); }
        .spec-row:last-child { border-bottom: none; }
        .spec-label { flex: 0 0 140px; padding: 10px 14px; background: var(--bg); font-weight: 600; font-size: 0.85rem; color: var(--gray-700); border-right: 1px solid var(--border); }
        .spec-value { flex: 1; padding: 10px 14px; font-size: 0.85rem; color: var(--text); }
      `}</style>
    </div>
  );
}