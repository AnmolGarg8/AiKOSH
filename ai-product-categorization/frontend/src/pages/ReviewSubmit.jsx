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

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const cleanData = {};
            Object.keys(data).forEach(k => cleanData[k] = data[k].value);
            await submitFinalForm(formId, cleanData);
            alert("Form successfully registered with Government Portal!");
            setLocation("/");
        } catch (e) {
            alert("Submission failed");
            setSubmitting(false);
        }
    };

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
