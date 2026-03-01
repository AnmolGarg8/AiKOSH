import React, { useState, useRef, useEffect } from 'react';

export default function MicrophoneButton({ onTranscriptUpdate, onStatusChange }) {
    const [isListening, setIsListening] = useState(false);
    const [language, setLanguage] = useState('hi-IN');
    const recognitionRef = useRef(null);
    const isListeningRef = useRef(false);

    useEffect(() => {
        isListeningRef.current = isListening;
    }, [isListening]);

    const LANGUAGES = [
        { code: 'hi-IN', label: 'Hindi (हिंदी)' },
        { code: 'en-IN', label: 'English (India)' },
        { code: 'ta-IN', label: 'Tamil (தமிழ்)' },
        { code: 'te-IN', label: 'Telugu (తెలుగు)' },
        { code: 'mr-IN', label: 'Marathi (मराठी)' },
        { code: 'bn-IN', label: 'Bengali (বাংলা)' },
        { code: 'gu-IN', label: 'Gujarati (ગુજરાતી)' },
        { code: 'kn-IN', label: 'Kannada (ಕನ್ನಡ)' },
        { code: 'ml-IN', label: 'Malayalam (മലയാളം)' },
        { code: 'pa-IN', label: 'Punjabi (ਪੰਜਾਬੀ)' }
    ];

    useEffect(() => {
        const handleStopMic = () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) { }
            }
            setIsListening(false);
        };
        const handleStartMic = () => {
            if (!isListeningRef.current) {
                const btn = document.getElementById('main-mic-btn');
                if (btn) btn.click();
            }
        };
        window.addEventListener('stop-mic', handleStopMic);
        window.addEventListener('start-mic', handleStartMic);
        return () => {
            window.removeEventListener('stop-mic', handleStopMic);
            window.removeEventListener('start-mic', handleStartMic);
        };
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            onStatusChange('Idle');
        } else {
            window.speechSynthesis.cancel(); // Cancel any existing speech if starting a new recording
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                alert("Browser not supported. Use Chrome or Edge.");
                return;
            }

            const rc = new SpeechRecognition();
            rc.continuous = true;
            rc.interimResults = true;
            rc.lang = language;

            rc.onstart = () => {
                setIsListening(true);
                onStatusChange('Listening...');
                onTranscriptUpdate(''); // Clear previous inputs exactly when mic starts
            };

            rc.onresult = (event) => {
                let trans = '';
                // Iterate from 0 to capture the whole mic session, enabling real-time "sath sath" replacement
                for (let i = 0; i < event.results.length; i++) {
                    trans += event.results[i][0].transcript;
                }
                onTranscriptUpdate(trans);
            };

            rc.onerror = (e) => {
                console.error("Mic error:", e.error);
                setIsListening(false);
                onStatusChange('Error: ' + e.error);
            };

            rc.onend = () => {
                setIsListening(false);
                onStatusChange('Idle');
            };

            recognitionRef.current = rc;
            rc.start();
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isListening}
                style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    color: '#475569',
                    fontFamily: 'inherit',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                    outline: 'none'
                }}
            >
                {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.label}</option>
                ))}
            </select>
            <button
                id="main-mic-btn"
                className={`mic-button ${isListening ? 'active pulsing' : ''}`}
                onClick={toggleListening}
                title={`Speak in ${LANGUAGES.find(l => l.code === language)?.label}`}
            >
                <span style={{ fontSize: '32px' }}>{isListening ? '🛑' : '🎙️'}</span>
            </button>
        </div>
    );
}
