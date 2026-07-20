import React, { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { useTranslation } from 'react-i18next';
import { API_URL, getAuthHeaders } from '../services/api';

export default function Dashboard() {
    const [, setLocation] = useLocation();
    const { t } = useTranslation();
    
    const [stats, setStats] = useState({
        active_requirements: 2,
        open_disputes: 1,
        elevated_risk_districts: 1
    });
    const [loadingStats, setLoadingStats] = useState(false);
    const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

    // Fetch live statistics from backend
    useEffect(() => {
        const fetchStats = async () => {
            setLoadingStats(true);
            try {
                const res = await fetch(`${API_URL}/dashboard/stats`, {
                    headers: getAuthHeaders()
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) {
                console.error("Could not fetch live dashboard stats, using mock fallbacks:", err);
            } finally {
                setLoadingStats(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="fade-in" style={{ paddingBottom: '32px' }}>
            {/* Banner Section */}
            <div className="hero-section" style={{ marginBottom: '24px' }}>
                <div className="hero-content">
                    <div className="badge badge-success" style={{ marginBottom: '16px', display: 'inline-flex' }}>
                        IndiaAI Innovation Challenge 2026
                    </div>
                    <h2 className="hero-title">AiKOSH Government Hub</h2>
                    <p className="hero-subtitle">
                        A unified three-module AI platform for the Government of India supporting MSME Agent Mapping, Virtual Dispute Resolution, and Predictive AYUSH Health Forecasting.
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn btn-primary" onClick={() => setLocation('/registration')}>
                            🗣️ Voice Onboarding Wizard
                        </button>
                        <button className="btn btn-outline" style={{ background: 'white' }} onClick={() => setShowPrivacyPolicy(!showPrivacyPolicy)}>
                            🛡️ DPDP Compliance
                        </button>
                    </div>
                </div>
                <div className="hero-image-wrapper">
                    <img 
                        src="https://images.unsplash.com/photo-1541336032412-2048a678540d?auto=format&fit=crop&w=800&q=80" 
                        alt="Unified Governance" 
                    />
                </div>
            </div>

            {/* Live Metrics Row */}
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
                Live National Watch Metrics (Real-time DB Queries)
            </h3>
            
            <div className="stats-row grid-3" style={{ marginBottom: '32px' }}>
                <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)', cursor: 'pointer' }} onClick={() => setLocation('/matching')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '24px' }}>💼</span>
                        {loadingStats && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Syncing...</span>}
                    </div>
                    <div className="stat-val" style={{ marginTop: '12px' }}>{stats.active_requirements}</div>
                    <div className="stat-label">Active Demand Postings (Agent Mapping)</div>
                </div>

                <div className="stat-card" style={{ borderLeft: '4px solid var(--secondary)', cursor: 'pointer' }} onClick={() => setLocation('/negotiation-assistant')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '24px' }}>⚖️</span>
                        {loadingStats && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Syncing...</span>}
                    </div>
                    <div className="stat-val" style={{ marginTop: '12px' }}>{stats.open_disputes}</div>
                    <div className="stat-label">Active Dispute Cases (Negotiation Assistant)</div>
                </div>

                <div className="stat-card" style={{ borderLeft: '4px solid #10B981', cursor: 'pointer' }} onClick={() => setLocation('/ayush-health')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '24px' }}>🌿</span>
                        {loadingStats && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Syncing...</span>}
                    </div>
                    <div className="stat-val" style={{ marginTop: '12px' }}>{stats.elevated_risk_districts}</div>
                    <div className="stat-label">Elevated Risk Districts (AYUSH Watch)</div>
                </div>
            </div>

            {/* Quick Actions Modules Grid */}
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
                AiKOSH Modular Services
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {/* Card 1 */}
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <span style={{ fontSize: '22px' }}>💼</span>
                            <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)' }}>Module 1: MSME Agent Mapping</h4>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                            Combines voice-onboarding inventory extraction with a TF-IDF semantic capability matching engine to connect vendors to corporate demands.
                        </p>
                    </div>
                    <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setLocation('/matching')}>
                        Access Matching Dashboard →
                    </button>
                </div>

                {/* Card 2 */}
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <span style={{ fontSize: '22px' }}>🤝</span>
                            <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)' }}>Module 2: Virtual Negotiation</h4>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                            Assists MSMEs with contract dispute intakes. Extracts key entities via OCR on invoices/agreements and runs ML classifier outcome predictions.
                        </p>
                    </div>
                    <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setLocation('/negotiation-assistant')}>
                        Access Negotiation Center →
                    </button>
                </div>

                {/* Card 3 */}
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <span style={{ fontSize: '22px' }}>🌿</span>
                            <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)' }}>Module 3: AYUSH Health System</h4>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                            Monitors district health trends using Holt's Linear double exponential smoothing forecasting and generates Prakriti wellness plans.
                        </p>
                    </div>
                    <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setLocation('/ayush-health')}>
                        Access AYUSH Dashboard →
                    </button>
                </div>
            </div>

            {/* Collapsible Privacy Policy / DPDP compliance Section */}
            {showPrivacyPolicy && (
                <div className="fade-in" style={{ background: '#FAF9F6', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px', marginTop: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🛡️ Data Handling & DPDP Compliance Statement
                        </h4>
                        <button style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }} onClick={() => setShowPrivacyPolicy(false)}>✕</button>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-main)', lineHeight: '1.6' }}>
                        <p style={{ marginBottom: '12px' }}>
                            In alignment with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> of India, AiKOSH enforces strict data processing boundaries to safeguard user and enterprise information.
                        </p>
                        <h5 style={{ fontWeight: '700', color: 'var(--primary)', margin: '12px 0 6px 0' }}>1. Data Collected Per Module:</h5>
                        <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
                            <li style={{ marginBottom: '4px' }}><strong>MSME Agent Mapping</strong>: Business registration details, inventory catalogs, and pricing bounds. Local storage stores intermediate voice transcripts before form synchronization.</li>
                            <li style={{ marginBottom: '4px' }}><strong>Virtual Negotiation</strong>: Case dispute amounts, names, descriptions (bilingual), and uploaded invoice/contract documents. Extracted document details are stored exclusively inside database entity fields.</li>
                            <li style={{ marginBottom: '4px' }}><strong>AYUSH Health</strong>: Anonymous aggregated district case counts for trend analysis. Wellness quiz answers (Prakriti constitutional indicators) are stored as non-diagnosed, advisory metrics.</li>
                        </ul>
                        <h5 style={{ fontWeight: '700', color: 'var(--primary)', margin: '12px 0 6px 0' }}>2. DPDP Alignment Pillars:</h5>
                        <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
                            <li style={{ marginBottom: '4px' }}><strong>Purpose Limitation</strong>: Information submitted is processed strictly to generate matches, dispute drafts, or health metrics.</li>
                            <li style={{ marginBottom: '4px' }}><strong>Explicit Consent</strong>: Users consent to data analysis upon document upload, voice recording, or questionnaire submission.</li>
                            <li style={{ marginBottom: '4px' }}><strong>Data Minimization</strong>: Extracted entities are kept restricted to fields necessary for the matching or drafting execution.</li>
                        </ul>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '12px' }}>
                            Disclaimer: This is a prototype system built for the IndiaAI Innovation Challenge 2026. Data handling logs are mock indicators intended for evaluation purposes only.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
