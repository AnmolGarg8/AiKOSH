import React, { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { fetchForms, submitVoiceData, generateGuidedPrompt, API_URL } from '../services/api';

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
    const [language, setLanguage] = useState('hi-IN');

    // Advanced Voice Selector linking to Microsoft Azure TTS API Backend stream
    const speakNativeTTS = (text, langCode, onEndCallback) => {
        window.speechSynthesis.cancel();

        try {
            const encodedText = encodeURIComponent(text);
            const encodedLang = encodeURIComponent(langCode);
            // Connect directly to the FastAPI Streaming endpoint utilizing Azure Edge TTS
            const fullUrl = `${API_URL}/voice/speak?text=${encodedText}&language=${encodedLang}`;

            // To ensure compatibility across local host vs deployed environments we pull the base URL from api.js if possible,
            // but for simplicity, the application API_URL is mostly same host. Let's dynamically map it.
            // Better: use the dynamic prefix.

            const audio = new Audio(fullUrl);
            audio.playbackRate = 1.0;

            audio.onended = () => {
                if (onEndCallback) onEndCallback();
            };

            audio.onerror = () => {
                fallbackSyntheticTTS(text, langCode, onEndCallback); // fallback if backend routing fails
            };

            audio.play().catch(e => {
                fallbackSyntheticTTS(text, langCode, onEndCallback);
            });
        } catch (e) {
            fallbackSyntheticTTS(text, langCode, onEndCallback);
        }
    };

    // Fallback if network stream gets blocked by browser policies
    const fallbackSyntheticTTS = (text, langCode, onEndCallback) => {
        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = langCode;
        msg.rate = 0.95;
        msg.pitch = 1.05;

        const voices = window.speechSynthesis.getVoices();
        let bestVoice = voices.find(v => v.lang.includes(langCode) && v.name.includes('Google'));
        if (!bestVoice) bestVoice = voices.find(v => v.lang.includes(langCode));
        if (!bestVoice && langCode.includes('-')) {
            const baseLang = langCode.split('-')[0];
            bestVoice = voices.find(v => v.lang.startsWith(baseLang) && v.name.includes('Google'));
            if (!bestVoice) bestVoice = voices.find(v => v.lang.startsWith(baseLang));
        }

        if (bestVoice) msg.voice = bestVoice;
        if (onEndCallback) msg.onend = onEndCallback;
        window.speechSynthesis.speak(msg);
    };

    const getNextUnfilledField = () => {
        if (!formDef) return null;
        return formDef.fields.find(f => !extractedData[f] || !extractedData[f].value);
    };

    const startGuidedInterview = async () => {
        setGuidedActive(true);
        const nextField = getNextUnfilledField();
        if (nextField) {
            const readable = nextField.replace(/_/g, ' ').toUpperCase();
            setStatus(`Guided Mode: Asking for ${readable}`);
            window.speechSynthesis.cancel();

            const p = await generateGuidedPrompt(readable, language);
            speakNativeTTS(p.prompt, language, () => {
                window.dispatchEvent(new Event('start-mic'));
            });
        } else {
            alert("Form is already fully filled!");
        }
    };

    useEffect(() => {
        if (!guidedActive || !formDef) return;

        const nextField = getNextUnfilledField();

        const askNext = async () => {
            if (nextField) {
                const readable = nextField.replace(/_/g, ' ').toUpperCase();
                setStatus(`Guided Mode: Asking for ${readable}`);
                window.speechSynthesis.cancel();

                const p = await generateGuidedPrompt(readable, language);
                setTimeout(() => speakNativeTTS(p.prompt, language, () => {
                    window.dispatchEvent(new Event('start-mic'));
                }), 500);
            } else {
                setStatus('Guided Mode: All fields completed!');
                const p = await generateGuidedPrompt("COMPLETED", language);
                setTimeout(() => speakNativeTTS(p.prompt, language), 500);
                setGuidedActive(false);
            }
        };

        askNext();
    }, [extractedData]);

    const handleTranscriptUpdate = (newText) => {
        setTranscript(newText);
        setIsConfirmed(false);
    };

    const handleVerifyVoice = async () => {
        if (!transcript) return;
        window.dispatchEvent(new Event('stop-mic'));
        setIsVerifying(true);
        setStatus('Verifying Input...');
        window.speechSynthesis.cancel();

        const p = await generateGuidedPrompt(`VERIFY: ${transcript}`, language);

        speakNativeTTS(p.prompt, language, () => {
            setIsVerifying(false);
            setIsConfirmed(true);
            setStatus('Verified. Ready to Fill Form.');
        });
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
                        language={language}
                        setLanguage={setLanguage}
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
