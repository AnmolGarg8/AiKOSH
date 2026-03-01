import React from 'react';

export default function VerificationPage() {
    return (
        <div className="fade-in" style={{ padding: '24px' }}>
            <div className="page-header">
                <h2 className="page-title">Document Auto-Verification</h2>
                <p className="page-desc">Upload GST, PAN, or Udyam copies to validate via APIs without manual effort.</p>
            </div>
            <div className="card">
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                    <h3 style={{ marginBottom: '8px' }}>Verification Engine (Draft)</h3>
                    <p>This module is currently being integrated with the new design system.</p>
                </div>
            </div>
        </div>
    );
}
