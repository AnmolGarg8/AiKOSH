import React from 'react';
import { useLocation } from 'wouter';
import { Box, Layers, Zap } from 'lucide-react';

const LandingPage = () => {
    const [_, setLocation] = useLocation();

    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: '#0A1628' }}>
                    AI-Powered Product Onboarding for Small Businesses
                </h1>
                <p style={{ fontSize: '1.25rem', color: '#64748B', marginBottom: '2rem' }}>
                    Automate the tedious task of product categorization. Our system instantly classifies your products, extracts key attributes, and prepares them for eCommerce platforms.
                </p>
                <button
                    className="btn btn-primary"
                    onClick={() => setLocation('/input')}
                    style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}
                >
                    Start Categorization
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                <div className="card">
                    <Zap style={{ width: '40px', height: '40px', color: '#2979E8', marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Instant Classification</h3>
                    <p style={{ color: '#64748B' }}>Powered by advanced machine learning models that map to standard taxonomy instantly.</p>
                </div>
                <div className="card">
                    <Layers style={{ width: '40px', height: '40px', color: '#2979E8', marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Attribute Extraction</h3>
                    <p style={{ color: '#64748B' }}>Automatically identifies material, target audience, and usage type from description.</p>
                </div>
                <div className="card">
                    <Box style={{ width: '40px', height: '40px', color: '#2979E8', marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>E-Commerce Ready</h3>
                    <p style={{ color: '#64748B' }}>Outputs structured data compliant with standard marketplace mappings.</p>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
