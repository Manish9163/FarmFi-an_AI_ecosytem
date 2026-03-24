import { useState, useEffect, useContext } from 'react';
import { marketService } from '../services/marketService';
import { CartContext } from '../context/CartContext';
import ProductCard from '../components/marketplace/ProductCard';
import CartDrawer from '../components/marketplace/CartDrawer';
import CheckoutModal from '../components/marketplace/CheckoutModal';
import { ShoppingCart, Search, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';

const CATEGORIES = ['All', 'Seeds', 'Fertilizer', 'Tools', 'Pesticide', 'Equipment'];
const PRODUCTS_PER_PAGE = 12;
const STATUS_STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];
const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '');

export default function Marketplace() {
  const { cartCount, fetchCart } = useContext(CartContext);
  const [products,     setProducts]     = useState([]);
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [category,     setCategory]     = useState('All');
  const [search,       setSearch]       = useState('');
  const [view,         setView]         = useState('shop');
  const [showCart,     setShowCart]     = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = async (cat) => {
    setLoading(true);
    try {
      const baseParams = cat !== 'All' ? { category: cat } : {};
      const allProducts = [];
      let page = 1;

      while (true) {
        const { data } = await marketService.getProducts({ ...baseParams, page });
        const batch = data?.products || [];
        allProducts.push(...batch);

        if (batch.length < PRODUCTS_PER_PAGE) break;
        page += 1;
        if (page > 100) break; 
      }

      setProducts(allProducts);
    } catch {
      toast.error('Could not load products');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const { data } = await marketService.getOrders();
      setOrders(data || []);
    } catch {
      toast.error('Could not load order history');
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => { load(category); fetchCart(); loadOrders(); }, [category]);

  const statusMeta = (status) => {
    const currentIndex = STATUS_STEPS.indexOf(status);
    const stepIndex = currentIndex >= 0 ? currentIndex : 0;
    const progress = status === 'Cancelled' ? 100 : ((stepIndex + 1) / STATUS_STEPS.length) * 100;
    return { stepIndex, progress };
  };

  const resolveImage = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return `${API_ORIGIN}${url}`;
    return url;
  };

  const openOrderDetail = async (order) => {
    setSelectedOrder(order);
    setDetailLoading(true);
    try {
      const { data } = await marketService.getOrder(order.id);
      setOrderDetail(data);
    } catch {
      toast.error('Could not load order details');
      setOrderDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeOrderDetail = () => {
    setSelectedOrder(null);
    setOrderDetail(null);
    setDetailLoading(false);
  };

  const downloadInvoice = () => {
    if (!orderDetail) return;
    const doc = new jsPDF();
    
    const margin = 14;
    const pageWidth = doc.internal.pageSize.width;
    
    // Header 
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(34, 197, 94); 
    doc.text('FarmFi', margin, margin + 10);
    
    doc.setTextColor(31, 41, 55); 
    doc.setFontSize(20);
    doc.text('Tax Invoice', pageWidth - margin, margin + 10, { align: 'right' });
    
    doc.setDrawColor(200);
    doc.line(margin, margin + 15, pageWidth - margin, margin + 15);
    
    // Seller and Buyer Information 
    doc.setFontSize(9);
    // seller
    doc.setFont("helvetica", "bold");
    doc.text('Sold By:', margin, margin + 25);
    doc.setFont("helvetica", "normal");
    doc.text('FarmFi Private Limited', margin, margin + 31);
    doc.text('123 Agriculture Tech Park, Ground Floor', margin, margin + 36);
    doc.text('Bengaluru, Karnataka - 560001, IN', margin, margin + 41);
    doc.text('PAN: ABCDE1234F', margin, margin + 46);
    doc.text('GSTIN: 29ABCDE1234F1Z5', margin, margin + 51);
    
    // Shipping Address
    doc.setFont("helvetica", "bold");
    doc.text('Billing & Shipping Address:', pageWidth / 2, margin + 25);
    doc.setFont("helvetica", "normal");
    const splitAddress = doc.splitTextToSize(orderDetail.delivery_address || 'No address provided', (pageWidth / 2) - margin);
    doc.text(splitAddress, pageWidth / 2, margin + 31);
    
    // Order & Invoice 
    const orderDetailsY = margin + Math.max(60, 31 + (splitAddress.length * 5));
    
    doc.setFillColor(249, 250, 251);
    doc.rect(margin, orderDetailsY, pageWidth - (margin * 2), 16, 'F');
    doc.rect(margin, orderDetailsY, pageWidth - (margin * 2), 16, 'S'); // border
    
    doc.setFont("helvetica", "bold");
    doc.text('Order Number:', margin + 4, orderDetailsY + 6);
    doc.setFont("helvetica", "normal");
    doc.text(`#${orderDetail.id}`, margin + 35, orderDetailsY + 6);
    
    doc.setFont("helvetica", "bold");
    doc.text('Order Date:', margin + 4, orderDetailsY + 12);
    doc.setFont("helvetica", "normal");
    doc.text(`${new Date(orderDetail.created_at).toLocaleDateString()}`, margin + 35, orderDetailsY + 12);
    
    doc.setFont("helvetica", "bold");
    doc.text('Payment Method:', pageWidth / 2, orderDetailsY + 6);
    doc.setFont("helvetica", "normal");
    doc.text(`${orderDetail.payment_method}`, (pageWidth / 2) + 32, orderDetailsY + 6);
    
    doc.setFont("helvetica", "bold");
    doc.text('Invoice Date:', pageWidth / 2, orderDetailsY + 12);
    doc.setFont("helvetica", "normal");
    doc.text(`${new Date().toLocaleDateString()}`, (pageWidth / 2) + 32, orderDetailsY + 12);
    
    // Table Header 
    let tableY = orderDetailsY + 24;
    
    doc.setFillColor(229, 231, 235);
    doc.rect(margin, tableY, pageWidth - (margin * 2), 10, 'F');
    doc.rect(margin, tableY, pageWidth - (margin * 2), 10, 'S');
    
    doc.setFont("helvetica", "bold");
    const colSl = margin + 2;
    const colDesc = margin + 12;
    const colPrice = pageWidth - margin - 50;
    const colQty = pageWidth - margin - 30;
    const colTotal = pageWidth - margin - 2;
    
    doc.text('Sl.', colSl, tableY + 6.5);
    doc.text('Product Description', colDesc, tableY + 6.5);
    doc.text('Unit Price', colPrice, tableY + 6.5, { align: 'right' });
    doc.text('Qty', colQty, tableY + 6.5, { align: 'center' });
    doc.text('Total (INR)', colTotal, tableY + 6.5, { align: 'right' });
    
    tableY += 10;
    
    //  Table Rows 
    doc.setFont("helvetica", "normal");
    
    let slNo = 1;
    (orderDetail.items || []).forEach(item => {
      const rawQuantity = parseInt(item.quantity) || 1;
      const price = parseFloat(item.price_at_purchase || 0);
      const total = price * rawQuantity;

      const itemNameSplit = doc.splitTextToSize(item.name || 'Unknown Item', colPrice - colDesc - 5);
      const rowHeight = Math.max(10, itemNameSplit.length * 5 + 4);

      doc.rect(margin, tableY, pageWidth - (margin * 2), rowHeight, 'S');

      doc.line(colDesc - 2, tableY, colDesc - 2, tableY + rowHeight);
      doc.line(colPrice - 20, tableY, colPrice - 20, tableY + rowHeight);
      doc.line(colQty - 10, tableY, colQty - 10, tableY + rowHeight);
      doc.line(colTotal - 22, tableY, colTotal - 22, tableY + rowHeight);

      // data
      doc.text(`${slNo++}`, colSl, tableY + 6);
      doc.text(itemNameSplit, colDesc, tableY + 6);
      doc.text(`${price.toFixed(2)}`, colPrice, tableY + 6, { align: 'right' });
      doc.text(`${rawQuantity}`, colQty, tableY + 6, { align: 'center' });
      doc.text(`${total.toFixed(2)}`, colTotal, tableY + 6, { align: 'right' });

      tableY += rowHeight;

      if (tableY > 260) {
        doc.addPage();
        tableY = margin;
      }
    });

    //  Invoice Totals Table 
    doc.rect(margin, tableY, pageWidth - (margin * 2), 10, 'S');
    doc.line(colTotal - 22, tableY, colTotal - 22, tableY + 10);

    const safeTotalAmount = parseFloat(orderDetail.total_amount || 0);

    doc.setFont("helvetica", "bold");
    doc.text('GRAND TOTAL:', colQty + 5, tableY + 6.5, { align: 'right' });
    doc.text(`INR ${safeTotalAmount.toFixed(2)}`, colTotal, tableY + 6.5, { align: 'right' });
    
    tableY += 20;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    doc.text('For FarmFi Private Limited:', pageWidth - margin, tableY, { align: 'right' });
    
    doc.setDrawColor(200);
    doc.line(pageWidth - margin - 50, tableY + 22, pageWidth - margin, tableY + 22);
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text('Authorized Signatory', pageWidth - margin, tableY + 26, { align: 'right' });
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(156, 163, 175);
    doc.text('Declaration: This is a computer generated document and does not require physical signature.', pageWidth / 2, 285, { align: 'center' });
    
    doc.save(`FarmFi_Tax_Invoice_#${orderDetail.id}.pdf`);
  };

  const filtered = products.filter(p =>
    !search ||
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredOrders = orders.filter((o) => {
    const when = new Date(o.created_at);
    const okStatus = statusFilter === 'All' || o.status === statusFilter;
    const okFrom = !dateFrom || when >= new Date(`${dateFrom}T00:00:00`);
    const okTo = !dateTo || when <= new Date(`${dateTo}T23:59:59`);
    return okStatus && okFrom && okTo;
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1>🛒 Agri Marketplace</h1>
          <p>Quality seeds, fertilizers, tools & pesticides</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowCart(true)}
          style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 7 }}
        >
          <ShoppingCart size={16} /> Cart
          {cartCount > 0 && (
            <span style={{
              position: 'absolute', top: -8, right: -8,
              background: 'var(--danger)', color: '#fff', borderRadius: '50%',
              width: 20, height: 20, fontSize: '.7rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
            }}>
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/*  Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {['shop', 'history'].map(v => (
          <button
            key={v}
            className={`btn btn-sm ${view === v ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setView(v)}
          >
            {v === 'shop' ? 'Shop Products' : 'My Orders'}
          </button>
        ))}
      </div>

      {view === 'shop' && (
      <>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search bar */}
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 300 }}>
          <Search size={15} style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none',
          }} />
          <input
            style={{
              width: '100%', padding: '8px 12px 8px 32px',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              fontSize: '.875rem', outline: 'none', boxSizing: 'border-box',
            }}
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`btn ${category === cat ? 'btn-primary' : 'btn-outline'} btn-sm`}
              onClick={() => { setCategory(cat); setSearch(''); }}
            >{cat}</button>
          ))}
        </div>
      </div>

      {search && !loading && (
        <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
        </p>
      )}

      {loading ? (
        <div className="spinner" style={{ margin: '40px auto' }} />
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1rem', fontWeight: 500 }}>No products found</p>
          {search && <p style={{ fontSize: '.85rem' }}>Try a different search term or category</p>}
        </div>
      ) : (
        <div className="grid-4">
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
      </>
      )}

      {view === 'history' && (
        <div className="card" style={{ marginTop: 6 }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>My Orders & Tracking</h2>
            <button className="btn btn-sm btn-outline" onClick={loadOrders}>Refresh</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>

          {ordersLoading ? (
            <div className="spinner" style={{ margin: '30px auto' }} />
          ) : filteredOrders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>
              No orders match your filters.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: 14 }}>
              {filteredOrders.map(order => {
                const { stepIndex, progress } = statusMeta(order.status);
                return (
                  <div key={order.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>Order #{order.id}</div>
                        <div style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>
                          {new Date(order.created_at).toLocaleString()} · {order.payment_method}
                        </div>
                        <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {order.products_summary || 'Products summary unavailable'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, fontSize: '.95rem' }}>₹{parseFloat(order.total_amount || 0).toFixed(2)}</div>
                        <span className={`badge ${order.status === 'Cancelled' ? 'badge-danger' : 'badge-info'}`}>{order.status}</span>
                      </div>
                    </div>

                    <div style={{ marginBottom: 8 }}>
                      <div style={{ height: 8, background: 'var(--gray-100)', borderRadius: 999, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${progress}%`,
                            height: '100%',
                            background: order.status === 'Cancelled' ? '#ef4444' : 'var(--primary)',
                            transition: 'width .3s ease',
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 8 }}>
                      {STATUS_STEPS.map((s, idx) => {
                        const reached = order.status !== 'Cancelled' && idx <= stepIndex;
                        return (
                          <div key={s} style={{ fontSize: '.75rem', textAlign: 'center', color: reached ? 'var(--primary)' : 'var(--text-muted)', fontWeight: reached ? 600 : 500 }}>
                            {s}
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                      <button className="btn btn-sm btn-outline" onClick={() => openOrderDetail(order)}>
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1200, background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={closeOrderDetail}>
          <div className="card" style={{ width: 'min(760px, 100%)', maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Order #{selectedOrder.id} Details</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                {!detailLoading && orderDetail && (
                  <button className="btn btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary)', color: 'white' }} onClick={downloadInvoice}>
                    <Download size={14} /> Invoice
                  </button>
                )}
                <button className="btn btn-sm btn-outline" onClick={closeOrderDetail}>Close</button>
              </div>
            </div>

            {detailLoading ? (
              <div className="spinner" style={{ margin: '30px auto' }} />
            ) : !orderDetail ? (
              <p style={{ color: 'var(--text-muted)' }}>Could not load details.</p>
            ) : (
              <>
                <div style={{ marginBottom: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ fontSize: '.9rem' }}>
                    <strong>Status:</strong> {orderDetail.status}
                  </div>
                  <div style={{ fontSize: '.9rem' }}>
                    <strong>Payment:</strong> {orderDetail.payment_method}
                  </div>
                  <div style={{ fontSize: '.9rem' }}>
                    <strong>Total:</strong> ₹{parseFloat(orderDetail.total_amount || 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '.9rem' }}>
                    <strong>Date:</strong> {new Date(orderDetail.created_at).toLocaleString()}
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <strong style={{ fontSize: '.9rem' }}>Delivery Address</strong>
                  <div style={{ marginTop: 6, fontSize: '.85rem', color: 'var(--text-muted)', background: 'var(--gray-50)', border: '1px solid var(--border)', padding: '10px 12px', borderRadius: 8 }}>
                    {orderDetail.delivery_address || 'No address provided'}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 8, marginBottom: 14 }}>
                  {STATUS_STEPS.map((s, idx) => {
                    const { stepIndex } = statusMeta(orderDetail.status);
                    const reached = orderDetail.status !== 'Cancelled' && idx <= stepIndex;
                    return (
                      <div key={s} style={{ fontSize: '.78rem', textAlign: 'center', padding: '8px 4px', borderRadius: 6, border: '1px solid var(--border)', background: reached ? 'var(--green-50)' : '#fff', color: reached ? 'var(--primary)' : 'var(--text-muted)', fontWeight: reached ? 700 : 500 }}>
                        {s}
                      </div>
                    );
                  })}
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(orderDetail.items || []).map(item => (
                        <tr key={item.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              {item.image_url
                                ? <img src={resolveImage(item.image_url)} alt={item.name} style={{ width: 46, height: 34, objectFit: 'cover', borderRadius: 6 }} />
                                : <div style={{ width: 46, height: 34, background: 'var(--gray-100)', borderRadius: 6 }} />}
                              <span>{item.name}</span>
                            </div>
                          </td>
                          <td>{item.quantity}</td>
                          <td>₹{parseFloat(item.price_at_purchase || 0).toFixed(2)}</td>
                          <td>₹{(parseFloat(item.price_at_purchase || 0) * parseFloat(item.quantity || 0)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        open={showCart}
        onClose={() => setShowCart(false)}
        onCheckout={() => { setShowCart(false); setShowCheckout(true); }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        open={showCheckout}
        onClose={() => setShowCheckout(false)}
      />
    </div>
  );
}
