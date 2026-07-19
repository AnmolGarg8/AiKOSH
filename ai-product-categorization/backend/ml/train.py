import os
import random
import pickle
import numpy as np
from sklearn.tree import DecisionTreeClassifier

# Define category mapping
CATEGORY_MAP = {
    "payment_delay": 0,
    "quality_dispute": 1,
    "contract_breach": 2
}

OUTCOME_MAP = {
    0: "settled_favorably",
    1: "settled_partially",
    2: "escalated"
}

def generate_synthetic_data(num_samples=400):
    X = []
    y = []
    
    # Categories list
    categories = ["payment_delay", "quality_dispute", "contract_breach"]
    
    for _ in range(num_samples):
        cat = random.choice(categories)
        cat_id = CATEGORY_MAP[cat]
        
        # dispute amount from 5000 to 2,000,000
        amount = random.uniform(5000, 2000000)
        
        # days pending from 5 to 180
        days = random.randint(5, 180)
        
        # documentation quality
        had_docs = random.choice([0, 1])
        
        # Score calculation
        score = 50
        
        if had_docs == 1:
            score += 30
        else:
            score -= 20
            
        if days > 90:
            score -= 20
        elif days < 30:
            score += 15
            
        if amount > 500000:
            score -= 15
        else:
            score += 10
            
        if cat == "payment_delay" and had_docs == 1:
            score += 15
        elif cat == "contract_breach":
            score -= 10
            
        # Outcome mapping
        if score >= 65:
            outcome = 0 # settled_favorably
        elif score >= 35:
            outcome = 1 # settled_partially
        else:
            outcome = 2 # escalated
            
        X.append([cat_id, amount, days, had_docs])
        y.append(outcome)
        
    return np.array(X), np.array(y)

def train_and_save():
    print("Generating synthetic dispute training data...")
    X, y = generate_synthetic_data(500)
    
    print("Training DecisionTreeClassifier model...")
    clf = DecisionTreeClassifier(max_depth=5, random_state=42)
    clf.fit(X, y)
    
    model_path = os.path.join(os.path.dirname(__file__), "dispute_model.pkl")
    print(f"Saving model to {model_path}...")
    with open(model_path, "wb") as f:
        pickle.dump(clf, f)
    print("Training complete.")

if __name__ == "__main__":
    train_and_save()
