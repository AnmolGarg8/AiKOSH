import React, { useState, useEffect, useRef, useCallback } from 'react';

// Icons
const MicIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>;
const MicOffIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>;
const CheckCircleIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const NetworkIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>;
const SparklesIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>;
const MenuIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
const TagIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>;
const UploadIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>;
const FileIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const StoreIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"></path><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"></path><path d="M2 7h20"></path><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"></path></svg>;

// Reusable Voice Input Component
const VoiceInputBox = ({ value, onChange, placeholder, onSubmit, submitLabel, icon: IconComponent, height = "120px" }) => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const originalValueRef = useRef('');

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                alert("Your browser does not support speech recognition. Please try Google Chrome, Edge, or Safari.");
                return;
            }

            originalValueRef.current = value; // Save starting text

            try {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'hi-IN'; // Works for Hindi and English

                recognition.onresult = (event) => {
                    let currentTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        currentTranscript += event.results[i][0].transcript;
                    }
                    const prefix = originalValueRef.current ? originalValueRef.current + ' ' : '';
                    onChange(prefix + currentTranscript);
                };

                recognition.onerror = (event) => {
                    console.error("Speech recognition error:", event.error);
                    if (event.error === 'not-allowed') {
                        alert("Microphone permission denied. Please allow microphone access in your browser settings.");
                    }
                    setIsListening(false);
                };

                recognition.onend = () => {
                    setIsListening(false);
                };

                recognitionRef.current = recognition;
                recognition.start();
                setIsListening(true);
            } catch (err) {
                console.error("Failed to start speech recognition", err);
                setIsListening(false);
            }
        }
    };

    return (
        <div style={{ width: '100%', marginBottom: '16px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
                <textarea
                    className="input-control"
                    style={{ width: '100%', minHeight: height, paddingRight: '60px', paddingBottom: '60px', resize: 'vertical' }}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                <div style={{ position: 'absolute', bottom: '16px', right: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {isListening && <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: '500', animation: 'pulse 1.5s infinite' }}>Listening...</span>}
                    <button
                        onClick={(e) => { e.preventDefault(); toggleListening(); }}
                        style={{
                            width: '40px', height: '40px', borderRadius: '50%', border: 'none',
                            background: isListening ? '#fee2e2' : '#f1f5f9',
                            color: isListening ? '#ef4444' : '#64748b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'all 0.2s',
                            boxShadow: isListening ? '0 0 0 4px rgba(239, 68, 68, 0.2)' : 'none'
                        }}
                        title={isListening ? "Stop listening" : "Start speaking"}
                    >
                        {isListening ? <MicOffIcon /> : <MicIcon />}
                    </button>
                </div>
            </div>
            {onSubmit && (
                <button className="btn btn-primary" onClick={onSubmit} disabled={!value} style={{ width: '100%', marginTop: '16px' }}>
                    {IconComponent && <IconComponent />} {submitLabel}
                </button>
            )}
        </div>
    );
};

export default function App() {
    const [activeTab, setActiveTab] = useState('registration');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Layout components
    const Header = () => (
        <header className="header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'transparent', border: 'none', color: '#64748b' }} aria-label="Toggle Sidebar">
                    <MenuIcon />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }} />
                    <span style={{ fontWeight: '600', color: '#0f172a', letterSpacing: '-0.02em', fontSize: '18px' }}>
                        ONDC <span style={{ color: '#2563eb' }}>Vyapar</span> Platform
                    </span>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="badge badge-neutral">Voice Enabled 🎙️</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748b' }}>M</div>
            </div>
        </header>
    );

    const Sidebar = () => (
        <div className={`sidebar ${sidebarOpen ? '' : 'closed'}`} style={{ width: sidebarOpen ? '260px' : '0px', overflow: 'hidden' }}>
            <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: '4px' }}>Welcome</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>MSME Portal</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', padding: '12px 0' }}>
                <div
                    className={`nav-item ${activeTab === 'registration' ? 'active' : ''}`}
                    onClick={() => setActiveTab('registration')}
                >
                    <MicIcon /> Registration (Voice)
                </div>
                <div
                    className={`nav-item ${activeTab === 'categorization' ? 'active' : ''}`}
                    onClick={() => setActiveTab('categorization')}
                >
                    <TagIcon /> AI Categorisation
                </div>
                <div
                    className={`nav-item ${activeTab === 'verification' ? 'active' : ''}`}
                    onClick={() => setActiveTab('verification')}
                >
                    <FileIcon /> Quick Verification
                </div>
                <div
                    className={`nav-item ${activeTab === 'matching' ? 'active' : ''}`}
                    onClick={() => setActiveTab('matching')}
                >
                    <NetworkIcon /> Smart Matching SNP
                </div>
            </div>
        </div>
    );

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Header />
                <div className="content-scroll">
                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        {activeTab === 'registration' && <RegistrationView />}
                        {activeTab === 'categorization' && <CategorizationView />}
                        {activeTab === 'verification' && <VerificationView />}
                        {activeTab === 'matching' && <MatchingView />}
                    </div>
                </div>
            </div>

            <style>{`
        .closed {
          transform: translateX(-100%);
          width: 0 !important;
          padding: 0 !important;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
        </div>
    );
}

// ----------------------------------------------------------------------------
// VIEW 1: Voice-based Registration
// ----------------------------------------------------------------------------
function RegistrationView() {
    const [text, setText] = useState('');
    const [parsedData, setParsedData] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);

    const handleProcess = () => {
        setAnalyzing(true);
        setParsedData(null);

        // Simple mock logic based on keywords
        setTimeout(() => {
            const lowerText = text.toLowerCase();
            setParsedData({
                location: lowerText.includes('kanpur') ? 'Kanpur' : (lowerText.includes('delhi') ? 'Delhi' : 'Unknown'),
                material: lowerText.includes('leather') ? 'Leather' : (lowerText.includes('cotton') ? 'Cotton' : 'Varies'),
                product: lowerText.includes('shoes') || lowerText.includes('joote') ? 'Shoes' : (lowerText.includes('shirt') ? 'Shirts' : 'Apparel/Footwear'),
                business_type: lowerText.includes('banate') || lowerText.includes('make') ? 'Manufacturer' : 'Retailer'
            });
            setAnalyzing(false);
        }, 1500);
    };

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>1️⃣ Voice-based Auto Registration</h2>
                <p style={{ color: 'var(--text-muted)' }}>Tap the microphone and speak naturally in Hindi or English (e.g., "Hum Kanpur se leather shoes banate hain"). The AI will extract your profile details.</p>
            </div>

            <div className="grid-2">
                <div className="card">
                    <VoiceInputBox
                        value={text}
                        onChange={setText}
                        placeholder='Tap the microphone icon and say: "Hum Kanpur se leather shoes banate hain..."'
                        onSubmit={handleProcess}
                        submitLabel={analyzing ? "Extracting Details..." : "Process Registration"}
                        icon={SparklesIcon}
                        height="200px"
                    />
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <StoreIcon /> Business Profile Preview
                    </h3>

                    <div className="input-group">
                        <label className="input-label">Identified Product / Service</label>
                        <input type="text" className="input-control" readOnly value={parsedData?.product || ''} placeholder="Waiting for processing..." />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Business Type</label>
                        <input type="text" className="input-control" readOnly value={parsedData?.business_type || ''} placeholder="Waiting for processing..." />
                    </div>
                    <div className="grid-2" style={{ gap: '16px' }}>
                        <div className="input-group">
                            <label className="input-label">Location</label>
                            <input type="text" className="input-control" readOnly value={parsedData?.location || ''} placeholder="Waiting for processing..." />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Core Material</label>
                            <input type="text" className="input-control" readOnly value={parsedData?.material || ''} placeholder="Waiting for processing..." />
                        </div>
                    </div>
                    {parsedData && (
                        <div className="animate-fade-in" style={{ marginTop: '24px', padding: '12px', background: '#ecfdf5', borderRadius: '8px', color: '#065f46', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckCircleIcon /> Registration Data Extracted Successfully!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------------
// VIEW 2: AI Product Categorisation (Voice Enabled)
// ----------------------------------------------------------------------------
function CategorizationView() {
    const [desc, setDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleCategorize = () => {
        if (!desc) return;
        setLoading(true);
        setResult(null);

        // Mock response
        setTimeout(() => {
            setResult({
                path: ["Apparel", "Women", "Ethnic Wear", "Kurti"],
                material: desc.toLowerCase().includes('cotton') ? "Cotton" : (desc.toLowerCase().includes('silk') ? "Silk" : "Mixed"),
                category: desc.toLowerCase().includes('kurti') ? "Kurti" : "Apparel",
                tags: ["Women", "Ethnic", "Fast-Moving"]
            });
            setLoading(false);
        }, 1500);
    }

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>2️⃣ AI Product Categorisation</h2>
                <p style={{ color: 'var(--text-muted)' }}>Speak out exactly what you sell without worrying about formatting. We'll map it to the correct ONDC hierarchy.</p>
            </div>

            <div className="card" style={{ marginBottom: '24px' }}>
                <VoiceInputBox
                    value={desc}
                    onChange={setDesc}
                    placeholder='Tap the microphone and describe your product (e.g., "Handmade cotton kurti for women")'
                    onSubmit={handleCategorize}
                    submitLabel={loading ? "Mapping to ONDC Taxonomy..." : "Categorize via AI"}
                    icon={TagIcon}
                    height="150px"
                />
            </div>

            {result && (
                <div className="card animate-fade-in" style={{ borderLeft: '4px solid #4ade80' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#0f172a' }}>Predicted ONDC Taxonomy</h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                        {result.path.map((node, i) => (
                            <React.Fragment key={i}>
                                <span className="badge badge-info" style={{ fontSize: '14px', padding: '6px 14px' }}>{node}</span>
                                {i < result.path.length - 1 && <span style={{ color: '#94a3b8' }}>▶</span>}
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="grid-3" style={{ gap: '16px' }}>
                        <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Material</div>
                            <div style={{ fontWeight: '600' }}>{result.material}</div>
                        </div>
                        <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Category</div>
                            <div style={{ fontWeight: '600' }}>{result.category}</div>
                        </div>
                        <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Extracted Tags</div>
                            <div style={{ fontWeight: '600', color: '#64748b' }}>#{result.tags.join(" #")}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ----------------------------------------------------------------------------
// VIEW 3: Document Auto-Verification (No Voice)
// ----------------------------------------------------------------------------
function VerificationView() {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle');

    const handleUpload = () => {
        setStatus('verifying');
        setTimeout(() => {
            setStatus('success');
        }, 2000);
    }

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>3️⃣ Document Auto-Verification</h2>
                <p style={{ color: 'var(--text-muted)' }}>Upload GST, PAN, or Udyam copies. Our Verification AI extracts the data and validates via API without manual effort.</p>
            </div>

            <div className="grid-2">
                <div className="card">
                    <div
                        style={{
                            border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '40px 20px',
                            textAlign: 'center', background: '#f8fafc', cursor: 'pointer', transition: 'all 0.2s',
                            borderColor: file ? '#3b82f6' : '#cbd5e1'
                        }}
                        onClick={() => { setFile("GST_Certificate.pdf"); setStatus('idle'); }}
                    >
                        <UploadIcon />
                        <div style={{ marginTop: '12px', fontWeight: '500' }}>{file ? file : 'Click to Upload Document'}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Supports PDF, JPG, PNG</div>
                    </div>
                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '16px' }}
                        disabled={!file || status === 'verifying' || status === 'success'}
                        onClick={handleUpload}
                    >
                        {status === 'verifying' ? 'Verifying with NSIC...' : 'Run Auto-Verification'}
                    </button>
                </div>

                <div>
                    {status === 'verifying' && (
                        <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%' }}>
                            <div style={{ width: '40px', height: '40px', border: '3px solid #f1f5f9', borderTopColor: '#3b82f6', borderRadius: '50%' }} className="animate-spin" />
                            <div style={{ marginTop: '16px', fontWeight: '500', color: '#64748b' }}>Extracting text (OCR) & validating...</div>
                        </div>
                    )}
                    {status === 'success' && (
                        <div className="card animate-fade-in" style={{ borderLeft: '4px solid #10b981', minHeight: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '16px' }}>Extraction Results</h3>
                                <span className="badge badge-success">Valid Document</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Document Type</span>
                                    <span style={{ fontWeight: '500', fontSize: '14px' }}>GST Certificate</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>GSTIN extracted</span>
                                    <span style={{ fontWeight: '500', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>09AAACC1206D1Z1</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Registry Check</span>
                                    <span style={{ fontWeight: '500', color: '#10b981', fontSize: '14px' }}>Match Found ✓</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------------
// VIEW 4: Smart Matching Engine (Voice Enabled)
// ----------------------------------------------------------------------------
function MatchingView() {
    const [desc, setDesc] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [results, setResults] = useState(null);

    const handleMatch = () => {
        setAnalyzing(true);
        setResults(null);
        setTimeout(() => {
            setResults([
                {
                    name: "Udaan B2B ONDC Node",
                    region: desc.toLowerCase().includes('kanpur') || desc.toLowerCase().includes('delhi') ? "North India" : "Pan India",
                    capacity_suitability: "High Volume",
                    success_rate: "94%",
                    match_score: 98,
                    reason: "Perfect sync based on your spoken profile for logistics."
                },
                {
                    name: "Mystore Hub",
                    region: "Pan India",
                    capacity_suitability: "Medium Volume",
                    success_rate: "89%",
                    match_score: 85,
                    reason: "Good backup option but takes slightly higher margins."
                }
            ]);
            setAnalyzing(false);
        }, 2000);
    }

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>4️⃣ Smart Matching Engine</h2>
                <p style={{ color: 'var(--text-muted)' }}>Match the MSE's profile with the best Seller Network Participant (SNP). Describe your business needs using voice.</p>
            </div>

            <div className="card" style={{ marginBottom: '24px' }}>
                <VoiceInputBox
                    value={desc}
                    onChange={setDesc}
                    placeholder='E.g., "Hum kanpur me manufacturing karte hain aur mujhe PAN India delivery chahiye."'
                    onSubmit={handleMatch}
                    submitLabel={analyzing ? "Finding Best Partners..." : "Find Best SNP Partners"}
                    icon={NetworkIcon}
                    height="120px"
                />
            </div>

            {results && (
                <div className="grid-2 animate-fade-in">
                    {results.map((snp, i) => (
                        <div key={i} className="card" style={{ borderTop: i === 0 ? '4px solid #3b82f6' : '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
                            {i === 0 && <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#dbeafe', color: '#1d4ed8', fontSize: '10px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>Top Match</div>}

                            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>{snp.name}</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                <div style={{ fontSize: '13px', color: '#475569' }}><strong>Region:</strong> {snp.region}</div>
                                <div style={{ fontSize: '13px', color: '#475569' }}><strong>Volume Match:</strong> {snp.capacity_suitability}</div>
                                <div style={{ fontSize: '13px', color: '#475569' }}><strong>Past Success Rate:</strong> {snp.success_rate}</div>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Match Score</span>
                                    <span style={{ fontSize: '18px', fontWeight: '700', color: i === 0 ? '#2563eb' : '#0f172a' }}>{snp.match_score}%</span>
                                </div>
                                <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>{snp.reason}</p>
                            </div>

                            <button className="btn btn-outline" style={{ width: '100%', marginTop: '16px' }}>
                                Send Partnership Request
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
