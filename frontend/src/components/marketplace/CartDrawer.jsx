import { useContext } from 'react';
import { X, Trash2, ShoppingBag, Plus, Minus, Package, ArrowRight } from 'lucide-react';
import { CartContext } from '../../context/CartContext';

export default function CartDrawer({ open, onClose, onCheckout }) {
  const { cart, cartTotal, cartCount, updateCart, removeFromCart } = useContext(CartContext);

  return (
    <>
      <div
        className={`cart-backdrop ${open ? 'cart-backdrop--visible' : ''}`}
        onClick={onClose}
      />

      {/* Slide-out drawer */}
      <div className={`cart-drawer ${open ? 'cart-drawer--open' : ''}`}>
        <div className="cd-header">
          <div className="cd-title">
            <ShoppingBag size={20} color="var(--primary)" />
            <h2>
              Shopping Cart
              {cartCount > 0 && <span className="cd-count">{cartCount}</span>}
            </h2>
          </div>
          <button className="cd-close" onClick={onClose} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="cd-body">
          {cart.length === 0 ? (
            <div className="cd-empty">
              <Package size={52} color="var(--gray-300)" />
              <p>Your cart is empty</p>
              <small>Browse products and add items to get started</small>
            </div>
          ) : (
            <div className="cd-items">
              {cart.map(item => {
                const unitPrice = item.price
                  ? parseFloat(item.price)
                  : parseFloat(item.subtotal) / item.quantity;
                return (
                  <div key={item.id} className="cd-item">
                    <div className="cd-item-img">
                      {item.image_url
                        ? <img
                            src={item.image_url}
                            alt={item.name}
                            onError={e => { e.currentTarget.style.display='none'; }}
                          />
                        : <Package size={22} color="var(--gray-300)" />
                      }
                    </div>

                    <div className="cd-item-meta">
                      <p className="cd-item-name">{item.name}</p>
                      <p className="cd-item-unit">₹{unitPrice.toFixed(2)} each</p>
                      <div className="cd-qty-row">
                        <button
                          className="cd-qty-btn"
                          onClick={() => updateCart(item.id, item.quantity - 1)}
                        >
                          <Minus size={11} />
                        </button>
                        <span className="cd-qty-val">{item.quantity}</span>
                        <button
                          className="cd-qty-btn"
                          onClick={() => updateCart(item.id, item.quantity + 1)}
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>

                    <div className="cd-item-right">
                      <p className="cd-item-subtotal">₹{parseFloat(item.subtotal).toFixed(2)}</p>
                      <button
                        className="cd-remove"
                        onClick={() => removeFromCart(item.id)}
                        title="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="cd-footer">
            <div className="cd-subtotal-row">
              <span>Subtotal ({cartCount} item{cartCount !== 1 ? 's' : ''})</span>
              <strong>₹{cartTotal.toFixed(2)}</strong>
            </div>
            <p className="cd-shipping-note">Shipping & taxes calculated at checkout</p>
            <button
              className="btn btn-primary cd-checkout-btn"
              onClick={onCheckout}
            >
              Proceed to Checkout <ArrowRight size={16} />
            </button>
            <button className="btn btn-outline cd-continue-btn" onClick={onClose}>
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      <style>{`
        /* Backdrop */
        .cart-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,.45);
          z-index: 1000; opacity: 0; pointer-events: none;
          transition: opacity .3s ease;
        }
        .cart-backdrop--visible { opacity: 1; pointer-events: auto; }

        /* Drawer */
        .cart-drawer {
          position: fixed; top: 0; right: 0; height: 100vh;
          width: min(420px, 100vw); background: #fff;
          z-index: 1001; display: flex; flex-direction: column;
          box-shadow: -4px 0 30px rgba(0,0,0,.15);
          transform: translateX(100%);
          transition: transform .32s cubic-bezier(.4,0,.2,1);
        }
        .cart-drawer--open { transform: translateX(0); }

        /* Header */
        .cd-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 20px; border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .cd-title { display: flex; align-items: center; gap: 10px; }
        .cd-title h2 { font-size: 1.05rem; font-weight: 700; display: flex; align-items: center; gap: 8px; margin: 0; }
        .cd-count {
          background: var(--primary); color: #fff; border-radius: 999px;
          font-size: .72rem; font-weight: 700; padding: 1px 8px;
        }
        .cd-close {
          background: none; border: none; cursor: pointer; color: var(--text-muted);
          display: flex; align-items: center; padding: 4px 4px;
          border-radius: var(--radius-sm);
          transition: background .15s;
        }
        .cd-close:hover { background: var(--gray-100); }

        /* Body */
        .cd-body { flex: 1; overflow-y: auto; padding: 12px 0; }
        .cd-empty {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          height: 100%; gap: 10px; color: var(--text-muted); text-align: center; padding: 40px;
        }
        .cd-empty p { font-size: .95rem; font-weight: 500; margin: 0; }
        .cd-empty small { font-size: .82rem; }

        /* Items */
        .cd-items { display: flex; flex-direction: column; }
        .cd-item {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 14px 20px; border-bottom: 1px solid var(--gray-100);
          transition: background .15s;
        }
        .cd-item:hover { background: var(--gray-50); }

        .cd-item-img {
          width: 52px; height: 52px; border-radius: var(--radius-sm);
          background: var(--gray-100); display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; overflow: hidden;
        }
        .cd-item-img img { width: 100%; height: 100%; object-fit: cover; }

        .cd-item-meta { flex: 1; min-width: 0; }
        .cd-item-name { font-size: .875rem; font-weight: 600; margin: 0 0 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cd-item-unit { font-size: .78rem; color: var(--text-muted); margin: 0 0 8px; }
        .cd-qty-row { display: flex; align-items: center; gap: 8px; }
        .cd-qty-btn {
          width: 26px; height: 26px; border-radius: 6px; border: 1px solid var(--border);
          background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all .15s;
        }
        .cd-qty-btn:hover { background: var(--primary); color: #fff; border-color: var(--primary); }
        .cd-qty-val { font-size: .875rem; font-weight: 700; min-width: 18px; text-align: center; }

        .cd-item-right { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; flex-shrink: 0; }
        .cd-item-subtotal { font-size: .9rem; font-weight: 700; margin: 0; }
        .cd-remove {
          background: none; border: none; cursor: pointer;
          color: var(--text-muted); display: flex; align-items: center;
          padding: 4px; border-radius: 4px; transition: all .15s;
        }
        .cd-remove:hover { background: #fee2e2; color: var(--danger); }

        /* Footer */
        .cd-footer {
          padding: 16px 20px; border-top: 1px solid var(--border);
          flex-shrink: 0; background: #fff;
        }
        .cd-subtotal-row {
          display: flex; justify-content: space-between; align-items: center;
          font-size: .95rem; margin-bottom: 4px;
        }
        .cd-shipping-note { font-size: .78rem; color: var(--text-muted); margin: 0 0 14px; }
        .cd-checkout-btn {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 7px;
          margin-bottom: 8px;
        }
        .cd-continue-btn { width: 100%; }
      `}</style>
    </>
  );
}
