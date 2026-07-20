import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { API_URL, getAuthHeaders } from '../services/api';

const DISTRICTS = [
    "Bangalore Urban", "Mysore", "Belagavi", "Kalaburagi", 
    "Hubli-Dharwad", "Mangalore", "Shimoga", "Tumkur", "Udupi", "Davanagere"
];

const SYMPTOM_CATEGORIES = [
    { key: "respiratory", label: "Respiratory Conditions" },
    { key: "digestive", label: "Digestive Disorders" },
    { key: "joint_pain", label: "Joint & Muscular Pain" },
    { key: "skin", label: "Skin Irritations" },
    { key: "seasonal_fever", label: "Seasonal Fevers" }
];

const AVAILABLE_SYMPTOMS = [
    { key: "joint_pain", label: "Joint Stiffness / Pain" },
    { key: "dry_skin", label: "Dry or Flaky Skin" },
    { key: "insomnia", label: "Difficulty Falling Asleep" },
    { key: "acid_reflux", label: "Heartburn / Acid Reflux" },
    { key: "skin_rashes", label: "Rashes / Inflamed Skin" },
    { key: "excessive_heat", label: "Feeling Excessively Hot / Thirsty" },
    { key: "congestion", label: "Mucus Congestion / Heavy Chest" },
    { key: "lethargy", label: "Excessive Fatigue / Lethargy" },
    { key: "weight_gain", label: "Sluggish Metabolism / Weight Gain" },
    { key: "fatigue", label: "General Weakness" }
];

const AVAILABLE_LIFESTYLE = [
    { key: "high_stress", label: "High Occupational Stress" },
    { key: "poor_sleep", label: "Irregular Sleep Schedules" },
    { key: "sedentary", label: "Sedentary Desk Job" },
    { key: "spicy_diet", label: "Highly Spicy or Oily Diet" },
    { key: "excessive_sleep", label: "Sleeping during daytime" }
];

