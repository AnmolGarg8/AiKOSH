import os
import json
import random
import numpy as np
from typing import List, Dict, Any
from models.ayush import HealthRecord, UserProfile, Recommendation
from db import SessionLocal

# Categories and Districts
SYMPTOM_CATEGORIES = ["respiratory", "digestive", "joint_pain", "skin", "seasonal_fever"]
DISTRICTS = [
    "Bangalore Urban", "Mysore", "Belagavi", "Kalaburagi", 
    "Hubli-Dharwad", "Mangalore", "Shimoga", "Tumkur", "Udupi", "Davanagere"
]

def generate_ayush_synthetic_data() -> List[Dict[str, Any]]:
    records = []
    # 2024, 2025 (all 12 months) and 2026 (first 6 months)
    time_points = []
    for y in [2024, 2025]:
        for m in range(1, 13):
            time_points.append((y, m))
    for m in range(1, 7):
        time_points.append((2026, m))

    # Base case counts per district to introduce variance
    district_bases = {
        "Bangalore Urban": 120,
        "Mysore": 80,
        "Belagavi": 60,
        "Kalaburagi": 95,
        "Hubli-Dharwad": 75,
        "Mangalore": 85,
        "Shimoga": 50,
        "Tumkur": 55,
        "Udupi": 45,
        "Davanagere": 65
    }

    # Seasonality multipliers per category based on month
    # 1: Jan, 2: Feb, 3: Mar, 4: Apr, 5: May, 6: Jun, 7: Jul, 8: Aug, 9: Sep, 10: Oct, 11: Nov, 12: Dec
    seasonality = {
        "respiratory": {1: 3.5, 2: 3.0, 3: 1.5, 4: 1.0, 5: 1.0, 6: 1.2, 7: 1.5, 8: 1.8, 9: 1.5, 10: 2.0, 11: 2.8, 12: 3.6},
        "digestive": {1: 1.0, 2: 1.0, 3: 1.2, 4: 1.5, 5: 1.8, 6: 2.8, 7: 3.5, 8: 3.2, 9: 2.0, 10: 1.4, 11: 1.1, 12: 1.0},
        "joint_pain": {1: 2.2, 2: 1.8, 3: 1.2, 4: 1.0, 5: 1.0, 6: 1.5, 7: 2.0, 8: 1.8, 9: 1.4, 10: 1.5, 11: 1.8, 12: 2.4},
        "skin": {1: 1.0, 2: 1.2, 3: 1.8, 4: 2.4, 5: 3.0, 6: 2.5, 7: 1.6, 8: 1.4, 9: 1.2, 10: 1.0, 11: 1.0, 12: 1.0},
        "seasonal_fever": {1: 1.0, 2: 1.1, 3: 1.8, 4: 1.5, 5: 1.3, 6: 2.2, 7: 3.0, 8: 3.5, 9: 4.2, 10: 3.8, 11: 2.0, 12: 1.2}
    }

    random.seed(42) # Consistent generation

    for district in DISTRICTS:
        base = district_bases[district]
        for year, month in time_points:
            for category in SYMPTOM_CATEGORIES:
                mult = seasonality[category][month]
                # Add random noise
                noise = random.uniform(-0.15, 0.15) * base
                cases = int(base * mult + noise)
                # Keep it above 5 cases minimum
                cases = max(cases, 5)
                
                records.append({
                    "district": district,
                    "month": month,
                    "year": year,
                    "symptom_category": category,
                    "reported_cases": cases
                })
    return records

def double_exponential_smoothing(series: List[float], alpha: float = 0.4, beta: float = 0.2, steps: int = 3) -> List[float]:
    """Pure Python double exponential smoothing (Holt's Linear Trend)"""
    if len(series) < 2:
        return [series[0] if series else 0.0] * steps
        
    level = series[0]
    trend = series[1] - series[0]
    
    for i in range(1, len(series)):
        val = series[i]
        last_level = level
        level = alpha * val + (1 - alpha) * (level + trend)
        trend = beta * (level - last_level) + (1 - beta) * trend
        
    forecasts = []
    for step in range(1, steps + 1):
        f_val = level + step * trend
        forecasts.append(round(max(f_val, 0.0), 1))
    return forecasts

