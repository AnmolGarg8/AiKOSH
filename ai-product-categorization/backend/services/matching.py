import os
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from models.agent_mapping import VendorProfile, RequirementPosting

class MatchingEngine:
    def find_matches(self, requirement: RequirementPosting, vendors: List[VendorProfile]) -> List[Dict[str, Any]]:
        # Step 1: Hard Filters
        # Filter by category matching (case insensitive)
        req_category = requirement.required_category.strip().lower()
        candidates = []
        for v in vendors:
            v_category = v.category.strip().lower()
            if v_category != req_category:
                continue
            
            # Check price range overlap
            # Overlap: max(min_a, min_b) <= min(max_a, max_b)
            # If any of the ranges are unspecified (0), we consider it overlapping
            has_overlap = True
            if v.price_range_min > 0 or v.price_range_max > 0:
                min_overlap = max(v.price_range_min, requirement.budget_min)
                max_overlap = min(v.price_range_max, requirement.budget_max)
                if min_overlap > max_overlap:
                    has_overlap = False
            
            if has_overlap:
                candidates.append(v)
        
        if not candidates:
            return []
        
        # Step 2: Scoring via TF-IDF Cosine Similarity on Capability Tags
        req_tags = [tag.strip().lower() for tag in requirement.required_capability_tags]
        req_text = " ".join(req_tags)
        
        # Corpus contains requirement as the first entry, followed by candidates
        corpus = [req_text]
        for v in candidates:
            v_tags = [tag.strip().lower() for tag in v.capability_tags]
            corpus.append(" ".join(v_tags))
        
        # Calculate TF-IDF similarities
        try:
            vectorizer = TfidfVectorizer(token_pattern=r'(?u)\b[\w\s-]+\b')
            tfidf_matrix = vectorizer.fit_transform(corpus)
            req_vector = tfidf_matrix[0:1]
            vendor_vectors = tfidf_matrix[1:]
            similarities = cosine_similarity(req_vector, vendor_vectors)[0]
        except Exception as e:
            print(f"TF-IDF vectorization failed: {e}. Falling back to simple tag overlap.")
            # Fallback simple set intersection similarity
            similarities = []
            req_set = set(req_tags)
            for v in candidates:
                v_set = set(tag.strip().lower() for tag in v.capability_tags)
                if not req_set:
                    similarities.append(0.0)
                else:
                    intersection = req_set.intersection(v_set)
                    similarities.append(len(intersection) / len(req_set))
        
        # Step 3: Weighting and Final Score Compilation
        ranked_results = []
        for idx, vendor in enumerate(candidates):
            cap_sim = float(similarities[idx])
            
            # Past performance normalized (rating is 0-5)
            perf_score = min(max(vendor.past_performance_rating / 5.0, 0.0), 1.0)
            
            # Location match bonus (15% if same state)
            loc_match = False
            req_loc = (requirement.location_preference or "").strip().lower()
            v_loc = (vendor.location or "").strip().lower()
            if req_loc and v_loc and (req_loc in v_loc or v_loc in req_loc):
                loc_match = True
            
            loc_score = 1.0 if loc_match else 0.0
            
            # Weighted final score: 60% capability, 25% performance, 15% location
            final_score = (cap_sim * 0.60 + perf_score * 0.25 + loc_score * 0.15) * 100.0
            
            ranked_results.append({
                "vendor": {
                    "id": vendor.id,
                    "name": vendor.name,
                    "category": vendor.category,
                    "capability_tags": vendor.capability_tags,
                    "certifications": vendor.certifications,
                    "location": vendor.location,
                    "production_capacity": vendor.production_capacity,
                    "price_range_min": vendor.price_range_min,
                    "price_range_max": vendor.price_range_max,
                    "past_performance_rating": vendor.past_performance_rating,
                    "onboarded_via_voice": vendor.onboarded_via_voice,
                    "raw_voice_transcript": vendor.raw_voice_transcript
                },
                "breakdown": {
                    "capability_match": round(cap_sim * 100.0, 1),
                    "performance_match": round(perf_score * 100.0, 1),
                    "location_match": round(loc_score * 100.0, 1)
                },
                "final_score": round(final_score, 1)
            })
        
        # Sort by final score descending
        ranked_results.sort(key=lambda x: x["final_score"], reverse=True)
        return ranked_results

matching_engine = MatchingEngine()
