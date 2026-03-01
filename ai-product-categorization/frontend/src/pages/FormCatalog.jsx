import React, { useEffect, useState } from 'react';
import { useLocation } from "wouter";
import FormCard from '../components/FormCard';

export default function FormCatalog() {
    const [forms, setForms] = useState([]);
    const [, setLocation] = useLocation();

    useEffect(() => {
        // We will hardcode fallback for seamless dev experience if backend is down
        const defaultForms = [
            { id: "udyam-001", name: "Udyam Registration", authority: "Ministry of MSME", description: "Official MSME business registration form for small and medium enterprises.", img: "https://images.unsplash.com/photo-1604719312566-f4125f4aa4e1?auto=format&fit=crop&w=600&q=80" },
            { id: "gst-01", name: "GST Registration (REG-01)", authority: "CBIC", description: "Goods & Services Tax enrollment for businesses.", img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80" },
            { id: "shop-est-01", name: "Shop & Establishment Act", authority: "State Labour Dept", description: "Local business licensing and registration.", img: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=600&q=80" },
            { id: "fssai-01", name: "FSSAI Basic Registration", authority: "Food Safety Dept.", description: "Food business operator basic license.", img: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80" }
        ];

        fetch('http://localhost:8000/api/v1/forms')
            .then(res => res.json())
            .then(data => {
                // Merge images back into data since API doesn't have them
                const enrichedData = data.map((f, i) => ({ ...f, img: defaultForms[i]?.img || defaultForms[0].img }));
                setForms(enrichedData);
            })
            .catch(() => setForms(defaultForms));
    }, []);

    return (
        <div className="fade-in">
            <div className="banner-header">
                <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80" alt="Forms Background" className="banner-image" />
                <div className="banner-content">
                    <h2 className="banner-title">Government Form Catalog</h2>
                    <p className="banner-desc">Select an official mandate below to begin the Voice AI automated registration process. No typing required.</p>
                </div>
            </div>

            <div className="form-grid">
                {forms.map(form => (
                    <FormCard
                        key={form.id}
                        form={form}
                        onSelect={() => setLocation(`/registration/${form.id}`)}
                    />
                ))}
            </div>
        </div>
    );
}
