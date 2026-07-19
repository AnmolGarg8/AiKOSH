import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { API_URL, getAuthHeaders } from '../services/api';

export default function NegotiationDashboard() {
    const { t } = useTranslation();
    const [cases, setCases] = useState([]);
    const [loadingCases, setLoadingCases] = useState(false);
    
    // View state: 'dashboard' | 'intake' | 'upload' | 'prediction' | 'draft'
    const [currentView, setCurrentView] = useState('dashboard');
    const [activeCase, setActiveCase] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');

    // Intake Form State
    const [partyA, setPartyA] = useState('');
    const [partyB, setPartyB] = useState('');
    const [category, setCategory] = useState('payment_delay');
    const [amount, setAmount] = useState('');
    const [daysPending, setDaysPending] = useState(15);
    const [description, setDescription] = useState('');
    const [submittingIntake, setSubmittingIntake] = useState(false);
    const [intakeError, setIntakeError] = useState('');

    // Upload State
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [extractedEntities, setExtractedEntities] = useState(null);
    const [confirmedEntities, setConfirmedEntities] = useState({
        invoice_number: '',
        amount: '',
        date: ''
    });

    // Prediction State
    const [predictionData, setPredictionData] = useState(null);
    const [loadingPrediction, setLoadingPrediction] = useState(false);

    // Draft State
    const [draftText, setDraftText] = useState('');
    const [loadingDraft, setLoadingDraft] = useState(false);
    const [finalizing, setFinalizing] = useState(false);

    // Fetch cases on mount or status filter change
    const fetchCases = async () => {
        setLoadingCases(true);
        try {
            const url = filterStatus ? `${API_URL}/disputes?status=${filterStatus}` : `${API_URL}/disputes`;
            const res = await fetch(url, { headers: getAuthHeaders() });
            if (!res.ok) throw new Error("Failed to load cases");
            const data = await res.json();
            setCases(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingCases(false);
        }
    };

    useEffect(() => {
        if (currentView === 'dashboard') {
            fetchCases();
        }
    }, [currentView, filterStatus]);

    // Handle Intake Submit
    const handleIntakeSubmit = async (e) => {
        e.preventDefault();
        setIntakeError('');
        
        if (!partyA || !partyB || !amount || !description) {
            setIntakeError('Please fill in all fields.');
            return;
        }

        setSubmittingIntake(true);
        try {
            const res = await fetch(`${API_URL}/disputes`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    party_a_name: partyA,
                    party_b_name: partyB,
                    dispute_category: category,
                    dispute_amount: Number(amount),
                    days_pending: Number(daysPending),
                    description: description
                })
            });

            if (!res.ok) throw new Error("Failed to create dispute case");
            const data = await res.json();
            
            setActiveCase(data);
            setCurrentView('upload');
            
            // Reset intake fields
            setPartyA('');
            setPartyB('');
            setAmount('');
            setDescription('');
        } catch (err) {
            setIntakeError(err.message || 'Error occurred during case intake.');
        } finally {
            setSubmittingIntake(false);
        }
    };

    // Handle Document Upload & Analysis
    const handleFileUpload = async (e) => {
        e.preventDefault();
        setUploadError('');
        if (!selectedFile) {
            setUploadError('Please select a file.');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const token = localStorage.getItem('aikosh_token');
            const res = await fetch(`${API_URL}/disputes/${activeCase.id}/documents`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) throw new Error("Failed to upload and analyze document");
            const docData = await res.json();
            
            setExtractedEntities(docData.extracted_entities);
            setConfirmedEntities({
                invoice_number: docData.extracted_entities.invoice_number || 'INV-2026-904',
                amount: docData.extracted_entities.amounts?.[0] || activeCase.dispute_amount,
                date: docData.extracted_entities.dates?.[0] || '15-03-2026'
            });
        } catch (err) {
            setUploadError(err.message || 'Error parsing document.');
        } finally {
            setUploading(false);
        }
    };

    // Confirm Entities & Move to Prediction
    const handleConfirmEntities = async () => {
        setLoadingPrediction(true);
        setCurrentView('prediction');
        try {
            const res = await fetch(`${API_URL}/disputes/${activeCase.id}/prediction`, {
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error("Failed to run prediction model");
            const data = await res.json();
            setPredictionData(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingPrediction(false);
        }
    };

    // Generate Draft
    const handleGenerateDraft = async () => {
        setLoadingDraft(true);
        setCurrentView('draft');
        try {
            const res = await fetch(`${API_URL}/disputes/${activeCase.id}/draft`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error("Failed to generate draft");
            const data = await res.json();
            setDraftText(data.draft_text);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingDraft(false);
        }
    };

    // Finalize Draft Resolution
    const handleFinalizeResolution = async () => {
        setFinalizing(true);
        try {
            const res = await fetch(`${API_URL}/disputes/${activeCase.id}/finalize`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ draft_text: draftText })
            });
            if (!res.ok) throw new Error("Failed to finalize resolution");
            setCurrentView('dashboard');
            setActiveCase(null);
            setExtractedEntities(null);
            setPredictionData(null);
        } catch (err) {
            alert(err.message || "Failed to finalize case");
        } finally {
            setFinalizing(false);
        }
    };

    return (
        <div className="fade-in">
            {/* View 1: Dispute Dashboard Table */}
            {currentView === 'dashboard' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--primary)' }}>
                                MSME Legal Dispute Resolution Center
                            </h2>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                Virtual AI Assistant for contract disputes, payment delays, and compromise drafting.
                            </p>
                        </div>
                        <button 
                            className="btn btn-primary"
                            onClick={() => setCurrentView('intake')}
                        >
                            ⚖️ Start New Dispute Case
                        </button>
                    </div>

                    {/* Filter Status */}
                    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600' }}>Filter Status:</span>
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '13px' }}
                        >
                            <option value="">All Cases</option>
                            <option value="intake">Intake</option>
                            <option value="under_review">Under Review</option>
                            <option value="settled">Settled</option>
                            <option value="escalated">Escalated</option>
                        </select>
                    </div>

                    {/* Case Table */}
                    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                        {loadingCases ? (
                            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                                Loading legal records...
                            </div>
                        ) : cases.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                                <span style={{ fontSize: '32px' }}>📁</span>
                                <p style={{ marginTop: '12px', fontSize: '14px' }}>No disputes found. Start a new intake to populate results.</p>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                    <tr>
                                        <th style={{ padding: '16px' }}>Case ID</th>
                                        <th style={{ padding: '16px' }}>Parties</th>
                                        <th style={{ padding: '16px' }}>Category</th>
                                        <th style={{ padding: '16px' }}>Amount (₹)</th>
                                        <th style={{ padding: '16px' }}>Days Pending</th>
                                        <th style={{ padding: '16px' }}>Status</th>
                                        <th style={{ padding: '16px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody style={{ fontSize: '13px' }}>
                                    {cases.map(c => (
                                        <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '16px', fontWeight: '600' }}>#{c.id}</td>
                                            <td style={{ padding: '16px' }}>
                                                <strong>{c.party_a_name}</strong> vs <br />
                                                <span style={{ color: 'var(--text-muted)' }}>{c.party_b_name}</span>
                                            </td>
                                            <td style={{ padding: '16px', textTransform: 'capitalize' }}>
                                                {c.dispute_category.replace('_', ' ')}
                                            </td>
                                            <td style={{ padding: '16px', fontWeight: '600', color: 'var(--primary)' }}>
                                                ₹{c.dispute_amount.toLocaleString('en-IN')}
                                            </td>
                                            <td style={{ padding: '16px' }}>{c.days_pending} days</td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{
                                                    background: c.status === 'settled' ? '#D1FAE5' : c.status === 'under_review' ? '#FEF3C7' : c.status === 'escalated' ? '#FEE2E2' : '#F1F5F9',
                                                    color: c.status === 'settled' ? '#065F46' : c.status === 'under_review' ? '#92400E' : c.status === 'escalated' ? '#991B1B' : '#475569',
                                                    fontSize: '11px',
                                                    fontWeight: '700',
                                                    padding: '3px 8px',
                                                    borderRadius: '12px',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                {c.status !== 'settled' && (
                                                    <button 
                                                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}
                                                        onClick={() => {
                                                            setActiveCase(c);
                                                            setCurrentView(c.status === 'intake' ? 'upload' : 'prediction');
                                                        }}
                                                    >
                                                        Evaluate Case →
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* View 2: Intake Form */}
            {currentView === 'intake' && (
                <div style={{ maxWidth: '650px', margin: '0 auto', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>Dispute Intake Form</h3>
                        <button className="btn btn-outline" onClick={() => setCurrentView('dashboard')}>Cancel</button>
                    </div>

                    {intakeError && <div style={{ color: '#EF4444', fontSize: '14px', marginBottom: '16px', fontWeight: '500' }}>⚠️ {intakeError}</div>}

                    <form onSubmit={handleIntakeSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Claimant Enterprise (Party A)</label>
                                <input type="text" required value={partyA} onChange={(e) => setPartyA(e.target.value)} placeholder="e.g. Ramesh Textiles" style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Respondent Enterprise (Party B)</label>
                                <input type="text" required value={partyB} onChange={(e) => setPartyB(e.target.value)} placeholder="e.g. India Retail Corp" style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px' }} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Dispute Category</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px' }}>
                                    <option value="payment_delay">Payment Delay</option>
                                    <option value="quality_dispute">Quality Dispute</option>
                                    <option value="contract_breach">Contract Breach</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Dispute Amount (₹)</label>
                                <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 150000" style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px' }} />
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Days Outstanding / Pending</label>
                            <input type="number" required value={daysPending} onChange={(e) => setDaysPending(e.target.value)} placeholder="15" style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px' }} />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Description (Supports Hindi or English)</label>
                            <textarea rows="4" required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the details of the delayed payment or contract violation..." style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '14px' }} />
                        </div>

                        <button type="submit" disabled={submittingIntake} className="btn btn-primary btn-large" style={{ width: '100%' }}>
                            {submittingIntake ? 'Creating Record...' : 'Record Case & Proceed to Document Upload →'}
                        </button>
                    </form>
                </div>
            )}

            {/* View 3: Document Upload & Extract Confirmation */}
            {currentView === 'upload' && (
                <div style={{ maxWidth: '650px', margin: '0 auto', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '32px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)', marginBottom: '12px' }}>
                        Step 2: Document Verification & OCR
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                        Upload a contract, invoice, or purchase order (PDF or image). The system runs automatic entity extraction and OCR.
                    </p>

                    {!extractedEntities ? (
                        <form onSubmit={handleFileUpload}>
                            <div style={{ border: '2px dashed var(--border)', borderRadius: '8px', padding: '40px 20px', textAlign: 'center', marginBottom: '24px' }}>
                                <input 
                                    type="file" 
                                    accept=".pdf,.png,.jpg,.jpeg" 
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                    style={{ display: 'block', margin: '0 auto 16px auto' }}
                                />
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Supported: PDF, PNG, JPG, JPEG</span>
                            </div>

                            {uploadError && <div style={{ color: '#EF4444', fontSize: '13px', marginBottom: '16px' }}>{uploadError}</div>}

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setCurrentView('dashboard')}>Skip for now</button>
                                <button type="submit" disabled={uploading} className="btn btn-primary" style={{ flex: 2 }}>
                                    {uploading ? 'Analyzing with OCR/NLP...' : 'Analyze Document 🔍'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="fade-in">
                            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '16px', borderRadius: '6px', color: '#166534', fontWeight: '500', fontSize: '14px', marginBottom: '24px' }}>
                                ✓ Entities successfully extracted from invoice!
                            </div>

                            <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                Assisted Intake Entity Confirmation
                            </h4>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Invoice / Bill Reference Number</label>
                                    <input 
                                        type="text" 
                                        value={confirmedEntities.invoice_number} 
                                        onChange={(e) => setConfirmedEntities({...confirmedEntities, invoice_number: e.target.value})}
                                        style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Extracted Amount (₹)</label>
                                    <input 
                                        type="text" 
                                        value={confirmedEntities.amount} 
                                        onChange={(e) => setConfirmedEntities({...confirmedEntities, amount: e.target.value})}
                                        style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Date Stamped</label>
                                    <input 
                                        type="text" 
                                        value={confirmedEntities.date} 
                                        onChange={(e) => setConfirmedEntities({...confirmedEntities, date: e.target.value})}
                                        style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px' }}
                                    />
                                </div>
                            </div>

                            <button 
                                className="btn btn-primary btn-large"
                                style={{ width: '100%' }}
                                onClick={handleConfirmEntities}
                            >
                                Confirm Entities & Evaluate Outcome Prediction →
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* View 4: Heuristic/ML Prediction Outcome */}
            {currentView === 'prediction' && (
                <div style={{ maxWidth: '650px', margin: '0 auto', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '32px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)', marginBottom: '24px' }}>
                        Step 3: AI Outcome Prediction
                    </h3>

                    {loadingPrediction ? (
                        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                            Evaluating historical parameters...
                        </div>
                    ) : predictionData ? (
                        <div className="fade-in">
                            {/* Prediction Card */}
                            <div style={{ 
                                border: '1px solid var(--border)', 
                                borderRadius: '8px', 
                                padding: '24px', 
                                background: '#F8FAFC',
                                marginBottom: '24px',
                                borderLeft: '4px solid var(--secondary)'
                            }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Predicted Settlement Likelihood
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)', marginTop: '8px', textTransform: 'uppercase' }}>
                                    {predictionData.prediction.replace('_', ' ')}
                                </div>

                                {/* Confidence Bar */}
                                <div style={{ marginTop: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                                        <span>Model Confidence</span>
                                        <span>{predictionData.confidence}%</span>
                                    </div>
                                    <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', background: 'var(--secondary)', width: `${predictionData.confidence}%` }} />
                                    </div>
                                </div>
                            </div>

                            {/* Disclaimer */}
                            <div style={{ 
                                border: '1px solid #FCD34D', 
                                background: '#FFFBEB', 
                                padding: '16px', 
                                borderRadius: '6px', 
                                color: '#78350F', 
                                fontSize: '12px', 
                                lineHeight: '1.5',
                                marginBottom: '32px',
                                fontWeight: '500'
                            }}>
                                ⚠️ <strong>Advisory Disclaimer:</strong> {predictionData.disclaimer}
                            </div>

                            <button 
                                className="btn btn-primary btn-large" 
                                style={{ width: '100%' }}
                                onClick={handleGenerateDraft}
                            >
                                Generate Assisted Settlement Draft Agreement →
                            </button>
                        </div>
                    ) : (
                        <div style={{ color: '#EF4444' }}>Error running model prediction.</div>
                    )}
                </div>
            )}

            {/* View 5: Settlement Draft Editor */}
            {currentView === 'draft' && (
                <div style={{ maxWidth: '750px', margin: '0 auto', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '32px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)', marginBottom: '12px' }}>
                        Step 4: Resolve & Draft Settlement
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                        Verify and edit the AI-generated Memorandum of Settlement below.
                    </p>

                    {loadingDraft ? (
                        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                            Generating text template...
                        </div>
                    ) : (
                        <div className="fade-in">
                            <textarea 
                                value={draftText} 
                                onChange={(e) => setDraftText(e.target.value)}
                                rows="18"
                                style={{ 
                                    width: '100%', 
                                    padding: '16px', 
                                    borderRadius: '6px', 
                                    border: '1px solid var(--border)', 
                                    fontFamily: 'monospace',
                                    fontSize: '13px',
                                    lineHeight: '1.6',
                                    background: '#FAF9F6',
                                    marginBottom: '24px'
                                }}
                            />

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setCurrentView('dashboard')}>Postpone</button>
                                <button 
                                    className="btn btn-success" 
                                    style={{ flex: 2, background: 'var(--success)', color: 'white' }}
                                    disabled={finalizing}
                                    onClick={handleFinalizeResolution}
                                >
                                    {finalizing ? 'Resolving...' : 'Finalize & Record Settlement ✓'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