def detect_trends_and_forecast(records: List[HealthRecord], district: str, category: str) -> Dict[str, Any]:
    # Filter and sort
    series_records = [r for r in records if r.district == district and r.symptom_category == category]
    series_records.sort(key=lambda x: (x.year, x.month))
    
    if not series_records:
        return {
            "historical": [],
            "forecast": [],
            "risk_level": "normal",
            "message": "No historical cases recorded for this criteria."
        }
        
    # Get values
    history_cases = [float(r.reported_cases) for r in series_records]
    history_dates = [f"{r.month}/{r.year}" for r in series_records]
    
    # Calculate moving average (3-month window)
    moving_averages = []
    for i in range(len(history_cases)):
        if i < 2:
            moving_averages.append(history_cases[i]) # fallback for start of series
        else:
            window = history_cases[i-2:i+1]
            moving_averages.append(round(sum(window) / 3.0, 1))

    # Calculate mean and standard deviation
    mean_val = np.mean(history_cases)
    std_val = np.std(history_cases) if len(history_cases) > 1 else 1.0
    
    # Forecast next 3 months using double exponential smoothing
    forecast_cases = double_exponential_smoothing(history_cases, steps=3)
    
    # Generate dates for forecast
    last_r = series_records[-1]
    forecast_dates = []
    curr_month = last_r.month
    curr_year = last_r.year
    
    for _ in range(3):
        curr_month += 1
        if curr_month > 12:
            curr_month = 1
            curr_year += 1
        forecast_dates.append(f"{curr_month}/{curr_year}")
        
    # Flag elevated risk if projected count exceeds historical mean + 1.5 * std
    next_month_projected = forecast_cases[0]
    high_threshold = mean_val + 1.5 * std_val
    watch_threshold = mean_val + 1.0 * std_val
    
    if next_month_projected >= high_threshold:
        risk_level = "elevated"
    elif next_month_projected >= watch_threshold:
        risk_level = "watch"
    else:
        risk_level = "normal"
        
    # Structure combined chart data
    chart_data = []
    for i in range(len(history_cases)):
        chart_data.append({
            "date": history_dates[i],
            "historical": int(history_cases[i]),
            "moving_average": moving_averages[i],
            "forecast": None
        })
    
    # Connect forecast to last historical point in the chart line
    chart_data[-1]["forecast"] = int(history_cases[-1])
    
    for i in range(3):
        chart_data.append({
            "date": forecast_dates[i],
            "historical": None,
            "moving_average": None,
            "forecast": int(forecast_cases[i])
        })
        
    return {
        "historical_mean": round(float(mean_val), 1),
        "historical_std": round(float(std_val), 1),
        "risk_level": risk_level,
        "high_threshold": round(float(high_threshold), 1),
        "chart_data": chart_data
    }

def match_recommendations(dosha: str, symptoms: List[str], lifestyle: List[str]) -> Dict[str, List[str]]:
    # Read lookup recommendations json
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    rec_path = os.path.join(base_dir, "data", "ayush_recommendations.json")
    
    rules = []
    if os.path.exists(rec_path):
        with open(rec_path, "r", encoding="utf-8") as f:
            rules = json.load(f)
            
    matched_treatments = set()
    matched_lifestyle = set()
    
    user_symptoms = set(s.lower() for s in symptoms)
    user_lifestyle = set(l.lower() for l in lifestyle)
    
    # Check rule matching
    for rule in rules:
        rule_dosha = rule["dosha_type"].lower()
        
        # 1. Match dosha type (or any)
        if rule_dosha == dosha.lower() or rule_dosha == "any":
            rule_symptoms = set(s.lower() for s in rule["symptom_tags"])
            rule_lifestyle = set(l.lower() for l in rule["lifestyle_factors"])
            
            # 2. Match if symptoms overlap or lifestyle factors overlap or rule is general "any"
            symptom_overlap = bool(user_symptoms.intersection(rule_symptoms))
            lifestyle_overlap = bool(user_lifestyle.intersection(rule_lifestyle))
            
            if symptom_overlap or lifestyle_overlap or rule_dosha == dosha.lower():
                for t in rule["recommended_treatments"]:
                    matched_treatments.add(t)
                for l_chg in rule["recommended_lifestyle_changes"]:
                    matched_lifestyle.add(l_chg)
                    
    # Fallback default if nothing matched
    if not matched_treatments:
        matched_treatments.add("General immunity boosting: Consuming warm water boiled with ginger and tulsi daily.")
        matched_treatments.add("Practice light restorative Yoga / stretching for 10-15 minutes in the morning.")
        
    if not matched_lifestyle:
        matched_lifestyle.add("Establish a steady daily routine with consistent sleep and eating timings.")
        matched_lifestyle.add("Spend 10-15 minutes walking outdoors in clean fresh air.")
        
    return {
        "treatments": list(matched_treatments),
        "lifestyle_changes": list(matched_lifestyle)
    }
