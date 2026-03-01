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
            <header className="gov-header">
                <div className="header-content">
                    <div className="brand">
                        <span className="logo-icon">🏛️</span>
                        <div>
                            <h1 className="header-title">ONDC Voice Registry</h1>
                            <p className="header-subtitle">MSME Government Form Auto-Fill System</p>
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
