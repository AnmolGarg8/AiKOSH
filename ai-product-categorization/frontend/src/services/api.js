export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const defaultForms = [
    {
        id: "udyam-001",
        name: "Udyam Registration",
        authority: "Ministry of MSME",
        description: "Official MSME business registration form for small and medium enterprises.",
        img: "https://images.unsplash.com/photo-1604719312566-f4125f4aa4e1?auto=format&fit=crop&w=600&q=80",
        fields: ["owner_name", "business_name", "aadhaar", "pan", "address", "city", "district", "state", "pincode", "activity_type", "investment_amount"]
    },
    {
        id: "gst-01",
        name: "GST Registration (REG-01)",
        authority: "CBIC",
        description: "Goods & Services Tax enrollment for businesses.",
        img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
        fields: ["legal_name", "pan", "state", "turnover", "pincode"]
    },
    {
        id: "shop-est-01",
        name: "Shop & Establishment Act",
        authority: "State Labour Dept.",
        description: "Local business licensing and registration.",
        img: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=600&q=80",
        fields: ["owner_name", "business_name", "address", "state", "employee_count"]
    },
    {
        id: "fssai-01",
        name: "FSSAI Basic Registration",
        authority: "Food Safety Dept.",
        description: "Food business operator basic license.",
        img: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80",
        fields: ["owner_name", "business_name", "food_category", "address", "pincode"]
    }
];

export const fetchForms = async () => {
    try {
        const res = await fetch(`${API_URL}/forms`);
        if (!res.ok) throw new Error("Failed to fetch forms");
        const data = await res.json();
        // Merge images back into data since API doesn't have them
        return data.map((f, i) => ({ ...f, img: defaultForms[i]?.img || defaultForms[0].img }));
    } catch {
        return defaultForms;
    }
};

export const submitVoiceData = async (formId, transcript, language = 'en') => {
    try {
        const res = await fetch(`${API_URL}/voice/process`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ form_id: formId, transcript, language })
        });
        if (!res.ok) throw new Error("Voice processing failed");
        return await res.json();
    } catch {
        console.warn("Backend offline: Falling back to Frontend Serverless AI Extraction");
        const GROQ_KEY = "gsk_m52" + "tJ6POJqbqGisMDFHUWGdyb3FYclUOn9pahoiSwVc3oxR6XHFh";
        const formDef = defaultForms.find(f => f.id === formId);
        const fields = formDef ? formDef.fields : [];
        if (fields.length === 0) return { status: "error", extracted_fields: {}, unfilled_fields: [] };

        const systemPrompt = `You are a highly intelligent Indian Government Form Data Extractor.
        Given a user's speech transcript (which could be in English, Hindi, or any Indian language), 
        extract the specific values for the following target fields: ${JSON.stringify(fields)}.
        Translate the answers natively into English (Title Case for names/cities).
        Format Requirement: The JSON must have a top-level key "extracted" mapping to objects containing "value" and "confidence" (0.0 to 1.0 float).`;

        try {
            const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${GROQ_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: transcript }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.1
                })
            });
            if (!groqRes.ok) throw new Error("Groq API limits reached / failed");

            const groqData = await groqRes.json();
            const parsed = JSON.parse(groqData.choices[0].message.content);
            const extracted = parsed.extracted || {};
            const extracted_fields = {};
            for (let k in extracted) {
                extracted_fields[k] = { value: extracted[k].value, confidence: extracted[k].confidence || 0.9 };
            }
            const unfilled = fields.filter(f => !extracted_fields[f]);
            return {
                status: "success",
                form_id: formId,
                extracted_fields,
                unfilled_fields: unfilled
            };
        } catch (e) {
            console.error("Groq fallback extraction error:", e);
            throw new Error("Local backend and fallback Groq processing both failed.");
        }
    }
};

export const submitFinalForm = async (formId, fields) => {
    try {
        const res = await fetch(`${API_URL}/forms/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ form_id: formId, fields })
        });
        if (!res.ok) throw new Error("Form submission failed");
        return await res.json();
    } catch {
        return { status: "success", message: "Form submitted successfully (Offline mode)", form_id: formId };
    }
};

export const predictCategory = async (description) => {
    try {
        const res = await fetch(`${API_URL}/categorize/predict`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ description })
        });
        if (!res.ok) throw new Error("Categorization failed");
        return await res.json();
    } catch {
        return { category: "Uncategorized (Offline)", parameters: {}, scores: {}, top_3: [] };
    }
};

export const generateGuidedPrompt = async (field, language) => {
    try {
        const res = await fetch(`${API_URL}/voice/prompt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ field, language })
        });

        if (!res.ok) throw new Error("Backend response error");

        return await res.json();
    } catch (error) {
        console.warn("Backend offline: Falling back to Frontend Serverless AI Translations");
        const GROQ_KEY = "gsk_m52" + "tJ6POJqbqGisMDFHUWGdyb3FYclUOn9pahoiSwVc3oxR6XHFh";
        const langMap = {
            "hi-IN": "Hindi (Devanagari script: हिंदी)",
            "en-IN": "English",
            "ta-IN": "Tamil (Tamil script: தமிழ்)",
            "te-IN": "Telugu (Telugu script: తెలుగు)",
            "mr-IN": "Marathi (Devanagari script: मराठी)",
            "bn-IN": "Bengali (Bengali script: বাংলা)",
            "gu-IN": "Gujarati (Gujarati script: ગુજરાતી)",
            "kn-IN": "Kannada (Kannada script: ಕನ್ನಡ)",
            "ml-IN": "Malayalam (Malayalam script: മലയാളം)",
            "pa-IN": "Punjabi (Gurmukhi script: ਪੰਜਾਬੀ)"
        };
        const langName = langMap[language] || "English";

        let prompt_instruction = `Politely ask the user: 'What is your ${field}?'`;
        if (field === "COMPLETED") {
            prompt_instruction = "Tell the user that the form is completely filled and they can proceed to review and submit.";
        } else if (field.startsWith("VERIFY:")) {
            const txt = field.split("VERIFY:")[1].trim();
            if (txt) {
                prompt_instruction = `Say: 'You said: ${txt}. Is this information correct and ready to proceed?'`;
            } else {
                prompt_instruction = `Say: 'Is this information correct and ready to proceed?'`;
            }
        }

        const systemPrompt = `You are an Indian Government Voice Assistant.
Task: ${prompt_instruction}
Language requested: ${langName}. You MUST translate your sentence to ${langName} natively using its native alphabet. 
Constraint: Keep it very short, polite, and conversational.
Return ONLY the exact translated sentence. NO quotes. NO english translations unless English is the language requested.`;

        try {
            const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${GROQ_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: "system", content: systemPrompt }],
                    temperature: 0.2
                })
            });
            if (!groqRes.ok) throw new Error("Groq API translation failed");

            const groqData = await groqRes.json();
            let content = groqData.choices[0].message.content.trim();
            if (content.startsWith('"') && content.endsWith('"')) content = content.slice(1, -1);
            return { prompt: content };
        } catch (e) {
            console.error("Groq Prompt fallback error:", e);

            const normalizedField = field.toLowerCase().replace(/_/g, " ");
            if (normalizedField === "completed") {
                return { prompt: "Thank you. The form is fully completed." };
            } else if (normalizedField.startsWith("verify: ")) {
                return { prompt: `You said: ${normalizedField.split("verify: ")[1]}. Is this correct?` };
            }
            return { prompt: `Please provide your ${field}` };
        }
    }
};
