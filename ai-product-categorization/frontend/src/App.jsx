import React, { useState } from 'react';
import { Route, Switch } from 'wouter';
import { Layout } from 'lucide-react';
import LandingPage from './components/LandingPage.jsx';
import ProductInputPage from './components/ProductInputPage.jsx';
import ResultPage from './components/ResultPage.jsx';

function App() {
    const [categorizationResult, setCategorizationResult] = useState(null);

    return (
        <div className="app">
            <nav className="navbar">
                <div className="container nav-container">
                    <a href="/" className="nav-logo">
                        <Layout style={{ width: '24px', height: '24px', color: '#FFFFFF' }} />
                        AI Product Categorization
                    </a>
                </div>
            </nav>

            <main>
                <Switch>
                    <Route path="/">
                        <LandingPage />
                    </Route>
                    <Route path="/input">
                        <ProductInputPage setResult={setCategorizationResult} />
                    </Route>
                    <Route path="/result">
                        <ResultPage result={categorizationResult} />
                    </Route>
                    <Route>
                        <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                            <h2>Page Not Found</h2>
                        </div>
                    </Route>
                </Switch>
            </main>
        </div>
    );
}

export default App;
