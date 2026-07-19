import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../services/api';

export default function Login({ onLoginSuccess }) {
    const { t } = useTranslation();
    const [, setLocation] = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.detail || 'Invalid email or password');
            }

            const data = await res.json();
            // Store token in localStorage
            localStorage.setItem('aikosh_token', data.access_token);
            localStorage.setItem('aikosh_email', data.email);
            localStorage.setItem('aikosh_role', data.role);

            if (onLoginSuccess) {
                onLoginSuccess(data.access_token);
            }
            setLocation('/agent-mapping');
        } catch (err) {
            console.error(err);
            setError(err.message || 'Server error. Please verify backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '70vh',
            padding: '24px'
        }}>
            <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-md)',
                width: '100%',
                maxWidth: '450px',
                padding: '32px',
                animation: 'fadeIn 0.3s ease-out'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
                        alt="Emblem" 
                        style={{ height: '70px', marginBottom: '16px', filter: 'brightness(0) sepia(1) hue-rotate(15deg) saturate(3)' }} 
                    />
                    <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--primary)' }}>
                        {t('login_title')}
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {t('login_subtitle')}
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: '#FEE2E2',
                        border: '1px solid #FCA5A5',
                        color: '#991B1B',
                        padding: '12px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        marginBottom: '16px',
                        fontWeight: '500'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '18px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-main)' }}>
                            {t('email')}
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="official@indiaai.gov.in"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '6px',
                                border: '1px solid var(--border)',
                                fontSize: '15px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-main)' }}>
                            {t('password')}
                        </label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '6px',
                                border: '1px solid var(--border)',
                                fontSize: '15px'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-large"
                        disabled={loading}
                        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                        {loading ? 'Authenticating...' : t('btn_login')}
                    </button>
                </form>

                <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '16px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    <strong>Demo Credentials:</strong><br />
                    official@indiaai.gov.in / password123
                </div>
            </div>
        </div>
    );
}
