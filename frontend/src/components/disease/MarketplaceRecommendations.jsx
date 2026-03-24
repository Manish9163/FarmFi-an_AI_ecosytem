import { useState, useEffect, useContext } from 'react';
import { ShoppingCart } from 'lucide-react';
import { marketService } from '../../services/marketService';
import { CartContext } from '../../context/CartContext';
import toast from 'react-hot-toast';

export default function MarketplaceRecommendations({ diseaseName, predictedClass }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await marketService.getProducts();
        
        let allProducts = [];
        if (res.data && Array.isArray(res.data)) {
          allProducts = res.data;
        } else if (res.data && Array.isArray(res.data.products)) {
          allProducts = res.data.products;
        }

        const keywords = ['pesticide', 'fungicide', 'fertilizer', 'medicine', 'treatment', 'spray'];
        if (diseaseName) {
           const parts = diseaseName.toLowerCase().split(' ');
           keywords.push(...parts);
        }

        const matches = allProducts.filter(p => {
          if (!p.is_active) return false;
          const text = `${p.name} ${p.description} ${p.category}`.toLowerCase();
          return keywords.some(kw => text.includes(kw));
        }).slice(0, 3); 

        setProducts(matches);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [diseaseName, predictedClass]);

  const handleAdd = async (product) => {
    try {
      await addToCart(product.id, 1);
      toast.success(`${product.name} added to cart`);
    } catch (err) {
      toast.error('Failed to add to cart');
    }
  };

  if (!loading && products.length === 0) return null;

  return (
    <div className="product-recommendations bg-white p-4 rounded-xl shadow-sm border border-gray-100 mt-6 mb-6">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-widest mb-3" style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>
        Recommended Treatment Products
      </h3>
      {loading ? (
        <div className="flex gap-4">
          <div className="skeleton h-24 w-1/3 rounded-lg"></div>
          <div className="skeleton h-24 w-1/3 rounded-lg"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {products.map(p => (
            <div key={p.id} className="rec-card border border-gray-100 rounded-lg p-3 hover:border-green-300 transition-colors" style={{ display: 'flex', flexDirection: 'column', borderRadius: '8px', border: '1px solid var(--border)', padding: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'var(--gray-50)', flexShrink: 0 }}>
                    {p.image_url ? (
                        <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)' }}>📷</div>
                    )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '.9rem', fontWeight: 600, margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h4>
                  <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', margin: 0 }}>₹{p.price}</p>
                </div>
              </div>
              <button 
                onClick={() => handleAdd(p)}
                style={{ marginTop: '12px', width: '100%', padding: '6px', fontSize: '.8rem', borderRadius: '6px', background: 'var(--green-50)', color: 'var(--primary)', border: '1px solid var(--primary-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 600 }}
              >
                <ShoppingCart size={14} /> Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
