import React from 'react';
import { useTranslation } from 'react-i18next';

export default function NegotiationDashboard() {
    const { t } = useTranslation();

    return (
        <div className="fade-in">
            <div className="hero-section">
                <div className="hero-content">
                    <div className="badge badge-success" style={{ marginBottom: '16px', display: 'inline-flex' }}>
                        {t('ministry_of_msme')}
                    </div>
                    <h2 className="hero-title">{t('tab_negotiation')}</h2>
                    <p className="hero-subtitle">
                        An AI-powered agent designed to negotiate contracts and terms natively. It assists MSMEs in automated price negotiation, procurement matching, and secure dispute resolution using smart contracts.
                    </p>
                    <button className="btn btn-primary btn-large" style={{ opacity: 0.7, cursor: 'not-allowed' }}>
                        Launch Negotiation Terminal (Coming Soon)
                    </button>
                </div>
                <div className="hero-image-wrapper">
                    <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80" alt="Negotiation and Contracts" />
                </div>
            </div>

            <div className="stats-row grid-3">
                <div className="stat-card">
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>🤝</div>
                    <div className="stat-val">B2B</div>
                    <div className="stat-label">Automated Procurement</div>
                </div>
                <div className="stat-card">
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>💬</div>
                    <div className="stat-val">Multilingual</div>
                    <div className="stat-label">Negotiations in local dialects</div>
                </div>
                <div className="stat-card">
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>🛡️</div>
                    <div className="stat-val">100%</div>
                    <div className="stat-label">Secure Smart Contracts</div>
                </div>
            </div>
        </div>
    );
}
