import React from 'react';
import { useTranslation } from 'react-i18next';

export default function AyushDashboard() {
    const { t } = useTranslation();

    return (
        <div className="fade-in">
            <div className="hero-section">
                <div className="hero-content">
                    <div className="badge badge-success" style={{ marginBottom: '16px', display: 'inline-flex' }}>
                        {t('ministry_of_ayush')}
                    </div>
                    <h2 className="hero-title">{t('tab_ayush')}</h2>
                    <p className="hero-subtitle">
                        An Intelligent AYUSH Health System designed to offer traditional Indian medicine recommendation engines. By classifying symptoms, assessing constitution type (Vata, Pitta, Kapha), and prescribing verified herbal and Ayurvedic treatments, we build a healthier, natural lifestyle.
                    </p>
                    <button className="btn btn-primary btn-large" style={{ opacity: 0.7, cursor: 'not-allowed' }}>
                        Open Diagnosis Portal (Coming Soon)
                    </button>
                </div>
                <div className="hero-image-wrapper">
                    <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80" alt="Ayurveda and Health" />
                </div>
            </div>

            <div className="stats-row grid-3">
                <div className="stat-card">
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>🌿</div>
                    <div className="stat-val">Ayurveda</div>
                    <div className="stat-label">Herbal Recommendations</div>
                </div>
                <div className="stat-card">
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>🧬</div>
                    <div className="stat-val">Constitution</div>
                    <div className="stat-label">Prakriti Analysis</div>
                </div>
                <div className="stat-card">
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📖</div>
                    <div className="stat-val">Verified</div>
                    <div className="stat-label">Government Formulary database</div>
                </div>
            </div>
        </div>
    );
}