export default function AyushDashboard() {
    const { t } = useTranslation();
    
    // View state: 'dashboard' | 'questionnaire' | 'results'
    const [view, setView] = useState('dashboard');
    
    // Trend Dashboard State
    const [selectedDistrict, setSelectedDistrict] = useState("Bangalore Urban");
    const [selectedCategory, setSelectedCategory] = useState("respiratory");
    const [trendData, setTrendData] = useState(null);
    const [loadingTrend, setLoadingTrend] = useState(false);
    
    // Risk Summary State
    const [riskSummary, setRiskSummary] = useState([]);
    const [loadingSummary, setLoadingSummary] = useState(false);

    // Questionnaire State
    const [age, setAge] = useState(30);
    const [doshaAnswers, setDoshaAnswers] = useState({ q1: 'vata', q2: 'vata', q3: 'vata' });
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [selectedLifestyle, setSelectedLifestyle] = useState([]);
    const [matchedRecs, setMatchedRecs] = useState(null);
    const [submittingQuestionnaire, setSubmittingQuestionnaire] = useState(false);

    // Fetch risk summary on mount
    const fetchRiskSummary = async () => {
        setLoadingSummary(true);
        try {
            const res = await fetch(`${API_URL}/ayush/risk-summary`, { headers: getAuthHeaders() });
            if (!res.ok) throw new Error("Failed to load risk summary");
            const data = await res.json();
            setRiskSummary(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingSummary(false);
        }
    };

    // Fetch trend data whenever selection changes
    const fetchTrendData = async () => {
        setLoadingTrend(true);
        try {
            const res = await fetch(
                `${API_URL}/ayush/trends?district=${encodeURIComponent(selectedDistrict)}&category=${selectedCategory}`,
                { headers: getAuthHeaders() }
            );
            if (!res.ok) throw new Error("Failed to load trend data");
            const data = await res.json();
            setTrendData(data);
        } catch (err) {
            console.error(err);
            setTrendData(null);
        } finally {
            setLoadingTrend(false);
        }
    };

    useEffect(() => {
        fetchRiskSummary();
    }, []);

    useEffect(() => {
        fetchTrendData();
    }, [selectedDistrict, selectedCategory]);

    const handleSymptomToggle = (symptom) => {
        if (selectedSymptoms.includes(symptom)) {
            setSelectedSymptoms(prev => prev.filter(s => s !== symptom));
        } else {
            setSelectedSymptoms(prev => [...prev, symptom]);
        }
    };

    const handleLifestyleToggle = (factor) => {
        if (selectedLifestyle.includes(factor)) {
            setSelectedLifestyle(prev => prev.filter(f => f !== factor));
        } else {
            setSelectedLifestyle(prev => [...prev, factor]);
        }
    };

    const submitQuestionnaire = async (e) => {
        e.preventDefault();
        
        // Determine dominant dosha based on majority count of answers
        const counts = { vata: 0, pitta: 0, kapha: 0 };
        Object.values(doshaAnswers).forEach(ans => {
            counts[ans] = (counts[ans] || 0) + 1;
        });
        
        let dominantDosha = 'vata';
        if (counts.pitta > counts.vata && counts.pitta >= counts.kapha) dominantDosha = 'pitta';
        if (counts.kapha > counts.vata && counts.kapha > counts.pitta) dominantDosha = 'kapha';

        setSubmittingQuestionnaire(true);
        try {
            const res = await fetch(`${API_URL}/ayush/recommendations`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    age: Number(age),
                    dosha_type: dominantDosha,
                    symptom_tags: selectedSymptoms,
                    lifestyle_factors: selectedLifestyle
                })
            });

            if (!res.ok) throw new Error("Failed to generate recommendations");
            const data = await res.json();
            setMatchedRecs({
                ...data,
                computed_dosha: dominantDosha
            });
            setView('results');
        } catch (err) {
            alert(err.message || "Failed to process recommendations");
        } finally {
            setSubmittingQuestionnaire(false);
        }
    };

    // Helper to render custom SVG line chart
    const renderSVGChart = (data) => {
        if (!data || data.length === 0) return null;
        
        const width = 640;
        const height = 280;
        const paddingLeft = 40;
        const paddingRight = 20;
        const paddingTop = 20;
        const paddingBottom = 40;

        const cleanValues = data.map(d => d.historical !== null ? d.historical : (d.forecast !== null ? d.forecast : 0));
        const maxVal = Math.max(...cleanValues, 20) * 1.1; // 10% safety margin

        const getX = (index) => {
            return paddingLeft + (index * (width - paddingLeft - paddingRight)) / (data.length - 1);
        };
        const getY = (value) => {
            return height - paddingBottom - (value * (height - paddingTop - paddingBottom)) / maxVal;
        };

        // Construct Path for Historical points
        let histPath = "";
        let maPath = "";
        let fcPath = "";
        
        const historicalPoints = data.filter(d => d.historical !== null);
        const forecastPoints = data.filter(d => d.forecast !== null || d.date === data[historicalPoints.length - 1]?.date);

        historicalPoints.forEach((d, i) => {
            const x = getX(i);
            const y = getY(d.historical);
            const maY = getY(d.moving_average);
            if (i === 0) {
                histPath = `M ${x} ${y}`;
                maPath = `M ${x} ${maY}`;
            } else {
                histPath += ` L ${x} ${y}`;
                maPath += ` L ${x} ${maY}`;
            }
        });

        // Forecast starts from last historical point
        const startIndex = historicalPoints.length - 1;
        forecastPoints.forEach((d, i) => {
            const index = startIndex + i;
            const x = getX(index);
            const val = d.forecast !== null ? d.forecast : d.historical;
            const y = getY(val);
            if (i === 0) {
                fcPath = `M ${x} ${y}`;
            } else {
                fcPath += ` L ${x} ${y}`;
            }
        });

        return (
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border)' }}>
                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                    const y = getY(maxVal * ratio);
                    return (
                        <g key={idx}>
                            <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#E2E8F0" strokeDasharray="3 3" />
                            <text x={paddingLeft - 8} y={y + 4} textAnchor="end" style={{ fontSize: '10px', fill: '#64748B' }}>
                                {Math.round(maxVal * ratio)}
                            </text>
                        </g>
                    );
                })}

                {/* X Axis Labels */}
                {data.map((d, i) => {
                    // Show label only for start, end, and transition points
                    const isTransition = d.historical === null && data[i-1]?.historical !== null;
                    const showLabel = i === 0 || i === data.length - 1 || isTransition || i === Math.floor(data.length / 2);
                    if (!showLabel) return null;
                    const x = getX(i);
                    return (
                        <g key={i}>
                            <line x1={x} y1={height - paddingBottom} x2={x} y2={height - paddingBottom + 4} stroke="#94A3B8" />
                            <text x={x} y={height - paddingBottom + 16} textAnchor="middle" style={{ fontSize: '10px', fill: '#64748B' }}>
                                {d.date}
                            </text>
                        </g>
                    );
                })}

                {/* Lines */}
                {histPath && <path d={histPath} fill="none" stroke="#2563EB" strokeWidth="2.5" />}
                {maPath && <path d={maPath} fill="none" stroke="#10B981" strokeWidth="1.5" strokeDasharray="2 2" />}
                {fcPath && <path d={fcPath} fill="none" stroke="#EF4444" strokeWidth="2.5" strokeDasharray="4 4" />}

                {/* Legend */}
                <g transform={`translate(${paddingLeft + 10}, 20)`}>
                    <line x1="0" y1="0" x2="15" y2="0" stroke="#2563EB" strokeWidth="2.5" />
                    <text x="20" y="4" style={{ fontSize: '10px', fill: '#334155', fontWeight: '500' }}>Historical Cases</text>
                    
                    <line x1="120" y1="0" x2="135" y2="0" stroke="#10B981" strokeWidth="1.5" strokeDasharray="2 2" />
                    <text x="140" y="4" style={{ fontSize: '10px', fill: '#334155', fontWeight: '500' }}>Moving Avg Trend</text>
                    
                    <line x1="245" y1="0" x2="260" y2="0" stroke="#EF4444" strokeWidth="2.5" strokeDasharray="4 4" />
                    <text x="265" y="4" style={{ fontSize: '10px', fill: '#334155', fontWeight: '500' }}>Forecast (3M)</text>
                </g>
            </svg>
        );
    };

    return (
        <div className="fade-in">
            {/* View 1: Main Dashboard */}
            {view === 'dashboard' && (
                <div>
                    {/* Header Banner */}
                    <div className="banner-header" style={{ marginBottom: '24px' }}>
                        <img 
                            src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80" 
                            alt="Ayush" 
                            className="banner-image" 
                        />
                        <div className="banner-content">
                            <h2 className="banner-title">National AYUSH Health Intelligence Dashboard</h2>
                            <p className="banner-desc">
                                Cross-referencing epidemiological trends with classical Ayurvedic wellness recommendations to build proactive community healthcare.
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', marginBottom: '32px' }}>
                        {/* Left Column: Line Chart and Selectors */}
                        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)' }}>
                                    Disease Trend Forecast & Moving Average
                                </h3>
                                {/* Risk level badge */}
                                {trendData && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Statused Risk:</span>
                                        <span style={{
                                            background: trendData.risk_level === 'elevated' ? '#FEE2E2' : (trendData.risk_level === 'watch' ? '#FEF3C7' : '#D1FAE5'),
                                            color: trendData.risk_level === 'elevated' ? '#991B1B' : (trendData.risk_level === 'watch' ? '#92400E' : '#065F46'),
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            textTransform: 'uppercase'
                                        }}>
                                            ⚠️ {trendData.risk_level}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Selectors */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>District</label>
                                    <select 
                                        value={selectedDistrict} 
                                        onChange={(e) => setSelectedDistrict(e.target.value)}
                                        style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '13px' }}
                                    >
                                        {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Symptom Group</label>
                                    <select 
                                        value={selectedCategory} 
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '13px' }}
                                    >
                                        {SYMPTOM_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Chart Container */}
                            {loadingTrend ? (
                                <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                    Recalculating exponential smoothing forecast...
                                </div>
                            ) : trendData ? (
                                renderSVGChart(trendData.chart_data)
                            ) : (
                                <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
                                    Error loading trend data.
                                </div>
                            )}

                            {trendData && trendData.risk_level === 'elevated' && (
                                <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', borderRadius: '6px', padding: '12px', marginTop: '16px', color: '#C53030', fontSize: '12px', fontWeight: '500' }}>
                                    🚨 <strong>Risk Warning:</strong> Projected cases for next month ({trendData.chart_data.filter(d => d.forecast !== null)[0]?.forecast}) exceed the historical alert threshold of {trendData.high_threshold}. Watch guidelines are recommended.
                                </div>
                            )}
                        </div>

                        {/* Right Column: Questionnaire Access card */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px', textAlign: 'center' }}>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌿</div>
                                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)' }}>Personal Wellness Profiling</h3>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '8px 0 16px 0', lineHeight: '1.5' }}>
                                    Assess your Dosha type (Prakriti) and receive matched AYUSH treatment guidelines and lifestyle remedies.
                                </p>
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => setView('questionnaire')}
                                    style={{ width: '100%' }}
                                >
                                    Take Wellness Quiz
                                </button>
                            </div>

                            {/* Info card */}
                            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '16px', fontSize: '12px', color: 'var(--text-main)', lineHeight: '1.5' }}>
                                <strong>💡 Fact:</strong> Traditional AYUSH systems promote preventative care. Dynamic data maps assist district authorities in preparing supply chains for raw materials and herbal medicines.
                            </div>
                        </div>
                    </div>

                    {/* National Risk Map/Table Overview */}
                    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)', marginBottom: '16px' }}>
                            District Epidemiological Watchlist (AYUSH Projections)
                        </h3>

                        {loadingSummary ? (
                            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                                Aggregating national forecast metrics...
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                {riskSummary.map(row => (
                                    <div 
                                        key={row.district}
                                        onClick={() => setSelectedDistrict(row.district)}
                                        style={{
                                            border: '1px solid var(--border)',
                                            borderRadius: '6px',
                                            padding: '16px',
                                            cursor: 'pointer',
                                            background: selectedDistrict === row.district ? '#EFF6FF' : 'white',
                                            borderColor: selectedDistrict === row.district ? 'var(--primary)' : 'var(--border)',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <strong style={{ fontSize: '14px' }}>{row.district}</strong>
                                            <span style={{
                                                background: row.risk_level === 'elevated' ? '#FEE2E2' : (row.risk_level === 'watch' ? '#FEF3C7' : '#D1FAE5'),
                                                color: row.risk_level === 'elevated' ? '#991B1B' : (row.risk_level === 'watch' ? '#92400E' : '#065F46'),
                                                fontSize: '10px',
                                                fontWeight: '700',
                                                padding: '2px 8px',
                                                borderRadius: '10px',
                                                textTransform: 'uppercase'
                                            }}>
                                                {row.risk_level}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                                            {row.elevated_categories.length > 0 ? (
                                                <span style={{ color: '#EF4444' }}>🚨 High Risk: {row.elevated_categories.join(', ')}</span>
                                            ) : row.watch_categories.length > 0 ? (
                                                <span style={{ color: '#F59E0B' }}>⚠️ Watch: {row.watch_categories.join(', ')}</span>
                                            ) : (
                                                <span>✓ Normal levels</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* View 2: Questionnaire Wizard */}
            {view === 'questionnaire' && (
                <div style={{ maxWidth: '650px', margin: '0 auto', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>AYUSH Wellness Profiler</h3>
                        <button className="btn btn-outline" onClick={() => setView('dashboard')}>Back</button>
                    </div>

                    <form onSubmit={submitQuestionnaire}>
                        {/* Age */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Your Age</label>
                            <input 
                                type="number" 
                                value={age} 
                                onChange={(e) => setAge(e.target.value)} 
                                style={{ width: '120px', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px' }}
                            />
                        </div>

                        {/* Dosha Questions */}
                        <h4 style={{ fontSize: '14px', fontWeight: '700', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '12px', color: 'var(--primary)' }}>
                            1. Constitution (Dosha Self-Assessment)
                        </h4>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>How is your body build and energy level?</label>
                            <select 
                                value={doshaAnswers.q1} 
                                onChange={(e) => setDoshaAnswers({ ...doshaAnswers, q1: e.target.value })}
                                style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px' }}
                            >
                                <option value="vata">Thin, active, gets tired easily</option>
                                <option value="pitta">Medium, muscular, intense energy</option>
                                <option value="kapha">Large, stocky, steady energy, slow to tire</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>How do you react to weather changes?</label>
                            <select 
                                value={doshaAnswers.q2} 
                                onChange={(e) => setDoshaAnswers({ ...doshaAnswers, q2: e.target.value })}
                                style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px' }}
                            >
                                <option value="vata">Dislike cold weather and dry wind</option>
                                <option value="pitta">Dislike hot weather and direct sun</option>
                                <option value="kapha">Dislike damp cold, prefer dry heat</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>How is your typical sleep pattern?</label>
                            <select 
                                value={doshaAnswers.q3} 
                                onChange={(e) => setDoshaAnswers({ ...doshaAnswers, q3: e.target.value })}
                                style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px' }}
                            >
                                <option value="vata">Light, irregular, easily disturbed</option>
                                <option value="pitta">Sound, moderate, wake up easily</option>
                                <option value="kapha">Heavy, long, deep, hard to wake up</option>
                            </select>
                        </div>

                        {/* Symptoms Checkboxes */}
                        <h4 style={{ fontSize: '14px', fontWeight: '700', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '12px', color: 'var(--primary)' }}>
                            2. Current Symptom Groups (Check all that apply)
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                            {AVAILABLE_SYMPTOMS.map(item => {
                                const isChecked = selectedSymptoms.includes(item.key);
                                return (
                                    <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={isChecked} 
                                            onChange={() => handleSymptomToggle(item.key)}
                                        />
                                        {item.label}
                                    </label>
                                );
                            })}
                        </div>

                        {/* Lifestyle Checkboxes */}
                        <h4 style={{ fontSize: '14px', fontWeight: '700', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '12px', color: 'var(--primary)' }}>
                            3. Lifestyle & Diet Factors (Check all that apply)
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '28px' }}>
                            {AVAILABLE_LIFESTYLE.map(item => {
                                const isChecked = selectedLifestyle.includes(item.key);
                                return (
                                    <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={isChecked} 
                                            onChange={() => handleLifestyleToggle(item.key)}
                                        />
                                        {item.label}
                                    </label>
                                );
                            })}
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary btn-large" 
                            style={{ width: '100%' }}
                            disabled={submittingQuestionnaire}
                        >
                            {submittingQuestionnaire ? 'Matching rules...' : 'Evaluate & Match Recommendations →'}
                        </button>
                    </form>
                </div>
            )}

            {/* View 3: Recommendations Output Screen */}
            {view === 'results' && matchedRecs && (
                <div style={{ maxWidth: '700px', margin: '0 auto', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>
                            Your Personalized AYUSH Wellness Plan
                        </h3>
                        <button className="btn btn-outline" onClick={() => setView('dashboard')}>Return to Dashboard</button>
                    </div>

                    {/* Dosha Box */}
                    <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '6px', padding: '16px', marginBottom: '24px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Computed Constitutional Temperament:</span>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', marginTop: '4px' }}>
                            🍃 {matchedRecs.computed_dosha} Prakriti
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                        {/* Treatments */}
                        <div>
                            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)', borderBottom: '2px solid #E2E8F0', paddingBottom: '6px', marginBottom: '12px' }}>
                                Recommended AYUSH Practices
                            </h4>
                            <ul style={{ paddingLeft: '20px', fontSize: '12px', color: 'var(--text-main)', lineHeight: '1.6' }}>
                                {matchedRecs.recommended_treatments.map((t, idx) => (
                                    <li key={idx} style={{ marginBottom: '8px' }}>{t}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Lifestyle */}
                        <div>
                            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)', borderBottom: '2px solid #E2E8F0', paddingBottom: '6px', marginBottom: '12px' }}>
                                Daily Routine & Diet Adjustments
                            </h4>
                            <ul style={{ paddingLeft: '20px', fontSize: '12px', color: 'var(--text-main)', lineHeight: '1.6' }}>
                                {matchedRecs.recommended_lifestyle_changes.map((l, idx) => (
                                    <li key={idx} style={{ marginBottom: '8px' }}>{l}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Persistent Disclaimer */}
                    <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', padding: '16px', borderRadius: '6px', color: '#78350F', fontSize: '11px', lineHeight: '1.5', fontWeight: '500' }}>
                        ⚠️ <strong>Disclaimer:</strong> {matchedRecs.disclaimer}
                    </div>
                </div>
            )}
        </div>
    );
}
