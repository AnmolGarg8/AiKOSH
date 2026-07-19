import React, { useState, useEffect } from 'react';
import { Route, Switch, useLocation, Link } from "wouter";
import { useTranslation } from 'react-i18next';
import Dashboard from "./pages/Dashboard";
import FormCatalog from "./pages/FormCatalog";
import VoiceFormFill from "./pages/VoiceFormFill";
import ReviewSubmit from "./pages/ReviewSubmit";
import CategorizationPage from "./pages/CategorizationPage";
import VerificationPage from "./pages/VerificationPage";
import MatchingPage from "./pages/MatchingPage";
import NegotiationDashboard from "./pages/NegotiationDashboard";
import AyushDashboard from "./pages/AyushDashboard";
import Login from "./pages/Login";

const App = () => {
    const { t, i18n } = useTranslation();
    const [location, setLocation] = useLocation();
    const [token, setToken] = useState(localStorage.getItem('aikosh_token'));
    const [currentLang, setCurrentLang] = useState(i18n.language || 'en');

    // Handle token changes and protected route redirection
    useEffect(() => {
        const storedToken = localStorage.getItem('aikosh_token');
        if (!storedToken && location !== '/login') {
            setLocation('/login');
        } else if (storedToken && location === '/login') {
            setLocation('/');
        }
    }, [token, location, setLocation]);

    const handleZoom = (level) => {
        document.documentElement.style.fontSize = level;
    };

    const handleLanguageChange = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('aikosh_lang', lang);
        setCurrentLang(lang);
    };

    const handleLogout = () => {
        localStorage.removeItem('aikosh_token');
        localStorage.removeItem('aikosh_email');
        localStorage.removeItem('aikosh_role');
        setToken(null);
        setLocation('/login');
    };

    // Determine active module tab
    const isNegotiation = location.startsWith('/negotiation-assistant');
    const isAyush = location.startsWith('/ayush-health');
    const isLogin = location === '/login';
    const isAgentMapping = !isNegotiation && !isAyush && !isLogin;

    return (
        <div className="app-container">
            {/* Top Gov Bar */}
            <div className="top-gov-bar">
                <div className="top-gov-bar-left">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="india-flag"></span>
                        <span>{t('government_of_india')}</span>
                    </div>
                    <span style={{ color: '#CBD5E1' }}>|</span>
                    <span style={{ fontWeight: isAgentMapping || isNegotiation ? '600' : '400' }}>
                        {t('ministry_of_msme')}
                    </span>
                    <span style={{ color: '#CBD5E1' }}>|</span>
                    <span style={{ fontWeight: isAyush ? '600' : '400' }}>
                        {t('ministry_of_ayush')}
                    </span>
                </div>
                <div className="top-gov-bar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <a href="#main-content" style={{ color: 'inherit', textDecoration: 'none' }}>
                        {t('skip_to_content')}
                    </a>
                    
                    {/* Text Zoom */}
                    <div style={{ display: 'inline-flex', gap: '8px', borderRight: '1px solid #CBD5E1', paddingRight: '12px' }}>
                        <button onClick={() => handleZoom('110%')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>A+</button>
                        <button onClick={() => handleZoom('100%')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>A</button>
                        <button onClick={() => handleZoom('90%')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>A-</button>
                    </div>

                    {/* Language Toggle */}
                    <div style={{ display: 'inline-flex', gap: '4px', borderRight: token ? '1px solid #CBD5E1' : 'none', paddingRight: token ? '12px' : '0' }}>
                        <button 
                            onClick={() => handleLanguageChange('en')} 
                            style={{ 
                                background: currentLang === 'en' ? 'var(--primary)' : 'none', 
                                color: currentLang === 'en' ? 'white' : 'inherit',
                                border: '1px solid var(--border)',
                                borderRadius: '4px',
                                padding: '2px 8px',
                                cursor: 'pointer', 
                                fontSize: '11px',
                                fontWeight: '600'
                            }}
                        >
                            English
                        </button>
                        <button 
                            onClick={() => handleLanguageChange('hi')} 
                            style={{ 
                                background: currentLang === 'hi' ? 'var(--primary)' : 'none', 
                                color: currentLang === 'hi' ? 'white' : 'inherit',
                                border: '1px solid var(--border)',
                                borderRadius: '4px',
                                padding: '2px 8px',
                                cursor: 'pointer', 
                                fontSize: '11px',
                                fontWeight: '600'
                            }}
                        >
                            हिंदी
                        </button>
                    </div>

                    {/* Logout Button */}
                    {token && (
                        <button 
                            onClick={handleLogout} 
                            style={{ 
                                background: '#EF4444', 
                                color: 'white', 
                                border: 'none', 
                                padding: '4px 10px', 
                                borderRadius: '4px', 
                                cursor: 'pointer', 
                                fontSize: '11px',
                                fontWeight: '600'
                            }}
                        >
                            {t('btn_logout')}
                        </button>
                    )}
                </div>
            </div>

            {/* Gov Header */}
            <header className="gov-header" style={{ paddingBottom: isLogin ? '16px' : '0' }}>
                <div className="header-content" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="brand">
                            <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
                                alt="Emblem" 
                                style={{ height: '52px', filter: 'brightness(0) invert(1)' }} 
                            />
                            <div>
                                <h1 className="header-title" style={{ letterSpacing: '0.5px' }}>AiKOSH Hub</h1>
                                <p className="header-subtitle" style={{ color: '#93C5FD' }}>
                                    {t('login_subtitle')}
                                </p>
                            </div>
                        </div>

                        {token && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ 
                                    background: 'rgba(255,255,255,0.15)', 
                                    padding: '4px 12px', 
                                    borderRadius: '20px', 
                                    fontSize: '12px',
                                    fontWeight: '500'
                                }}>
                                    👤 {t('auth_role_official')}: {localStorage.getItem('aikosh_email')}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Top Level Module Navigation Tabs */}
                    {token && !isLogin && (
                        <nav style={{ 
                            display: 'flex', 
                            gap: '8px', 
                            borderBottom: '1px solid rgba(255,255,255,0.15)',
                            paddingBottom: '0',
                            marginTop: '8px'
                        }}>
                            <Link href="/">
                                <a style={{ 
                                    padding: '10px 20px', 
                                    color: isAgentMapping ? 'white' : 'rgba(255,255,255,0.6)', 
                                    textDecoration: 'none', 
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    borderBottom: isAgentMapping ? '3px solid var(--secondary)' : '3px solid transparent',
                                    transition: 'all 0.2s'
                                }}>
                                    💼 {t('tab_agent_mapping')}
                                </a>
                            </Link>
                            <Link href="/negotiation-assistant">
                                <a style={{ 
                                    padding: '10px 20px', 
                                    color: isNegotiation ? 'white' : 'rgba(255,255,255,0.6)', 
                                    textDecoration: 'none', 
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    borderBottom: isNegotiation ? '3px solid var(--secondary)' : '3px solid transparent',
                                    transition: 'all 0.2s'
                                }}>
                                    🤝 {t('tab_negotiation')}
                                </a>
                            </Link>
                            <Link href="/ayush-health">
                                <a style={{ 
                                    padding: '10px 20px', 
                                    color: isAyush ? 'white' : 'rgba(255,255,255,0.6)', 
                                    textDecoration: 'none', 
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    borderBottom: isAyush ? '3px solid var(--secondary)' : '3px solid transparent',
                                    transition: 'all 0.2s'
                                }}>
                                    🌿 {t('tab_ayush')}
                                </a>
                            </Link>
                        </nav>
                    )}
                </div>
            </header>

            {/* Agent Mapping Module Sub-navigation */}
            {token && isAgentMapping && !isLogin && (
                <div style={{ background: '#F1F5F9', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 24px' }}>
                        <nav style={{ display: 'flex', gap: '24px', padding: '12px 0' }}>
                            <Link href="/">
                                <a style={{ 
                                    color: location === '/' ? 'var(--primary)' : 'var(--text-muted)', 
                                    fontWeight: '600', 
                                    fontSize: '13px',
                                    textDecoration: 'none',
                                    borderBottom: location === '/' ? '2px solid var(--primary)' : '2px solid transparent',
                                    paddingBottom: '4px',
                                    transition: 'all 0.2s'
                                }}>
                                    {t('subtab_dashboard')}
                                </a>
                            </Link>
                            <Link href="/registration">
                                <a style={{ 
                                    color: location.startsWith('/registration') ? 'var(--primary)' : 'var(--text-muted)', 
                                    fontWeight: '600', 
                                    fontSize: '13px',
                                    textDecoration: 'none',
                                    borderBottom: location.startsWith('/registration') ? '2px solid var(--primary)' : '2px solid transparent',
                                    paddingBottom: '4px',
                                    transition: 'all 0.2s'
                                }}>
                                    {t('subtab_registration')}
                                </a>
                            </Link>
                            <Link href="/categorization">
                                <a style={{ 
                                    color: location === '/categorization' ? 'var(--primary)' : 'var(--text-muted)', 
                                    fontWeight: '600', 
                                    fontSize: '13px',
                                    textDecoration: 'none',
                                    borderBottom: location === '/categorization' ? '2px solid var(--primary)' : '2px solid transparent',
                                    paddingBottom: '4px',
                                    transition: 'all 0.2s'
                                }}>
                                    {t('subtab_categorization')}
                                </a>
                            </Link>
                            <Link href="/verification">
                                <a style={{ 
                                    color: location === '/verification' ? 'var(--primary)' : 'var(--text-muted)', 
                                    fontWeight: '600', 
                                    fontSize: '13px',
                                    textDecoration: 'none',
                                    borderBottom: location === '/verification' ? '2px solid var(--primary)' : '2px solid transparent',
                                    paddingBottom: '4px',
                                    transition: 'all 0.2s'
                                }}>
                                    {t('subtab_verification')}
                                </a>
                            </Link>
                            <Link href="/matching">
                                <a style={{ 
                                    color: location === '/matching' ? 'var(--primary)' : 'var(--text-muted)', 
                                    fontWeight: '600', 
                                    fontSize: '13px',
                                    textDecoration: 'none',
                                    borderBottom: location === '/matching' ? '2px solid var(--primary)' : '2px solid transparent',
                                    paddingBottom: '4px',
                                    transition: 'all 0.2s'
                                }}>
                                    {t('subtab_matching')}
                                </a>
                            </Link>
                        </nav>
                    </div>
                </div>
            )}

            {/* Main Layout */}
            <main className="main-layout" id="main-content">
                <Switch>
                    {/* Public Auth Route */}
                    <Route path="/login">
                        <Login onLoginSuccess={(newToken) => setToken(newToken)} />
                    </Route>

                    {/* Agent Mapping Module Routing */}
                    <Route path="/" component={Dashboard} />
                    <Route path="/registration" component={FormCatalog} />
                    <Route path="/registration/:formId" component={VoiceFormFill} />
                    <Route path="/review/:formId" component={ReviewSubmit} />
                    <Route path="/categorization" component={CategorizationPage} />
                    <Route path="/verification" component={VerificationPage} />
                    <Route path="/matching" component={MatchingPage} />

                    {/* Negotiation Assistant Module Routing */}
                    <Route path="/negotiation-assistant" component={NegotiationDashboard} />

                    {/* AYUSH Health System Module Routing */}
                    <Route path="/ayush-health" component={AyushDashboard} />

                    {/* Fallback */}
                    <Route>
                        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                            <h2>404 - Page Not Found</h2>
                            <p>The page you are looking for does not exist.</p>
                            <Link href="/"><a className="btn btn-primary" style={{ marginTop: '16px', display: 'inline-block' }}>Go to Home</a></Link>
                        </div>
                    </Route>
                </Switch>
            </main>

            {/* Gov Footer */}
            <footer className="gov-footer" style={{ borderTop: '1px solid var(--border)', background: '#F8FAFC', padding: '24px 16px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <p style={{ fontWeight: '500', color: 'var(--text-main)', fontSize: '14px' }}>
                        Built for the MSME & AYUSH Sectors • Powered by IndiaAI
                    </p>
                    <p style={{ fontSize: '11px', color: '#EF4444', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        ⚠️ {t('indiaai_challenge')}
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default App;
