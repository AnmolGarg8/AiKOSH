const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const fetchForms = async () => {
    const res = await fetch(`${API_URL}/forms`);
    if (!res.ok) throw new Error("Failed to fetch forms");
    return res.json();
};

export const submitVoiceData = async (formId, transcript, language = 'en') => {
    const res = await fetch(`${API_URL}/voice/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form_id: formId, transcript, language })
    });
    if (!res.ok) throw new Error("Voice processing failed");
    return res.json();
};

export const submitFinalForm = async (formId, fields) => {
    const res = await fetch(`${API_URL}/forms/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form_id: formId, fields })
    });
    if (!res.ok) throw new Error("Form submission failed");
    return res.json();
};

export const predictCategory = async (description) => {
    const res = await fetch(`${API_URL}/categorize/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description })
    });
    if (!res.ok) throw new Error("Categorization failed");
    return res.json();
};

export const generateGuidedPrompt = async (field, language) => {
    try {
        const res = await fetch(`${API_URL}/voice/prompt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ field, language })
        });
        if (!res.ok) return { prompt: `Please provide your ${field}` };
        return await res.json();
    } catch {
        return { prompt: `Please provide your ${field}` };
    }
};
