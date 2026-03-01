import React, { useState, useRef } from 'react';

export default function VerificationPage() {
    const [file, setFile] = useState(null);
    const [docType, setDocType] = useState('gst'); // gst, pan, udyam
    const fileInputRef = useRef(null);
    const [status, setStatus] = useState('idle'); // idle, verifying, success
    const [result, setResult] = useState(null);

    const handleUpload = () => {
        if (!file) {
            alert("Please select a file first.");
            return;
        }
        setStatus('verifying');
        setResult(null);

        // Mock Document Verification logic (OCR + Registry Check)
        setTimeout(() => {
            let extractedId = "";
            let ownerName = "";
            if (docType === 'gst') {
                extractedId = "09AAACC1206D1Z1";
                ownerName = "Kanpur Leather Works";
            } else if (docType === 'pan') {
                extractedId = "ABCDE1234F";
                ownerName = "Anmol Garg";
            } else {
                extractedId = "UDYAM-UP-00-1234567";
                ownerName = "Kanpur Leather Works MSME";
            }

            setResult({
                docType: docType === 'gst' ? 'GST Certificate' : (docType === 'pan' ? 'PAN Card' : 'Udyam Certificate'),
                extractedId: extractedId,
                ownerName: ownerName,
                valid: true,
                registryMatch: "NSIC Master Database"
            });
            setStatus('success');
        }, 2500);
    }

    const FileIcon = () => (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
    );

    return (
        <div className="fade-in">
            <style>
                {`
                @keyframes local-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .anim-spin { animation: local-spin 1s linear infinite; }
                `}
            </style>

            <div className="banner-header">
                <img src="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1200&q=80" alt="Security Data Protection" className="banner-image" />
                <div className="banner-content">
                    <h2 className="banner-title">Document Auto-Verification</h2>
                    <p className="banner-desc">Upload GST, PAN, or Udyam copies. Our Verification AI extracts the data and validates via official registry APIs securely.</p>
                </div>
            </div>

            <div className="grid-2">
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Upload Document</h3>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>
                            Document Type
                        </label>
                        <select
                            className="gov-input"
                            value={docType}
                            onChange={(e) => setDocType(e.target.value)}
                        >
                            <option value="gst">GST Certificate</option>
                            <option value="pan">PAN Card</option>
                            <option value="udyam">Udyam Registration</option>
                        </select>
                    </div>

                    <div
                        style={{
                            border: '2px dashed #CBD5E1',
                            borderRadius: '12px',
                            padding: '40px 20px',
                            textAlign: 'center',
                            background: file ? '#F0F9FF' : '#F8FAFC',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            borderColor: file ? '#3B82F6' : '#CBD5E1',
                            marginBottom: '24px',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept=".pdf, .jpg, .jpeg, .png"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setFile(e.target.files[0].name);
                                    setStatus('idle');
                                    setResult(null);
                                }
                            }}
                        />
                        <div style={{ color: file ? '#3B82F6' : '#94A3B8', marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                            <FileIcon />
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: file ? '#1D4ED8' : '#334155' }}>
                            {file ? file : 'Click to Browse or Drag & Drop'}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748B', marginTop: '8px' }}>
                            Supports PDF, JPG, PNG (Max 5MB)
                        </div>
                    </div>

                    <button
                        className="btn btn-primary btn-large"
                        style={{ width: '100%' }}
                        disabled={!file || status === 'verifying'}
                        onClick={handleUpload}
                    >
                        {status === 'verifying' ? (
                            <>
                                <span className="anim-spin" style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', marginRight: '8px' }}></span>
                                Extracting via OCR...
                            </>
                        ) : 'Run Auto-Verification 🔎'}
                    </button>
                    {file && status === 'idle' && (
                        <div style={{ textAlign: 'center', marginTop: '12px' }}>
                            <button className="btn" style={{ background: 'transparent', color: '#EF4444', fontSize: '13px', border: 'none', padding: '0', cursor: 'pointer' }} onClick={() => setFile(null)}>Remove File</button>
                        </div>
                    )}
                </div>

                <div>
                    {status === 'verifying' && (
                        <div className="card fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px' }}>
                            <div className="anim-spin" style={{ width: '48px', height: '48px', border: '4px solid #F1F5F9', borderTopColor: '#3B82F6', borderRadius: '50%', marginBottom: '24px' }} />
                            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Processing Document</h3>
                            <p style={{ color: '#64748B', textAlign: 'center', maxWidth: '280px', lineHeight: '1.6' }}>Running Optical Character Recognition (OCR) to extract identifiers line-by-line...</p>
                        </div>
                    )}

                    {status === 'success' && result && (
                        <div className="card fade-in" style={{ borderTop: '4px solid var(--success)', height: '100%', minHeight: '400px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                                <h3 style={{ fontSize: '20px', color: 'var(--primary)', margin: 0 }}>Verification Report</h3>
                                <span className="badge badge-success" style={{ fontSize: '14px', padding: '6px 16px' }}>✓ Verified</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px', letterSpacing: '0.5px' }}>Document Type Identified</div>
                                    <div style={{ fontSize: '16px', fontWeight: '500' }}>{result.docType}</div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.5px' }}>Extracted Identifier</div>
                                    <div style={{ fontSize: '20px', fontWeight: '700', fontFamily: 'monospace', letterSpacing: '1px', color: 'var(--primary)', background: '#F8FAFC', padding: '12px 16px', borderRadius: '6px', border: '1px solid #E2E8F0', display: 'inline-block' }}>
                                        {result.extractedId}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px', letterSpacing: '0.5px' }}>Business / Owner Name</div>
                                    <div style={{ fontSize: '16px', fontWeight: '500' }}>{result.ownerName}</div>
                                </div>

                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', marginTop: 'auto' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', background: '#DCFCE7', padding: '20px', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                                        <span style={{ fontSize: '24px', lineHeight: 1 }}>🛡️</span>
                                        <div>
                                            <div style={{ color: '#166534', fontWeight: '600', marginBottom: '6px', fontSize: '15px' }}>Registry Match Successful</div>
                                            <div style={{ color: '#166534', fontSize: '14px', lineHeight: '1.5' }}>The extracted details have been successfully cross-verified against the <strong>{result.registryMatch}</strong>.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'idle' && (
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px', background: '#F8FAFC', border: '1px dashed #CBD5E1', boxShadow: 'none' }}>
                            <div style={{ fontSize: '48px', opacity: 0.5, marginBottom: '20px' }}>🔍</div>
                            <p style={{ color: '#94A3B8', textAlign: 'center', maxWidth: '280px', lineHeight: '1.6' }}>Upload a document on the left to see the automated extraction and verification report.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
