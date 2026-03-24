import { useState, useContext } from 'react';
import { X, CheckCircle, MapPin, CreditCard, Package, ChevronRight, ShieldCheck } from 'lucide-react';
import { CartContext } from '../../context/CartContext';
import { marketService } from '../../services/marketService';
import { paymentService } from '../../services/paymentService';
import { useRazorpay } from '../../hooks/useRazorpay';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const STEPS = ['Review Order', 'Delivery & Payment', 'Confirmation'];
const MAX_ONLINE_TXN_INR = 5000;

const PAYMENT_OPTIONS = [
  { value: 'Cash',   label: 'Cash on Delivery',  icon: '', desc: 'Pay when your order arrives' },
  { value: 'Credit', label: 'Credit Account',     icon: '', desc: 'Deduct from farm credit balance' },
  { value: 'Card',   label: 'Card / UPI',         icon: '💳', desc: 'Secured by Razorpay' },
];

export default function CheckoutModal({ open, onClose }) {
  const { cart, cartTotal, cartCount, fetchCart } = useContext(CartContext);
  const { user } = useAuth();
  const { openPayment } = useRazorpay();
  const [step,        setStep]        = useState(0);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: ''
  });

  const getFullAddress = () => {
    return `${addressForm.fullName}, Ph: ${addressForm.phone}, ${addressForm.street}, ${addressForm.city}, ${addressForm.state} - ${addressForm.pincode}`;
  };

  const isAddressValid = () => {
    return Object.values(addressForm).every(val => val.trim().length > 0);
  };
  const [payMethod,   setPayMethod]   = useState('Cash');
  const [placing,     setPlacing]     = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [paymentId,   setPaymentId]   = useState(null);

  if (!open) return null;

  const handleClose = () => {
    setStep(0);
    setOrderResult(null);
    setPaymentId(null);
    setAddressForm({
      fullName: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      pincode: ''
    });
    setPayMethod('Cash');
    onClose();
  };

  const placeOrder = async () => {
    if (!isAddressValid()) {
      toast.error('Please fill in all address fields');
      return;
    }
    const fullAddress = getFullAddress();
    setPlacing(true);

    if (payMethod === 'Card') {
      if (cartTotal > MAX_ONLINE_TXN_INR) {
        toast.error(`Online payment limit is ₹${MAX_ONLINE_TXN_INR}. Please split your order.`);
        setPlacing(false);
        return;
      }

      //  Razorpay secure payment flow 
      try {
        const { data: rpOrder } = await paymentService.createOrder({ amount: cartTotal });

        openPayment({
          keyId:       rpOrder.key_id,
          orderId:     rpOrder.order_id,
          amount:      rpOrder.amount,
          description: 'FarmFi Marketplace Order',
          prefill:     { name: user?.full_name || '', email: user?.email || '' },
          onSuccess: async (rpResp) => {
            try {
              //  Verify signature server-side
              const { data: vData } = await paymentService.verify({
                razorpay_order_id:   rpResp.razorpay_order_id,
                razorpay_payment_id: rpResp.razorpay_payment_id,
                razorpay_signature:  rpResp.razorpay_signature,
              });
              if (!vData.verified) throw new Error('Payment verification failed');

              // Place order after successful payment
              const { data } = await marketService.placeOrder({
                payment_method:      'Card',
                delivery_address:    fullAddress,
                razorpay_payment_id: rpResp.razorpay_payment_id,
              });
              setPaymentId(rpResp.razorpay_payment_id);
              setOrderResult(data);
              setStep(2);
              fetchCart();
            } catch (err) {
              toast.error(err.response?.data?.error || err.message || 'Order failed after payment');
            } finally {
              setPlacing(false);
            }
          },
          onFailure: (msg) => {
            if (msg !== 'cancelled') toast.error(msg || 'Payment failed');
            setPlacing(false);
          },
        });
        // placing stays true until onSuccess/onFailure resolves
      } catch (err) {
        toast.error(err.response?.data?.error || 'Could not initiate payment');
        setPlacing(false);
      }
    } else {
      // Cash / Credit — direct order placement 
      try {
        const { data } = await marketService.placeOrder({
          payment_method:   payMethod,
          delivery_address: fullAddress,
        });
        setOrderResult(data);
        setStep(2);
        fetchCart();
      } catch (err) {
        toast.error(err.response?.data?.error || 'Order could not be placed');
      } finally {
        setPlacing(false);
      }
    }
  };

  return (
    <div className="checkout-overlay" onClick={handleClose}>
      <div className="checkout-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="chk-header">
          <h2>Checkout</h2>
          {step < 2 && (
            <button className="chk-close" onClick={handleClose} aria-label="Close">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Step indicator */}
        <div className="chk-steps">
          {STEPS.map((label, i) => (
            <div key={label} className="chk-step-wrap">
              <div className={`chk-step ${i < step ? 'done' : ''} ${i === step ? 'active' : ''}`}>
                <div className="chk-step-circle">
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="chk-step-label">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight size={16} color="var(--gray-300)" className="chk-step-sep" />
              )}
            </div>
          ))}
        </div>

        {/* Review  */}
        {step === 0 && (
          <div className="chk-body">
            <p className="chk-section-title">Order Summary</p>
            <div className="chk-review-list">
              {cart.map(item => (
                <div key={item.id} className="chk-review-row">
                  <div className="chk-review-img">
                    {item.image_url
                      ? <img src={item.image_url} alt={item.name} />
                      : <Package size={18} color="var(--gray-400)" />
                    }
                  </div>
                  <span className="chk-review-name">{item.name}</span>
                  <span className="chk-review-qty">× {item.quantity}</span>
                  <span className="chk-review-price">₹{parseFloat(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="chk-total-row">
              <span>Order Total ({cartCount} item{cartCount !== 1 ? 's' : ''})</span>
              <strong className="chk-total-amt">₹{cartTotal.toFixed(2)}</strong>
            </div>

            <button
              className="btn btn-primary chk-next-btn"
              onClick={() => setStep(1)}
            >
              Continue to Delivery <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Delivery & Payment */}
        {step === 1 && (
          <div className="chk-body">
            <label className="chk-field-label">
              <MapPin size={15} color="var(--primary)" /> Delivery Address
            </label>
            <div className="chk-address-form">
              <div className="chk-field-group">
                <input type="text" placeholder="Full Name" value={addressForm.fullName} onChange={e => setAddressForm({...addressForm, fullName: e.target.value})} />
                <input type="text" placeholder="Phone Number" value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} />
              </div>
              <input type="text" className="chk-input-full" placeholder="House / Flat no., Street, Locality" value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} />
              <div className="chk-field-group">
                <input type="text" placeholder="City" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} />
                <input type="text" placeholder="State" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} />
                <input type="text" placeholder="Pincode" value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} />
              </div>
            </div>

            <label className="chk-field-label" style={{ marginTop: 20 }}>
              <CreditCard size={15} color="var(--primary)" /> Payment Method
            </label>
            <div className="chk-payment-grid">
              {PAYMENT_OPTIONS.map(opt => (
                <label
                  key={opt.value}
                  className={`chk-pay-option ${payMethod === opt.value ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="payMethod"
                    value={opt.value}
                    checked={payMethod === opt.value}
                    onChange={() => setPayMethod(opt.value)}
                    hidden
                  />
                  <span className="chk-pay-icon">{opt.icon}</span>
                  <div className="chk-pay-text">
                    <span className="chk-pay-label">{opt.label}</span>
                    <small className="chk-pay-desc">{opt.desc}</small>
                  </div>
                  {opt.value === 'Card' && payMethod === 'Card' && (
                    <span className="chk-rzp-badge"><ShieldCheck size={11} /> Razorpay</span>
                  )}
                </label>
              ))}
            </div>

            <div className="chk-order-mini-total">
              <span>Total payable</span>
              <strong>₹{cartTotal.toFixed(2)}</strong>
            </div>
            {payMethod === 'Card' && cartTotal > MAX_ONLINE_TXN_INR && (
              <p style={{ color: 'var(--danger)', fontSize: '.78rem', marginTop: 8 }}>
                Online limit is ₹{MAX_ONLINE_TXN_INR}. Use Cash/Credit or reduce total.
              </p>
            )}

            <div className="chk-action-row">
              <button className="btn btn-outline" onClick={() => setStep(0)}>
                ← Back
              </button>
              <button
                className="btn btn-primary"
                onClick={placeOrder}
                disabled={placing || !isAddressValid() || (payMethod === 'Card' && cartTotal > MAX_ONLINE_TXN_INR)}
              >
                {placing
                  ? (payMethod === 'Card' ? 'Opening Payment…' : 'Placing Order…')
                  : payMethod === 'Card'
                    ? `Pay Securely ₹${cartTotal.toFixed(2)}`
                    : `Confirm Order ₹${cartTotal.toFixed(2)}`
                }
              </button>
            </div>
          </div>
        )}

        {/*  Confirmation  */}
        {step === 2 && orderResult && (
          <div className="chk-body chk-confirm">
            <div className="chk-success-icon">
              <CheckCircle size={64} color="#16a34a" />
            </div>
            <h3 className="chk-confirm-title">Order Placed Successfully!</h3>
            <p className="chk-order-id">Order #{orderResult.order_id}</p>
            <div className="chk-confirm-details">
              <div className="chk-detail-row">
                <span>Total Charged</span>
                <strong>₹{parseFloat(orderResult.total).toFixed(2)}</strong>
              </div>
              <div className="chk-detail-row">
                <span>Payment</span>
                <strong>{payMethod === 'Card' ? 'Card / UPI' : payMethod}</strong>
              </div>
              {paymentId && (
                <div className="chk-detail-row">
                  <span>Payment ID</span>
                  <span style={{ fontSize: '.78rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{paymentId}</span>
                </div>
              )}
              <div className="chk-detail-row">
                <span>Delivery to</span>
                <span className="chk-address-preview">{getFullAddress()}</span>
              </div>
            </div>
            <p className="chk-confirm-note">
              You'll receive updates once your order is dispatched. 🚜
            </p>
            <button className="btn btn-primary chk-next-btn" onClick={handleClose}>
              Continue Shopping
            </button>
          </div>
        )}

      </div>

      <style>{`
        .checkout-overlay {
          position: fixed; inset: 0; z-index: 1100;
          background: rgba(0,0,0,.55);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
        }
        .checkout-modal {
          background: #fff; border-radius: var(--radius-lg, 12px);
          width: min(560px, 100%); max-height: 90vh;
          overflow-y: auto; display: flex; flex-direction: column;
          box-shadow: 0 20px 60px rgba(0,0,0,.25);
          animation: modalIn .25s ease;
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(.96) translateY(12px); }
          to   { opacity: 1; transform: scale(1)  translateY(0); }
        }

        /* Header */
        .chk-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 18px 24px 14px; border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .chk-header h2 { margin: 0; font-size: 1.1rem; font-weight: 700; }
        .chk-close {
          background: none; border: none; cursor: pointer; color: var(--text-muted);
          display: flex; align-items: center; padding: 4px; border-radius: 6px;
          transition: background .15s;
        }
        .chk-close:hover { background: var(--gray-100); }

        /* Steps */
        .chk-steps {
          display: flex; align-items: center; justify-content: center;
          gap: 4px; padding: 16px 24px; border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .chk-step-wrap { display: flex; align-items: center; gap: 4px; }
        .chk-step { display: flex; align-items: center; gap: 7px; }
        .chk-step-circle {
          width: 26px; height: 26px; border-radius: 50%;
          background: var(--gray-200); color: var(--text-muted);
          font-size: .78rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          transition: all .2s;
        }
        .chk-step.active .chk-step-circle { background: var(--primary); color: #fff; }
        .chk-step.done  .chk-step-circle { background: #16a34a; color: #fff; }
        .chk-step-label { font-size: .8rem; font-weight: 500; color: var(--text-muted); }
        .chk-step.active .chk-step-label { color: var(--primary); font-weight: 600; }
        .chk-step.done  .chk-step-label  { color: #16a34a; }
        .chk-step-sep { flex-shrink: 0; }

        /* Body */
        .chk-body { padding: 22px 24px; flex: 1; }
        .chk-section-title { font-size: .8rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: var(--text-muted); margin: 0 0 12px; }

        /* Review list */
        .chk-review-list { display: flex; flex-direction: column; gap: 2px; margin-bottom: 16px; }
        .chk-review-row {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 0; border-bottom: 1px solid var(--gray-100);
        }
        .chk-review-img {
          width: 38px; height: 38px; border-radius: 6px; background: var(--gray-100);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden;
        }
        .chk-review-img img { width: 100%; height: 100%; object-fit: cover; }
        .chk-review-name { flex: 1; font-size: .875rem; font-weight: 500; }
        .chk-review-qty  { font-size: .8rem; color: var(--text-muted); flex-shrink: 0; }
        .chk-review-price { font-size: .9rem; font-weight: 700; flex-shrink: 0; min-width: 70px; text-align: right; }

        .chk-total-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 0; border-top: 2px solid var(--primary);
          font-size: .95rem;
        }
        .chk-total-amt { font-size: 1.15rem; color: var(--primary); }
        .chk-next-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 14px; }

        /* Delivery & Payment */
        .chk-field-label { display: flex; align-items: center; gap: 6px; font-size: .85rem; font-weight: 600; margin-bottom: 8px; }
        
        .chk-address-form { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
        .chk-field-group { display: flex; gap: 10px; }
        .chk-field-group input, .chk-address-form input {
          width: 100%; padding: 10px 12px; border: 1px solid var(--border);
          border-radius: var(--radius-sm); font-size: .875rem;
          font-family: inherit; outline: none; box-sizing: border-box;
          transition: border .15s;
        }
        .chk-field-group input:focus, .chk-address-form input:focus { border-color: var(--primary); }
        .chk-input-full { width: 100%; }

        .chk-textarea {
          width: 100%; padding: 10px 12px; border: 1px solid var(--border);
          border-radius: var(--radius-sm); font-size: .875rem; resize: vertical;
          font-family: inherit; outline: none; box-sizing: border-box;
          transition: border .15s;
        }
        .chk-textarea:focus { border-color: var(--primary); }

        .chk-payment-grid { display: flex; flex-direction: column; gap: 8px; }
        .chk-pay-option {
          display: flex; align-items: center; gap: 12px; padding: 12px 14px;
          border: 2px solid var(--border); border-radius: var(--radius-sm);
          cursor: pointer; transition: all .15s; user-select: none;
        }
        .chk-pay-option:hover { border-color: var(--primary-light, #86efac); background: var(--green-50); }
        .chk-pay-option.selected { border-color: var(--primary); background: var(--green-50); }
        .chk-pay-icon { font-size: 1.2rem; flex-shrink: 0; }
        .chk-pay-text { display: flex; flex-direction: column; flex: 1; }
        .chk-pay-label { font-size: .875rem; font-weight: 500; }
        .chk-pay-desc  { font-size: .75rem; color: var(--text-muted); margin-top: 1px; }
        .chk-rzp-badge {
          display: flex; align-items: center; gap: 3px; font-size: .7rem;
          background: #072654; color: #fff; padding: 2px 7px; border-radius: 999px;
          font-weight: 600; flex-shrink: 0;
        }

        .chk-order-mini-total {
          display: flex; justify-content: space-between; margin-top: 18px;
          padding: 12px 0; border-top: 1px solid var(--border); font-size: .9rem;
        }
        .chk-action-row { display: flex; justify-content: space-between; gap: 10px; margin-top: 18px; }
        .chk-action-row .btn { flex: 1; }

        /* Confirmation */
        .chk-confirm { text-align: center; display: flex; flex-direction: column; align-items: center; }
        .chk-success-icon { margin-bottom: 12px; }
        .chk-confirm-title { font-size: 1.25rem; font-weight: 700; margin: 0 0 6px; }
        .chk-order-id { font-size: .9rem; color: var(--text-muted); margin: 0 0 18px; }
        .chk-confirm-details {
          width: 100%; background: var(--gray-50); border-radius: var(--radius-sm);
          padding: 14px; display: flex; flex-direction: column; gap: 10px;
          margin-bottom: 16px;
        }
        .chk-detail-row { display: flex; justify-content: space-between; font-size: .875rem; gap: 10px; }
        .chk-address-preview { text-align: right; max-width: 260px; font-size: .82rem; color: var(--text-muted); }
        .chk-confirm-note { font-size: .82rem; color: var(--text-muted); margin-bottom: 4px; }
      `}</style>
    </div>
  );
}
