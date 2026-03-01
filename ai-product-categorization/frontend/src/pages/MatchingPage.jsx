import React, { useState } from 'react';
import MicrophoneButton from '../components/MicrophoneButton';

export default function MatchingPage() {
    const [desc, setDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [status, setStatus] = useState('Idle');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    const handleMatch = () => {
        if (!desc) return;
        setLoading(true);
        setResult(null);

        // Mock AI Matching processing
        setTimeout(() => {
            const lowerDesc = desc.toLowerCase();

            // Extract some fake parameters based on text
            let region = "Uttar Pradesh (Target: North India)";
            if (lowerDesc.includes('south') || lowerDesc.includes('bangalore') || lowerDesc.includes('chennai')) region = "South India Hub";
            if (lowerDesc.includes('west') || lowerDesc.includes('mumbai') || lowerDesc.includes('gujarat')) region = "West India Hub";

            let product = "Leather Accessories";
            if (lowerDesc.includes('cotton') || lowerDesc.includes('kurti') || lowerDesc.includes('apparel')) product = "Textiles & Apparel";
            if (lowerDesc.includes('food') || lowerDesc.includes('spice')) product = "FMCG & Groceries";

            setResult({
                snpName: product === "Textiles & Apparel" ? "Myntra ONDC Seller Network" : "NSIC Certified Logistics Hub",
                matchScore: 94,
                insights: {
                    productMatch: product,
                    capacity: lowerDesc.includes('high') || lowerDesc.includes('bulk') ? "High Volume Capable" : "Small-to-Medium Batch",
                    region: region,
                    snpPerformance: "98% Order Fulfillment Rate"
                }
            });
            setLoading(false);
        }, 2000);
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
            setStatus('Verified. Ready for Match.');
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
                <img src="https://images.unsplash.com/photo-1556761175-103db12ba7a8?auto=format&fit=crop&w=1200&q=80" alt="Business Partnership handshake" className="banner-image" />
                <div className="banner-content">
                    <h2 className="banner-title">Smart SNP Matching Engine</h2>
                    <p className="banner-desc">Speak out what your business manufactures, your region, and your monthly production capacity. AI will recommend the top Seller Network Participant.</p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '16px', fontSize: '16px', color: '#334155' }}>Describe your Operations (Voice or Text)</h3>

                    <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <textarea
                                className="gov-input"
                                style={{ width: '100%', minHeight: '160px', padding: '16px', resize: 'vertical', fontSize: '16px' }}
                                placeholder='For example: "We manufacture 1000 handmade cotton kurtis per month in Kanpur, looking for a strong seller network..."'
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
                            <button className="btn btn-primary btn-large" onClick={handleMatch} disabled={!desc || loading}>
                                {loading ? 'Finding Best SNP...' : 'Find SNP Match 🤝'}
                            </button>
                        )}
                    </div>
                </div>

                {result && (
                    <div className="card fade-in" style={{ borderLeft: '4px solid var(--secondary)', background: '#FFFFFF' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <div>
                                <h3 style={{ fontSize: '20px', color: 'var(--primary)', marginBottom: '4px' }}>Recommended SNP</h3>
                                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Optimum match based on MSME capabilities and SNP history</div>
                            </div>
                            <div className="badge badge-success" style={{ fontSize: '14px', padding: '8px 16px', display: 'flex', gap: '8px', alignItems: 'center', background: '#DBEAFE', color: '#1E40AF' }}>
                                <span>Match Score:</span> <strong>{result.matchScore}%</strong>
                            </div>
                        </div>

                        <div style={{ marginBottom: '32px', background: '#F8FAFC', padding: '24px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '600', letterSpacing: '0.5px' }}>
                                Partner Identity
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ background: 'var(--secondary)', color: 'white', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold' }}>
                                    {result.snpName.charAt(0)}
                                </div>
                                <div style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-main)' }}>
                                    {result.snpName}
                                </div>
                                <span className="badge badge-success" style={{ marginLeft: 'auto' }}>Verified SNP</span>
                            </div>
                        </div>

                        <div className="grid-3" style={{ gap: '24px' }}>
                            <div style={{ padding: '20px', background: 'white', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600' }}>Product Alignment</div>
                                <div style={{ fontWeight: '600', fontSize: '16px', color: 'var(--text-main)' }}>{result.insights.productMatch}</div>
                            </div>
                            <div style={{ padding: '20px', background: 'white', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600' }}>Region Assessed</div>
                                <div style={{ fontWeight: '600', fontSize: '16px', color: 'var(--text-main)' }}>{result.insights.region}</div>
                            </div>
                            <div style={{ padding: '20px', background: 'white', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600' }}>Capacity Strategy</div>
                                <div style={{ fontWeight: '600', fontSize: '16px', color: 'var(--primary)' }}>{result.insights.capacity}</div>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', marginTop: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', background: '#F0FDF4', padding: '20px', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                                <span style={{ fontSize: '24px', lineHeight: 1 }}>📈</span>
                                <div>
                                    <div style={{ color: '#166534', fontWeight: '600', marginBottom: '6px', fontSize: '15px' }}>SNP Past Performance</div>
                                    <div style={{ color: '#166534', fontSize: '14px', lineHeight: '1.5' }}>This network maintains a <strong>{result.insights.snpPerformance}</strong> with regional fulfillment operations perfectly suited for your declared business capacity.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
