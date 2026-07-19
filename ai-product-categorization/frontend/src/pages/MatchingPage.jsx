import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { API_URL, getAuthHeaders } from '../services/api';

const CATEGORY_TAGS = {
    "textiles": ["handloom", "organic dye", "cotton weaving", "embroidery", "bulk stitching", "wool spinning", "yarn dyeing"],
    "electronics components": ["PCB assembly", "SMT placement", "soldering", "prototype testing", "silicon molding", "sensor calibration", "wire harnessing"],
    "packaging": ["corrugated boxes", "biodegradable plastic", "custom printing", "flexo printing", "die cutting", "lamination"],
    "food processing": ["cold storage", "vacuum packaging", "dehydration", "pasteurization", "spice blending", "bottle filling"]
};

export default function MatchingPage() {
    const { t } = useTranslation();
    const [requirements, setRequirements] = useState([]);
    const [selectedReq, setSelectedReq] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'post'
    
    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('textiles');
    const [selectedTags, setSelectedTags] = useState([]);
    const [budgetMin, setBudgetMin] = useState(100);
    const [budgetMax, setBudgetMax] = useState(1000);
    const [quantity, setQuantity] = useState(100);
    const [locationPref, setLocationPref] = useState('Karnataka');
    const [deadline, setDeadline] = useState('2026-12-31');
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    // Load initial data (mock or backend requirements list)
    useEffect(() => {
        // Let's create some default requirements in state if none are returned by backend
        const defaultReqs = [
            {
                id: 1,
                title: "Bulk Cotton Weaving & Natural Dyeing",
                description: "Looking for local handloom weavers who use organic cotton and natural dyes.",
                required_category: "textiles",
                required_capability_tags: ["cotton weaving", "organic dye", "handloom"],
                budget_min: 100,
                budget_max: 500,
                quantity_needed: 2000,
                location_preference: "Karnataka",
                deadline: "2026-10-31"
            },
            {
                id: 2,
                title: "PCB Assembly and SMT Placement for IoT",
                description: "Requires advanced SMT capability and SMT component mounting with prototype testing.",
                required_category: "electronics components",
                required_capability_tags: ["PCB assembly", "SMT placement", "prototype testing"],
                budget_min: 15,
                budget_max: 200,
                quantity_needed: 10000,
                location_preference: "Delhi",
                deadline: "2026-09-15"
            }
        ];
        
        setRequirements(defaultReqs);
        setSelectedReq(defaultReqs[0]);
    }, []);

    // Load matches whenever active requirement changes
    useEffect(() => {
        if (!selectedReq) return;
        
        const fetchMatches = async () => {
            setLoadingMatches(true);
            try {
                // If it is a local default requirement not yet saved in DB, let's create it first
                // OR we can just try to fetch matches directly. If it fails, we post it first.
                let reqId = selectedReq.id;
                
                const res = await fetch(`${API_URL}/requirements/${reqId}/matches`, {
                    headers: getAuthHeaders()
                });
                
                if (res.status === 404 && reqId <= 2) {
                    // Seed the default requirement in the DB so it exists
                    const postRes = await fetch(`${API_URL}/requirements`, {
                        method: 'POST',
                        headers: getAuthHeaders(),
                        body: JSON.stringify({
                            title: selectedReq.title,
                            description: selectedReq.description,
                            required_category: selectedReq.required_category,
                            required_capability_tags: selectedReq.required_capability_tags,
                            budget_min: selectedReq.budget_min,
                            budget_max: selectedReq.budget_max,
                            quantity_needed: selectedReq.quantity_needed,
                            location_preference: selectedReq.location_preference,
                            deadline: selectedReq.deadline
                        })
                    });
                    if (postRes.ok) {
                        const savedReq = await postRes.json();
                        // Update requirements list with the actual saved DB entry
                        setRequirements(prev => prev.map(r => r.id === selectedReq.id ? savedReq : r));
                        setSelectedReq(savedReq);
                        return; // Trigger next hook cycle with database ID
                    }
                }
                
                if (!res.ok) throw new Error("Failed to load matches");
                
                const data = await res.json();
                setMatches(data.matches || []);
            } catch (err) {
                console.error("Error fetching matches:", err);
                setMatches([]);
            } finally {
                setLoadingMatches(false);
            }
        };

        fetchMatches();
    }, [selectedReq]);

    // Handle tag toggles
    const handleTagToggle = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(prev => prev.filter(t => t !== tag));
        } else {
            setSelectedTags(prev => [...prev, tag]);
        }
    };

    // Handle Category change to refresh chip suggestions
    const handleCategoryChange = (e) => {
        const cat = e.target.value;
        setCategory(cat);
        setSelectedTags([]); // Reset tags
    };

    // Submit new requirement posting
    const handlePostRequirement = async (e) => {
        e.preventDefault();
        setFormError('');
        
        if (!title.trim() || !description.trim()) {
            setFormError('Please enter a valid title and description.');
            return;
        }

        if (selectedTags.length === 0) {
            setFormError('Please select at least one capability tag.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/requirements`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    title,
                    description,
                    required_category: category,
                    required_capability_tags: selectedTags,
                    budget_min: Number(budgetMin),
                    budget_max: Number(budgetMax),
                    quantity_needed: Number(quantity),
                    location_preference: locationPref,
                    deadline
                })
            });

            if (!res.ok) throw new Error("Failed to post requirement");
            const newReq = await res.json();
            
            setRequirements(prev => [newReq, ...prev]);
            setSelectedReq(newReq);
            setActiveTab('browse');
            
            // Reset form
            setTitle('');
            setDescription('');
            setSelectedTags([]);
            setBudgetMin(100);
            setBudgetMax(1000);
            setQuantity(100);
            setLocationPref('Karnataka');
        } catch (err) {
            console.error(err);
            setFormError(err.message || 'Error occurred while saving.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fade-in">
            <div className="banner-header" style={{ marginBottom: '24px' }}>
                <img 
                    src="https://images.unsplash.com/photo-1556761175-103db12ba7a8?auto=format&fit=crop&w=1200&q=80" 
                    alt="Handshake" 
                    className="banner-image" 
                />
                <div className="banner-content">
                    <h2 className="banner-title">Smart MSME Matching Engine</h2>
                    <p className="banner-desc">Match government and corporate requirements directly against verified ONDC and voice-onboarded MSME vendor capabilities using advanced TF-IDF similarity scoring.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
                
                {/* Left Sidebar: Requirements Management */}
                <div>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', width: '100%' }}>
                        <button 
                            onClick={() => setActiveTab('browse')}
                            style={{
                                flex: 1,
                                padding: '10px',
                                border: '1px solid var(--border)',
                                borderRadius: '6px 0 0 6px',
                                background: activeTab === 'browse' ? 'var(--primary)' : 'white',
                                color: activeTab === 'browse' ? 'white' : 'var(--text-main)',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '13px'
                            }}
                        >
                            Browse Demands
                        </button>
                        <button 
                            onClick={() => setActiveTab('post')}
                            style={{
                                flex: 1,
                                padding: '10px',
                                border: '1px solid var(--border)',
                                borderRadius: '0 6px 6px 0',
                                background: activeTab === 'post' ? 'var(--primary)' : 'white',
                                color: activeTab === 'post' ? 'white' : 'var(--text-main)',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '13px'
                            }}
                        >
                            Post Demand
                        </button>
                    </div>

                    {activeTab === 'browse' ? (
                        <div style={{ 
                            background: 'white', 
                            border: '1px solid var(--border)', 
                            borderRadius: '8px', 
                            padding: '16px',
                            maxHeight: '70vh',
                            overflowY: 'auto'
                        }}>
                            <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Active Postings
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {requirements.map(req => (
                                    <div 
                                        key={req.id}
                                        onClick={() => setSelectedReq(req)}
                                        style={{
                                            border: '1px solid var(--border)',
                                            borderRadius: '6px',
                                            padding: '12px',
                                            cursor: 'pointer',
                                            background: selectedReq?.id === req.id ? '#EFF6FF' : 'white',
                                            borderColor: selectedReq?.id === req.id ? 'var(--primary)' : 'var(--border)',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-main)' }}>
                                            {req.title}
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase' }}>
                                            🏷️ {req.required_category}
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                            💰 ₹{req.budget_min} - ₹{req.budget_max} | Qty: {req.quantity_needed}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
                            <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px', color: 'var(--primary)' }}>
                                Post New Requirement
                            </h4>
                            
                            {formError && (
                                <div style={{ color: '#EF4444', fontSize: '12px', marginBottom: '12px', fontWeight: '500' }}>
                                    ⚠️ {formError}
                                </div>
                            )}

                            <form onSubmit={handlePostRequirement}>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Title</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Cotton Kurtis Procurement" 
                                        style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '13px' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Description</label>
                                    <textarea 
                                        required 
                                        rows="2"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe required properties..." 
                                        style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '13px' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Category</label>
                                    <select 
                                        value={category} 
                                        onChange={handleCategoryChange}
                                        style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '13px' }}
                                    >
                                        <option value="textiles">Textiles & Apparel</option>
                                        <option value="electronics components">Electronics Components</option>
                                        <option value="packaging">Packaging Materials</option>
                                        <option value="food processing">Food Processing</option>
                                    </select>
                                </div>

                                {/* Capability Chips Selector */}
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Required Capabilities</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                                        {(CATEGORY_TAGS[category] || []).map(tag => {
                                            const isSelected = selectedTags.includes(tag);
                                            return (
                                                <button
                                                    key={tag}
                                                    type="button"
                                                    onClick={() => handleTagToggle(tag)}
                                                    style={{
                                                        background: isSelected ? 'var(--secondary)' : '#F1F5F9',
                                                        color: isSelected ? 'white' : 'var(--text-main)',
                                                        border: 'none',
                                                        borderRadius: '20px',
                                                        padding: '4px 10px',
                                                        fontSize: '11px',
                                                        cursor: 'pointer',
                                                        fontWeight: '500',
                                                        transition: 'all 0.1s'
                                                    }}
                                                >
                                                    {isSelected ? '✓ ' : ''}{tag}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Min Budget (₹)</label>
                                        <input 
                                            type="number" 
                                            value={budgetMin}
                                            onChange={(e) => setBudgetMin(e.target.value)}
                                            style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '13px' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Max Budget (₹)</label>
                                        <input 
                                            type="number" 
                                            value={budgetMax}
                                            onChange={(e) => setBudgetMax(e.target.value)}
                                            style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '13px' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Qty Needed</label>
                                        <input 
                                            type="number" 
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '13px' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Pref. Location</label>
                                        <input 
                                            type="text" 
                                            value={locationPref}
                                            onChange={(e) => setLocationPref(e.target.value)}
                                            style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '13px' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Deadline</label>
                                    <input 
                                        type="date" 
                                        value={deadline}
                                        onChange={(e) => setDeadline(e.target.value)}
                                        style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '13px' }}
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={submitting}
                                    style={{ width: '100%', padding: '10px' }}
                                >
                                    {submitting ? 'Posting...' : 'Submit & Find Matches'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Right Panel: Match Results */}
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px' }}>
                    {selectedReq ? (
                        <div>
                            {/* Requirement Summary */}
                            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '18px', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <span className="badge badge-success" style={{ textTransform: 'uppercase', fontSize: '10px', padding: '4px 10px', background: '#EFF6FF', color: 'var(--primary)' }}>
                                            {selectedReq.required_category}
                                        </span>
                                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)', marginTop: '8px' }}>
                                            {selectedReq.title}
                                        </h3>
                                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
                                            {selectedReq.description}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)' }}>
                                        <strong>Deadline:</strong> {selectedReq.deadline}<br />
                                        <strong>Location Pref:</strong> {selectedReq.location_preference || 'Any'}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                                    {selectedReq.required_capability_tags.map(tag => (
                                        <span key={tag} style={{ background: '#F1F5F9', color: '#475569', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: '500' }}>
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Ranked Vendor Results */}
                            <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Ranked Vendor Matches
                            </h4>

                            {loadingMatches ? (
                                <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                                    🔄 Computing matching scores using TF-IDF cosine similarity...
                                </div>
                            ) : matches.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '48px 24px', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed var(--border)' }}>
                                    <span style={{ fontSize: '32px' }}>🔍</span>
                                    <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '14px' }}>
                                        No vendors match the hard filters (matching Category & overlapping Budget). Try relaxing your budget constraints.
                                    </p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {matches.map((match, idx) => {
                                        const vendor = match.vendor;
                                        const breakdown = match.breakdown;
                                        const isTopMatch = idx === 0;

                                        return (
                                            <div 
                                                key={vendor.id}
                                                style={{
                                                    border: '1px solid var(--border)',
                                                    borderRadius: '8px',
                                                    padding: '20px',
                                                    background: isTopMatch ? '#FDF8F5' : 'white',
                                                    borderColor: isTopMatch ? 'var(--secondary)' : 'var(--border)',
                                                    boxShadow: isTopMatch ? '0 4px 12px rgba(242,101,34,0.1)' : 'var(--shadow-sm)',
                                                    position: 'relative',
                                                    transition: 'transform 0.2s'
                                                }}
                                            >
                                                {/* Badge for voice onboarding */}
                                                {vendor.onboarded_via_voice && (
                                                    <span style={{
                                                        position: 'absolute',
                                                        top: '12px',
                                                        right: '100px',
                                                        background: '#D1FAE5',
                                                        color: '#065F46',
                                                        fontSize: '10px',
                                                        fontWeight: '700',
                                                        padding: '2px 8px',
                                                        borderRadius: '12px'
                                                    }}>
                                                        🗣️ VOICE ASSIST ONBOARDED
                                                    </span>
                                                )}

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <span style={{ 
                                                                background: isTopMatch ? 'var(--secondary)' : 'var(--primary)', 
                                                                color: 'white', 
                                                                borderRadius: '50%',
                                                                width: '24px',
                                                                height: '24px',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontWeight: '700',
                                                                fontSize: '12px'
                                                            }}>
                                                                #{idx + 1}
                                                            </span>
                                                            <h5 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>
                                                                {vendor.name}
                                                            </h5>
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                            📍 {vendor.location} | Capacity: {vendor.production_capacity || 'N/A'}
                                                        </div>
                                                    </div>

                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ 
                                                            fontSize: '22px', 
                                                            fontWeight: '800', 
                                                            color: isTopMatch ? 'var(--secondary)' : 'var(--primary)'
                                                        }}>
                                                            {match.final_score}%
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
                                                            MATCH SCORE
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '32px', marginTop: '16px', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                                                    {/* Left Detail columns */}
                                                    <div>
                                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                                            {vendor.capability_tags.map(tag => {
                                                                const isRequested = selectedReq.required_capability_tags.includes(tag);
                                                                return (
                                                                    <span 
                                                                        key={tag}
                                                                        style={{ 
                                                                            background: isRequested ? '#EFF6FF' : '#F1F5F9', 
                                                                            color: isRequested ? 'var(--primary)' : '#475569', 
                                                                            border: isRequested ? '1px solid #BFDBFE' : '1px solid transparent',
                                                                            fontSize: '10px', 
                                                                            padding: '2px 8px', 
                                                                            borderRadius: '12px',
                                                                            fontWeight: isRequested ? '600' : '400'
                                                                        }}
                                                                    >
                                                                        {tag}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                            <strong>Price Range:</strong> ₹{vendor.price_range_min} - ₹{vendor.price_range_max} | 
                                                            <strong> Certifications:</strong> {vendor.certifications?.join(', ') || 'None'}
                                                        </div>
                                                    </div>

                                                    {/* Score Breakdown Progress Bars */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                        {/* Capability */}
                                                        <div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: '600', marginBottom: '2px' }}>
                                                                <span>Capability Fit (60% weight)</span>
                                                                <span>{breakdown.capability_match}%</span>
                                                            </div>
                                                            <div style={{ height: '5px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                                                                <div style={{ height: '100%', background: '#3B82F6', width: `${breakdown.capability_match}%` }} />
                                                            </div>
                                                        </div>
                                                        {/* Performance */}
                                                        <div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: '600', marginBottom: '2px' }}>
                                                                <span>Performance Rating (25% weight)</span>
                                                                <span>{breakdown.performance_match}% ({vendor.past_performance_rating}★)</span>
                                                            </div>
                                                            <div style={{ height: '5px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                                                                <div style={{ height: '100%', background: '#10B981', width: `${breakdown.performance_match}%` }} />
                                                            </div>
                                                        </div>
                                                        {/* Location */}
                                                        <div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: '600', marginBottom: '2px' }}>
                                                                <span>Location Bonus (15% weight)</span>
                                                                <span>{breakdown.location_match}%</span>
                                                            </div>
                                                            <div style={{ height: '5px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                                                                <div style={{ height: '100%', background: '#F59E0B', width: `${breakdown.location_match}%` }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                            <span style={{ fontSize: '48px' }}>📋</span>
                            <h3 style={{ marginTop: '16px', fontWeight: '600' }}>No Active Demand Selected</h3>
                            <p style={{ fontSize: '13px' }}>Select an existing requirement posting from the left sidebar or post a new one to evaluate matched vendors.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
