import time
from mock.mock_responses import get_mock_category

class MockClassifier:
    def predict(self, title: str, description: str, language: str):
        # Simulate network and processing delay
        start_time = time.time()
        time.sleep(0.8)  # mock processing time
        
        result = get_mock_category(title, description)
        
        end_time = time.time()
        processing_time_ms = int((end_time - start_time) * 1000)
        
        return {
            "status": "success",
            "category": result["category"],
            "category_path": result["category_path"],
            "attributes": result["attributes"],
            "confidence": result["confidence"],
            "processing_time_ms": processing_time_ms
        }

# Singleton instance
classifier_service = MockClassifier()
