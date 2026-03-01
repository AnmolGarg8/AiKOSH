import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Loader2, Upload } from 'lucide-react';

const ProductInputPage = ({ setResult }) => {
    const [_, setLocation] = useLocation();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        language: 'English',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.title.trim() || !formData.description.trim()) {
            setError('Product title and description are required.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/v1/categorize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to process request');
            }

            const data = await response.json();
            setResult(data);
            setLocation('/result');
        } catch (err) {
            setError(err.message || 'An error occurred during categorization.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px' }}>
            <div className="card">
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Product Information</h2>

                {error && (
                    <div style={{ padding: '1rem', backgroundColor: '#FEE2E2', color: '#B91C1C', borderRadius: '0.375rem', marginBottom: '1.5rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="title">Product Title *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            className="form-input"
                            placeholder="e.g. Men's Leather Casual Sandals"
                            value={formData.title}
                            onChange={handleInputChange}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="description">Product Description *</label>
                        <textarea
                            id="description"
                            name="description"
                            className="form-input"
                            placeholder="Describe the product in detail..."
                            value={formData.description}
                            onChange={handleInputChange}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="form-label" htmlFor="language">Language</label>
                            <select
                                id="language"
                                name="language"
                                className="form-input"
                                value={formData.language}
                                onChange={handleInputChange}
                                disabled={loading}
                            >
                                <option value="English">English</option>
                                <option value="Hindi">Hindi (Mock)</option>
                            </select>
                        </div>

                        <div>
                            <label className="form-label" htmlFor="imageUpload">Image Upload (Optional)</label>
                            <div
                                style={{
                                    border: '1px dashed #D1D5DB',
                                    borderRadius: '0.375rem',
                                    padding: '0.5rem',
                                    textAlign: 'center',
                                    color: '#6B7280',
                                    cursor: 'pointer',
                                    backgroundColor: '#F9FAFB'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <Upload size={18} />
                                    <span style={{ fontSize: '0.875rem' }}>Click to upload</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => setLocation('/')}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ minWidth: '160px' }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                    Processing...
                                </span>
                            ) : 'Auto Categorize'}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default ProductInputPage;
