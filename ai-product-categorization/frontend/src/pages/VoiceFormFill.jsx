import React, { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { fetchForms, submitVoiceData } from '../services/api';

import MicrophoneButton from '../components/MicrophoneButton';
import TranscriptDisplay from '../components/TranscriptDisplay';
import DynamicForm from '../components/DynamicForm';

export default function VoiceFormFill({ params }) {
    const { formId } = params;
    const [, setLocation] = useLocation();

    const [formDef, setFormDef] = useState(null);
    const [transcript, setTranscript] = useState('');
    const [status, setStatus] = useState('Idle');
    const [extractedData, setExtractedData] = useState({});
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [guidedActive, setGuidedActive] = useState(false);

    const getNextUnfilledField = () => {
        if (!formDef) return null;
        return formDef.fields.find(f => !extractedData[f] || !extractedData[f].value);
    };

    const startGuidedInterview = () => {
        setGuidedActive(true);
        const nextField = getNextUnfilledField();
        if (nextField) {
            const readable = nextField.replace(/_/g, ' ').toUpperCase();
            setStatus(`Guided Mode: Asking for ${readable}`);
            window.speechSynthesis.cancel();
            const msg = new SpeechSynthesisUtterance();
            msg.text = `Please tell me your ${readable}`;
            msg.lang = 'hi-IN';
            window.speechSynthesis.speak(msg);
        } else {
            alert("Form is already fully filled!");
        }
    };

    useEffect(() => {
        // Trigger next question whenever extractedData changes if we are in guided mode
        if (!guidedActive || !formDef) return;

        const nextField = getNextUnfilledField();
        if (nextField) {
            const readable = nextField.replace(/_/g, ' ').toUpperCase();
            setStatus(`Guided Mode: Asking for ${readable}`);
            window.speechSynthesis.cancel();
            const msg = new SpeechSynthesisUtterance();
            msg.text = `Got it. Now, what is your ${readable}?`;
            msg.lang = 'hi-IN';
            setTimeout(() => window.speechSynthesis.speak(msg), 500);
        } else {
            setStatus('Guided Mode: All fields completed!');
            const msg = new SpeechSynthesisUtterance();
            msg.text = `Thank you. The form is fully completed. You can now review and submit your application.`;
            msg.lang = 'hi-IN';
            setTimeout(() => window.speechSynthesis.speak(msg), 500);
            setGuidedActive(false);
        }
    }, [extractedData]);

    const handleTranscriptUpdate = (newText) => {
        setTranscript(newText);
        setIsConfirmed(false);
    };

    const handleVerifyVoice = () => {
        if (!transcript) return;
        window.dispatchEvent(new Event('stop-mic'));
        setIsVerifying(true);
        setStatus('Verifying Input...');

        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance();
        msg.text = `You said: ${transcript}. Is this information correct and ready to proceed?`;
        msg.lang = 'hi-IN';

        msg.onend = () => {
            setIsVerifying(false);
            setIsConfirmed(true);
            setStatus('Verified. Ready to Fill Form.');
        };

        window.speechSynthesis.speak(msg);
    };

    const handleClear = () => {
        setTranscript('');
        setIsConfirmed(false);
        setIsVerifying(false);
        window.speechSynthesis.cancel();
    };

    useEffect(() => {
        fetchForms().then(forms => {
            const found = forms.find(f => f.id === formId);
            setFormDef(found);
        });
    }, [formId]);

    const handleProcess = async () => {
        if (guidedActive) window.dispatchEvent(new Event('stop-mic'));
        setStatus('Processing NLP Engine...');
        try {
            const res = await submitVoiceData(formId, transcript);
            setExtractedData(prev => {
                const merged = { ...prev };
                for (let key in res.extracted_fields) {
                    merged[key] = res.extracted_fields[key];
                }
                return merged;
            });
            setStatus('Form Auto-filled Successfully');

            // Clear transcript for the next guided step
            if (guidedActive) {
                setTranscript('');
                setIsConfirmed(false);
            }
        } catch (err) {
            console.error(err);
            setStatus('Failed to extract data');
        }
    };

    useEffect(() => {
        let timeout;
        if (guidedActive && transcript.trim().length > 0) {
            timeout = setTimeout(() => {
                handleProcess();
            }, 2000);
        }
        return () => clearTimeout(timeout);
    }, [transcript, guidedActive]);

    const handleFormChange = (key, value) => {
        setExtractedData(prev => ({
            ...prev,
            [key]: { value, confidence: 100 } // Manual edit establishes 100% confidence
        }));
    };

    const handleReview = () => {
        // Save to local storage for review page
        localStorage.setItem(`review_${formId}`, JSON.stringify(extractedData));
        setLocation(`/review/${formId}`);
    };

    if (!formDef) return <div className="loading">Loading official document framework...</div>;

    return (
        <div className="voice-fill-layout fade-in">
            <div className="voice-panel">
                <div className="voice-header">
                    <h2>Voice Assistant</h2>
                    <div className="status-indicator">
                        Status: <span className="status-text">{status}</span>
                    </div>
                </div>

                <div className="mic-container">
                    <MicrophoneButton
                        onTranscriptUpdate={handleTranscriptUpdate}
                        onStatusChange={setStatus}
                    />
                    <p className="mic-instruction" style={{ color: guidedActive ? 'var(--primary)' : 'var(--text-muted)', fontWeight: guidedActive ? '600' : 'normal' }}>
                        {guidedActive ? `AI is listening to your answer...` : `Speak your full business details clearly.`}
                    </p>

                    {!guidedActive && (
                        <button
                            className="btn btn-primary"
                            style={{ marginTop: '12px', background: 'var(--success)', borderColor: 'var(--success)' }}
                            onClick={startGuidedInterview}
                        >
                            Start Step-by-Step AI Interview 🤖
                        </button>
                    )}
                </div>

                <TranscriptDisplay transcript={transcript} />

                <div className="action-buttons">
                    <button className="btn btn-outline" onClick={handleClear}>Clear</button>
                    {!guidedActive && (
                        <>
                            {!isConfirmed ? (
                                <button className="btn btn-secondary" onClick={handleVerifyVoice} disabled={!transcript || isVerifying}>
                                    {isVerifying ? 'Speaking...' : 'Verify Input 🗣️'}
                                </button>
                            ) : (
                                <button className="btn btn-primary" onClick={handleProcess} disabled={!transcript || status.includes('Processing')}>
                                    Process & Fill Form ✅
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className="form-panel">
                <DynamicForm
                    formDef={formDef}
                    extractedData={extractedData}
                    onChange={handleFormChange}
                />

                {Object.keys(extractedData).length > 0 && (
                    <div className="form-footer fade-in">
                        <button className="btn btn-success btn-large" onClick={handleReview}>
                            Review & Submit Formal Application →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
