import { ShoppingCart, Package, Plus, Minus, Check } from 'lucide-react';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';

export default function ProductCard({ product }) {
  const { cart, addToCart, updateCart } = useContext(CartContext);
  const navigate = useNavigate();
  const { id, name, description, price, category, stock_quantity, image_url } = product;
  const inStock  = stock_quantity > 0;
  const cartItem = cart.find(i => i.id === id);
  const cartQty  = cartItem?.quantity ?? 0;

  return (
    <div className="product-card card">
      <div className="product-img-wrap" onClick={() => navigate(`/marketplace/${id}`)} style={{ cursor: 'pointer' }}>
        {image_url
          ? <img
              src={image_url}
              alt={name}
              className="product-img"
              onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
            />
          : null
        }
        <div
          className="product-img-placeholder"
          style={{ display: image_url ? 'none' : 'flex' }}
        >
          <span style={{ fontSize: '2.5rem' }}>
            {category === 'Seeds' ? '🌱' : category === 'Fertilizer' ? '🌿' : category === 'Pesticide' ? '🪲' : category === 'Tools' ? '🌾' : category === 'Equipment' ? '⚙️' : '📦'}
          </span>
        </div>
        <span className="category-badge">{category}</span>
        {cartQty > 0 && (
          <span className="in-cart-badge">
            <Check size={10} /> In Cart
          </span>
        )}
      </div>

      <div className="product-body">
        <h3 className="product-name" onClick={() => navigate(`/marketplace/${id}`)} style={{ cursor: 'pointer' }}>{name}</h3>
        <p className="product-desc" onClick={() => navigate(`/marketplace/${id}`)} style={{ cursor: 'pointer' }}>{description}</p>

        <div className="product-footer">
          <span className="product-price">₹{parseFloat(price).toFixed(2)}</span>

          {cartQty > 0 ? (
            <div className="qty-control">
              <button
                className="qty-btn"
                onClick={() => updateCart(id, cartQty - 1)}
                title="Decrease"
              >
                <Minus size={13} />
              </button>
              <span className="qty-value">{cartQty}</span>
              <button
                className="qty-btn"
                onClick={() => updateCart(id, cartQty + 1)}
                disabled={cartQty >= stock_quantity}
                title="Increase"
              >
                <Plus size={13} />
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => addToCart(id, 1)}
              disabled={!inStock}
            >
              <ShoppingCart size={14} />
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          )}
        </div>

        {stock_quantity <= 10 && inStock && (
          <p className="stock-warn">Only {stock_quantity} left!</p>
        )}
      </div>

      <style>{`
        .product-card { display: flex; flex-direction: column; padding: 0; overflow: hidden; transition: box-shadow .2s; height: 100%; }
        .product-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,.10); }
        .product-img-wrap { position: relative; background: var(--gray-100); height: 160px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .product-img { width: 100%; height: 100%; object-fit: cover; }
        .product-img-placeholder { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
        .category-badge { position: absolute; top: 8px; left: 8px; background: var(--primary); color: #fff; font-size: .7rem; font-weight: 600; padding: 2px 8px; border-radius: 999px; }
        .in-cart-badge { position: absolute; top: 8px; right: 8px; background: #16a34a; color: #fff; font-size: .68rem; font-weight: 600; padding: 2px 7px; border-radius: 999px; display: flex; align-items: center; gap: 3px; }
        .product-body { padding: 14px; display: flex; flex-direction: column; flex: 1; }
        .product-name { font-size: .95rem; font-weight: 600; margin-bottom: 4px; }
        .product-desc { font-size: .8rem; color: var(--text-muted); margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .product-footer { margin-top: auto; display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
        .product-price { font-size: 1.1rem; font-weight: 700; color: var(--primary); }
        .stock-warn { font-size: .75rem; color: var(--danger); margin-top: 6px; }
        .qty-control { display: flex; align-items: center; gap: 6px; background: var(--gray-100); border-radius: var(--radius-sm); padding: 4px 6px; }
        .qty-btn { display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; border: 1px solid var(--border); background: #fff; cursor: pointer; transition: background .15s; }
        .qty-btn:hover:not(:disabled) { background: var(--primary); color: #fff; border-color: var(--primary); }
        .qty-btn:disabled { opacity: .4; cursor: not-allowed; }
        .qty-value { font-weight: 700; font-size: .9rem; min-width: 20px; text-align: center; }
      `}</style>
    </div>
  );
}
