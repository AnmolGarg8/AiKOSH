import time

def get_mock_category(title, description):
    # Rule-based mock logic
    text = (title + " " + description).lower()
    
    if "shoe" in text or "sandal" in text or "sneaker" in text:
        return {
            "category": "Apparel > Men > Footwear > Sandals",
            "category_path": ["Apparel", "Men", "Footwear", "Sandals"],
            "attributes": {
                "material": "Leather",
                "gender": "Men",
                "usage": "Casual",
                "product_type": "Sandal"
            },
            "confidence": 0.92
        }
    elif "shirt" in text or "tshirt" in text or "t-shirt" in text or "apparel" in text:
        return {
            "category": "Apparel > Men > Topwear > T-Shirts",
            "category_path": ["Apparel", "Men", "Topwear", "T-Shirts"],
            "attributes": {
                "material": "Cotton",
                "gender": "Men",
                "usage": "Casual",
                "product_type": "T-Shirt"
            },
            "confidence": 0.88
        }
    elif "phone" in text or "smartphone" in text or "mobile" in text:
        return {
            "category": "Electronics > Mobiles > Smartphones",
            "category_path": ["Electronics", "Mobiles", "Smartphones"],
            "attributes": {
                "material": "Glass/Metal",
                "gender": "Unisex",
                "usage": "Communication",
                "product_type": "Smartphone"
            },
            "confidence": 0.95
        }
    else:
        return {
            "category": "Home > Furniture > Desks",
            "category_path": ["Home", "Furniture", "Desks"],
            "attributes": {
                "material": "Wood",
                "gender": "Unisex",
                "usage": "Office",
                "product_type": "Desk"
            },
            "confidence": 0.75
        }
