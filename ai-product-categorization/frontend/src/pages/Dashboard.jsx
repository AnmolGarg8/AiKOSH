import React from 'react';
import { useLocation } from "wouter";
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
    const [, setLocation] = useLocation();
    const { t } = useTranslation();

    return (
        <div className="fade-in">
            <div className="hero-section">
                <div className="hero-content">
                    <div className="badge badge-success" style={{ marginBottom: '16px', display: 'inline-flex' }}>Digital India Initiative</div>
                    <h2 className="hero-title">{t('welcome_title')}</h2>
                    <p className="hero-subtitle">
                        {t('welcome_desc')}
                    </p>
                    <button className="btn btn-primary btn-large" onClick={() => setLocation('/registration')}>
                        {t('btn_start_reg')}
                    </button>
                </div>
                <div className="hero-image-wrapper">
                    <img src="https://images.unsplash.com/photo-1541336032412-2048a678540d?auto=format&fit=crop&w=800&q=80" alt="Finance and Governance" />
                </div>
            </div>

            <div className="stats-row grid-3">
                <div className="stat-card">
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📝</div>
                    <div className="stat-val">4+</div>
                    <div className="stat-label">{t('stat_integrated')}</div>
                </div>
                <div className="stat-card">
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>🗣️</div>
                    <div className="stat-val">Bilingual</div>
                    <div className="stat-label">{t('stat_bilingual')}</div>
                </div>
                <div className="stat-card">
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚡</div>
                    <div className="stat-val">100%</div>
                    <div className="stat-label">{t('stat_paperless')}</div>
                </div>
            </div>
        </div>
    );
}
