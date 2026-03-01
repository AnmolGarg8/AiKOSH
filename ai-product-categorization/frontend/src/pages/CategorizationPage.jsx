import React, { useState } from 'react';
import MicrophoneButton from '../components/MicrophoneButton';

export default function CategorizationPage() {
    const [desc, setDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [status, setStatus] = useState('Idle');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    const handleCategorize = () => {
        if (!desc) return;
        setLoading(true);
        setResult(null);

        // Mock AI Categorization processing
        setTimeout(() => {
            const lowerDesc = desc.toLowerCase();
            setResult({
                path: ["Apparel", "Women", "Ethnic Wear", "Kurti"],
                material: lowerDesc.includes('cotton') ? "Cotton" : (lowerDesc.includes('silk') ? "Silk" : "Mixed"),
                category: lowerDesc.includes('kurti') ? "Kurti" : "Apparel",
                gender: "Women",
                confidence: 96,
                tags: ["Fashion", "Ethnic", "Indian Wear"]
            });
            setLoading(false);
        }, 1500);
    }

    const handleTranscriptUpdate = (newText) => {
        setDesc(newText);
        setIsConfirmed(false);
    };

    const handleVerifyVoice = () => {
        if (!desc) return;
        window.dispatchEvent(new Event('stop-mic'));
        setIsVerifying(true);
        setStatus('Verifying Input...');

        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance();
        msg.text = `You said: ${desc}. Is this information correct and ready to proceed?`;
        msg.lang = 'hi-IN';

        msg.onend = () => {
            setIsVerifying(false);
            setIsConfirmed(true);
            setStatus('Verified. Ready to Categorize.');
        };

        window.speechSynthesis.speak(msg);
    };

    return (
        <div className="fade-in">
            <style>
                {`
                @keyframes local-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .anim-spin { animation: local-spin 1s linear infinite; }
                `}
            </style>

            <div className="banner-header">
                <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80" alt="Warehouse and Logistics" className="banner-image" />
                <div className="banner-content">
                    <h2 className="banner-title">AI Product Categorisation</h2>
                    <p className="banner-desc">Speak or type exactly what you sell. We will automatically map it to the correct ONDC taxonomy hierarchy.</p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '16px', fontSize: '16px', color: '#334155' }}>Describe your product (Voice or Text)</h3>

                    <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <textarea
                                className="gov-input"
                                style={{ width: '100%', minHeight: '160px', padding: '16px', resize: 'vertical', fontSize: '16px' }}
                                placeholder='For example: "Handmade cotton kurti for women..."'
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '160px', padding: '24px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                            <MicrophoneButton
                                onTranscriptUpdate={handleTranscriptUpdate}
                                onStatusChange={setStatus}
                            />
                            <span style={{ fontSize: '13px', marginTop: '16px', color: 'var(--text-muted)', fontWeight: '500', textAlign: 'center' }}>{status}</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-start', gap: '16px' }}>
                        {!isConfirmed ? (
                            <button className="btn btn-secondary btn-large" onClick={handleVerifyVoice} disabled={!desc || isVerifying}>
                                {isVerifying ? 'Speaking...' : 'Verify Input 🗣️'}
                            </button>
                        ) : (
                            <button className="btn btn-primary btn-large" onClick={handleCategorize} disabled={!desc || loading}>
                                {loading ? 'Processing...' : 'Run AI Product Categorisation ✨'}
                            </button>
                        )}
                    </div>
                </div>

                {result && (
                    <div className="card fade-in" style={{ borderLeft: '4px solid var(--success)', background: '#FFFFFF' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <div>
                                <h3 style={{ fontSize: '20px', color: 'var(--primary)', marginBottom: '4px' }}>Predicted Taxonomy Results</h3>
                                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Mapped to ONDC Network Standards</div>
                            </div>
                            <div className="badge badge-success" style={{ fontSize: '14px', padding: '8px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span>AI Confidence:</span> <strong>{result.confidence}%</strong>
                            </div>
                        </div>

                        <div style={{ marginBottom: '32px', background: '#F8FAFC', padding: '24px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '600', letterSpacing: '0.5px' }}>
                                Master Category Path
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                {result.path.map((node, i) => (
                                    <React.Fragment key={i}>
                                        <div style={{ background: '#DBEAFE', color: '#1E40AF', fontSize: '15px', fontWeight: '500', padding: '8px 16px', borderRadius: '4px', border: '1px solid #BFDBFE' }}>
                                            {node}
                                        </div>
                                        {i < result.path.length - 1 && <span style={{ color: '#94A3B8', fontWeight: 'bold' }}>▶</span>}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        <div className="grid-3" style={{ gap: '24px' }}>
                            <div style={{ padding: '20px', background: 'white', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600' }}>Core Material</div>
                                <div style={{ fontWeight: '600', fontSize: '18px', color: 'var(--text-main)' }}>{result.material}</div>
                            </div>
                            <div style={{ padding: '20px', background: 'white', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600' }}>Target Audience</div>
                                <div style={{ fontWeight: '600', fontSize: '18px', color: 'var(--text-main)' }}>{result.gender}</div>
                            </div>
                            <div style={{ padding: '20px', background: 'white', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600' }}>Extracted Tags</div>
                                <div style={{ fontWeight: '500', fontSize: '16px', color: '#64748B' }}>#{result.tags.join(" #")}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
