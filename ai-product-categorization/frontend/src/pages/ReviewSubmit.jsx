import React, { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { submitFinalForm, fetchForms } from '../services/api';

export default function ReviewSubmit({ params }) {
    const { formId } = params;
    const [, setLocation] = useLocation();
    const [data, setData] = useState({});
    const [formDef, setFormDef] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(`review_${formId}`);
        if (saved) setData(JSON.parse(saved));

        fetchForms().then(forms => {
            setFormDef(forms.find(f => f.id === formId));
        });
    }, [formId]);

    const [successCategory, setSuccessCategory] = useState(null);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const cleanData = {};
            Object.keys(data).forEach(k => cleanData[k] = data[k].value);
            const res = await submitFinalForm(formId, cleanData);
            setSuccessCategory(res.category || "textiles");
        } catch (e) {
            alert("Submission failed");
            setSubmitting(false);
        }
    };

    if (successCategory) {
        return (
            <div className="fade-in" style={{ 
                textAlign: 'center', 
                padding: '48px 24px', 
                background: 'white', 
                borderRadius: '8px', 
                border: '1px solid var(--border)',
                maxWidth: '650px',
                margin: '40px auto',
                boxShadow: 'var(--shadow-md)'
            }}>
                <div style={{ fontSize: '64px', marginBottom: '24px' }}>🇮🇳</div>
                <h2 style={{ color: 'var(--success)', marginBottom: '16px', fontWeight: '700' }}>Registration Completed!</h2>
                <p style={{ fontSize: '16px', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '32px' }}>
                    Your enterprise registration form has been validated and recorded. <br />
                    <strong style={{ color: 'var(--primary)' }}>Your profile is now visible to requirement postings in "{successCategory.toUpperCase()}"</strong>.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                    <button className="btn btn-outline" onClick={() => setLocation('/matching')}>View Matching Demands</button>
                    <button className="btn btn-primary" onClick={() => setLocation('/')}>Return to Dashboard</button>
                </div>
            </div>
        );
    }

    if (!formDef) return <div className="loading">Preparing formal review...</div>;

    return (
        <div className="review-layout fade-in">
            <div className="review-header">
                <h2>Review: {formDef.name}</h2>
                <div className="badge badge-success">Ready for Submission</div>
            </div>

            <div className="review-card mock-gov-layout">
                <div className="review-grid">
                    {formDef.fields.map(field => {
                        const fieldName = field.name || field;
                        const label = field.label || fieldName.replace(/_/g, ' ');
                        const fieldData = data[fieldName] || { value: '', confidence: 0 };
                        const isLowConfidence = fieldData.confidence > 0 && fieldData.confidence < 0.90;

                        return (
                            <div className={`review-row ${isLowConfidence ? 'review-warning' : ''}`} key={fieldName}>
                                <div className="review-label">{label}</div>
                                <div className="review-value">
                                    {fieldData.value || <span className="empty-val">Not Provided</span>}
                                </div>
                                {isLowConfidence && <div className="review-tag">⚠️ Review Check</div>}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="review-actions">
                <button className="btn btn-outline" onClick={() => setLocation(`/registration/${formId}`)}>
                    ← Back to Edit
                </button>
                <div className="action-group">
                    <button className="btn btn-outline" onClick={() => window.print()}>📥 Download PDF</button>
                    <button className="btn btn-primary btn-large" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Submitting to Portal...' : 'Confirm & Submit Application'}
                    </button>
                </div>
            </div>
        </div>
    );
}
