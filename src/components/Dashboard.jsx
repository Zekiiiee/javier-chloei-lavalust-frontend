import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api';
import ProductModal from './ProductModal';
import DeleteConfirm from './DeleteConfirm';
import './Dashboard.css';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);

  // Toast state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getProducts();
      setProducts(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAdd = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDeleteClick = (product) => {
    setDeletingProduct(product);
    setShowDelete(true);
  };

  const handleSave = async (formData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
        showToast('Product updated successfully!');
      } else {
        await createProduct(formData);
        showToast('Product created successfully!');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteProduct(deletingProduct.id);
      setShowDelete(false);
      setDeletingProduct(null);
      showToast('Product deleted successfully!');
      fetchProducts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const filteredProducts = products.filter((p) =>
    p.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = products.reduce(
    (sum, p) => sum + parseFloat(p.price || 0) * parseInt(p.quantity || 0),
    0
  );

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dash-header">
        <div className="dash-header-left">
          <div className="dash-logo">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="12" fill="url(#dgrad)" />
              <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="dgrad" x1="0" y1="0" x2="40" y2="40">
                  <stop stopColor="#ff6fae" />
                  <stop offset="1" stopColor="#e94f94" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h2 className="dash-title">Just Klowi Things ♡</h2>
            <p className="dash-subtitle">Product Management · Inventory</p>
          </div>
        </div>
        <div className="dash-header-right">
          <div className="dash-user">
            <div className="dash-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="dash-username">{user?.username || 'User'}</span>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-products">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            </svg>
          </div>
          <div>
            <p className="stat-label">Total Products</p>
            <p className="stat-value">{products.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-quantity">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
            </svg>
          </div>
          <div>
            <p className="stat-label">Total Quantity</p>
            <p className="stat-value">
              {products.reduce((s, p) => s + parseInt(p.quantity || 0), 0)}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-value">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          </div>
          <div>
            <p className="stat-label">Total Value</p>
            <p className="stat-value">₱{totalValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-wrapper">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="btn-add" onClick={handleAdd}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="table-container">
        {loading ? (
          <div className="table-loading">
            <div className="spinner-lg" />
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <div className="table-error">
            <p>{error}</p>
            <button onClick={fetchProducts} className="btn-retry">Retry</button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="table-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            </svg>
            <p>{searchTerm ? 'No products match your search' : 'No products yet'}</p>
            {!searchTerm && (
              <button onClick={handleAdd} className="btn-add-empty">
                Add your first product
              </button>
            )}
          </div>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, idx) => (
                <tr key={product.id} style={{ animationDelay: `${idx * 0.04}s` }}>
                  <td className="td-id">{product.id}</td>
                  <td className="td-name">
                    <span className="product-badge">
                      {product.product_name?.charAt(0).toUpperCase()}
                    </span>
                    {product.product_name}
                  </td>
                  <td className="td-desc">{product.description || '—'}</td>
                  <td className="td-price">₱{parseFloat(product.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                  <td className="td-qty">
                    <span className={`qty-badge ${parseInt(product.quantity) <= 5 ? 'qty-low' : ''}`}>
                      {product.quantity}
                    </span>
                  </td>
                  <td className="td-date">
                    {product.created_at
                      ? new Date(product.created_at).toLocaleDateString('en-PH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td className="td-actions">
                    <button
                      className="btn-action btn-edit"
                      onClick={() => handleEdit(product)}
                      title="Edit product"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDeleteClick(product)}
                      title="Delete product"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <ProductModal
          product={editingProduct}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}

      {showDelete && (
        <DeleteConfirm
          product={deletingProduct}
          onConfirm={handleConfirmDelete}
          onClose={() => {
            setShowDelete(false);
            setDeletingProduct(null);
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type} fade-in`}>
          {toast.type === 'success' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}
