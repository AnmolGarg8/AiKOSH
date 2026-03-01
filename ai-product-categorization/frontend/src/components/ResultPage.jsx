import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle, AlertCircle, FileText, Edit2, ChevronRight, Save, X } from 'lucide-react';

const ResultPage = ({ result }) => {
    const [_, setLocation] = useLocation();
    const [isEditing, setIsEditing] = useState(false);

    // We store editable attributes in state
    const [editableAttributes, setEditableAttributes] = useState(result?.attributes || {});

    if (!result) {
        return (
            <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                <AlertCircle size={48} color="#EF4444" style={{ margin: '0 auto 1rem' }} />
                <h2>No results found</h2>
                <p style={{ color: '#6B7280', marginBottom: '2rem' }}>Please submit a product description first.</p>
                <button className="btn btn-primary" onClick={() => setLocation('/input')}>
                    Go back
                </button>
            </div>
        );
    }

    const confidenceColor = result.confidence >= 0.8 ? '#10B981' : result.confidence >= 0.6 ? '#F59E0B' : '#EF4444';

    const handlePrint = () => {
        window.print();
    };

    const handleAttributeChange = (key, value) => {
        setEditableAttributes(prev => ({
            ...prev,
            [key]: value
        }));
    };

    return (
        <div className="container print-container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
            <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <CheckCircle size={32} color="#10B981" />
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Categorization Complete</h2>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>Predicted Category</h3>
                    <span className="no-print" style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#EFF6FF',
                        color: '#1D4ED8',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                    }}>
                        AI Matched
                    </span>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    padding: '1rem',
                    backgroundColor: '#F3F4F6',
                    borderRadius: '0.375rem',
                }}>
                    {result.category_path && result.category_path.length > 0 ? (
                        result.category_path.map((node, index) => (
                            <React.Fragment key={index}>
                                <span style={{
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #E5E7EB',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: '#374151'
                                }}>
                                    {node}
                                </span>
                                {index < result.category_path.length - 1 && (
                                    <ChevronRight size={16} color="#9CA3AF" />
                                )}
                            </React.Fragment>
                        ))
                    ) : (
                        <span style={{ fontSize: '1.125rem', fontWeight: '500', color: '#374151' }}>{result.category}</span>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                            Extracted Attributes
                        </h3>
                        {!isEditing ? (
                            <button className="btn-icon no-print" onClick={() => setIsEditing(true)} aria-label="Edit Attributes">
                                <Edit2 size={16} />
                            </button>
                        ) : (
                            <div className="no-print" style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn-icon" onClick={() => setIsEditing(false)} style={{ color: '#10B981' }} aria-label="Save Attributes">
                                    <Save size={16} />
                                </button>
                                <button className="btn-icon" onClick={() => { setIsEditing(false); setEditableAttributes(result.attributes); }} style={{ color: '#EF4444' }} aria-label="Cancel Editing">
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {Object.entries(editableAttributes).map(([key, value]) => (
                            <li key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #F3F4F6', minHeight: '40px' }}>
                                <span style={{ color: '#6B7280', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        className="form-input"
                                        style={{ width: '60%', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                                        value={value}
                                        onChange={(e) => handleAttributeChange(key, e.target.value)}
                                    />
                                ) : (
                                    <span style={{ fontWeight: '500', color: '#111827' }}>{value}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="card">
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Confidence Score</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: 'bold', lineHeight: 1, color: confidenceColor }}>
                            {Math.round(result.confidence * 100)}%
                        </span>
                    </div>

                    <div style={{ width: '100%', height: '8px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                            style={{
                                height: '100%',
                                width: `${result.confidence * 100}%`,
                                backgroundColor: confidenceColor,
                                transition: 'width 1s ease-out'
                            }}
                        />
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.5rem' }}>
                        High confidence indicates a strong match with our taxonomy.
                    </p>
                </div>
            </div>

            <div className="no-print flex-mobile-col" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E5E7EB', paddingTop: '1.5rem', gap: '1rem' }}>
                <button className="btn btn-outline" onClick={() => setIsEditing(!isEditing)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Edit2 size={18} />
                    {isEditing ? 'Cancel Editing' : 'Edit Manually'}
                </button>
                <div style={{ display: 'flex', gap: '1rem' }} className="flex-mobile-col">
                    <button className="btn btn-outline" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={18} />
                        Download PDF Report
                    </button>
                    <button className="btn btn-primary" onClick={() => setLocation('/input')}>
                        Categorize Another
                    </button>
                </div>
            </div>

            <style>{`
                .btn-icon {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: #6B7280;
                    padding: 0.25rem;
                    border-radius: 0.25rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .btn-icon:hover {
                    background-color: #F3F4F6;
                    color: #111827;
                }
                
                @media (max-width: 768px) {
                    .flex-mobile-col {
                        flex-direction: column;
                        width: 100%;
                    }
                    .flex-mobile-col > button, .flex-mobile-col > div {
                        width: 100%;
                        justify-content: center;
                    }
                }

                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background-color: white;
                    }
                    .print-container {
                        padding: 0 !important;
                    }
                    .card {
                        box-shadow: none !important;
                        border: 1px solid #E5E7EB !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default ResultPage;
