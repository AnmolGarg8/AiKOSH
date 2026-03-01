# AI Product Categorization

A professional web application for an AI Product Categorization System designed for small business onboarding.

## Project Structure

```
ai-product-categorization/
├── backend/
│   ├── main.py
│   ├── requirements.txt
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── components/
│           ├── LandingPage.jsx
│           ├── ProductInputPage.jsx
│           ├── ResultPage.jsx
```

## Running the Project Locally

### 1. Start the Backend API

Requirements: Python 3.8+

Open a terminal and navigate to the backend directory:
```bash
cd backend
```

Install the dependencies:
```bash
pip install -r requirements.txt
```

Run the FastAPI server:
```bash
uvicorn main:app --reload
```
The backend API will start on `http://localhost:8000`. It features a mock endpoint `/categorize` that simulates AI processing.

### 2. Start the Frontend Web App

Requirements: Node.js (v14+)

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install the dependencies:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```
The frontend will typically start on `http://localhost:5173`. Open this URL in your browser to view the application.

## Plugging in a Real ML Model

Currently, the backend contains a mock response to simulate processing. 

To connect an actual ML model, simply modify `backend/main.py` in the `categorize_product` endpoint. You can integrate any Python library (like `transformers`, `scikit-learn`, `openai` SDK) and call your text classification code within this route before returning the expected response format.
