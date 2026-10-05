import { useState } from 'react';
import './Modal.css';

export default function ProductModal({ product, onSave, onClose }) {
  const isEdit = !!product;

  const [formData, setFormData] = useState({
    product_name: product?.product_name || '',
    description: product?.description || '',
    price: product?.price || '',
    quantity: product?.quantity || '',
  });

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.product_name.trim()) {
      setError('Product name is required.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        product_name: formData.product_name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price) || 0,
        quantity: parseInt(formData.quantity) || 0,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Product' : 'Add Product'}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="modal-error fade-in">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM7 5a1 1 0 012 0v3a1 1 0 01-2 0V5zm1 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="modal-name">Product Name</label>
            <input
              id="modal-name"
              name="product_name"
              type="text"
              placeholder="e.g. Wireless Keyboard"
              value={formData.product_name}
              onChange={handleChange}
              required
              autoFocus
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="modal-desc">Description</label>
            <textarea
              id="modal-desc"
              name="description"
              placeholder="Optional product description..."
              value={formData.description}
              onChange={handleChange}
              rows={3}
              disabled={saving}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="modal-price">Price (₱)</label>
              <input
                id="modal-price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.price}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
            <div className="form-group">
              <label htmlFor="modal-qty">Quantity</label>
              <input
                id="modal-qty"
                name="quantity"
                type="number"
                min="0"
                placeholder="0"
                value={formData.quantity}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? (
                <>
                  <span className="spinner" />
                  Saving...
                </>
              ) : (
                isEdit ? 'Update Product' : 'Create Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
