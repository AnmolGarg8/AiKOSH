import React, { useState, useRef } from 'react';

export default function MicrophoneButton({ onTranscriptUpdate, onStatusChange }) {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        const handleStopMic = () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) { }
            }
        };
        window.addEventListener('stop-mic', handleStopMic);
        return () => window.removeEventListener('stop-mic', handleStopMic);
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
            rc.lang = 'hi-IN';

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
        <button
            className={`mic - button ${isListening ? 'active pulsing' : ''} `}
            onClick={toggleListening}
        >
            <span style={{ fontSize: '32px' }}>{isListening ? '🛑' : '🎙️'}</span>
        </button>
    );
}
