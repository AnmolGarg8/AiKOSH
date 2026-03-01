import React from 'react';
import { Route, Switch } from "wouter";
import Dashboard from "./pages/Dashboard";
import FormCatalog from "./pages/FormCatalog";
import VoiceFormFill from "./pages/VoiceFormFill";
import ReviewSubmit from "./pages/ReviewSubmit";
import CategorizationPage from "./pages/CategorizationPage";
import VerificationPage from "./pages/VerificationPage";
import MatchingPage from "./pages/MatchingPage";

const App = () => {
    return (
        <div className="app-container">
            <div className="top-gov-bar">
                <div className="top-gov-bar-left">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="india-flag"></span>
                        <span>GOVERNMENT OF INDIA</span>
                    </div>
                    <span style={{ color: '#CBD5E1' }}>|</span>
                    <span>Ministry of Micro, Small & Medium Enterprises</span>
                </div>
                <div className="top-gov-bar-right">
                    <span style={{ marginRight: '16px' }}>Skip to Main Content</span>
                    <span>A+ A A-</span>
                </div>
            </div>

            <header className="gov-header">
                <div className="header-content">
                    <div className="brand">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" style={{ height: '48px', filter: 'brightness(0) invert(1)' }} />
                        <div>
                            <h1 className="header-title">ONDC Voice Registry</h1>
                            <p className="header-subtitle">MSME Empowerment Portal</p>
                        </div>
                    </div>
                    <nav className="header-nav">
                        <a href="/">Dashboard</a>
                        <a href="/registration">Registration</a>
                        <a href="/categorization">AI Categorisation</a>
                        <a href="/verification">Quick Verification</a>
                        <a href="/matching">Matching SNP</a>
                    </nav>
                </div>
            </header>

            <main className="main-layout">
                <Switch>
                    <Route path="/" component={Dashboard} />
                    <Route path="/registration" component={FormCatalog} />
                    <Route path="/registration/:formId" component={VoiceFormFill} />
                    <Route path="/review/:formId" component={ReviewSubmit} />
                    <Route path="/categorization" component={CategorizationPage} />
                    <Route path="/verification" component={VerificationPage} />
                    <Route path="/matching" component={MatchingPage} />
                </Switch>
            </main>

            <footer className="gov-footer">
                <p>Built for the MSME Sector • Powered by Voice AI</p>
            </footer>
        </div>
    );
};

export default App;
