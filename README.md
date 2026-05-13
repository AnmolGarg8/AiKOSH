# AiKOSH: Voice-to-Inventory for Small Businesses

<p align="center">
  <img src="assets/banner.png" alt="AiKOSH Banner" width="100%">
</p>

Managing inventory is one of the most time-consuming parts of running a small business. **AiKOSH** simplifies this by letting you onboard products using just your voice. 

Instead of typing out descriptions, categories, and prices, you can just describe the product out loud. The system extracts the relevant details and maps them to your catalog automatically.

---

### 🚀 What it does

*   **Voice Extraction**: Takes raw audio, transcribes it, and pulls out product attributes (name, price, description).
*   **Auto-Categorization**: Uses a classification layer to decide where the product fits in your existing catalog.
*   **Real-time Feedback**: You can see the transcript as you speak, ensuring the AI captured everything correctly.
*   **Form Integration**: Pushes the extracted data directly into your onboarding forms.

### 🛠 The Tech Stack

I chose these technologies to keep the system fast and the developer experience smooth:

*   **Frontend**: Built with **React** and **Vite** for a snappy, responsive UI.
*   **Backend**: Powered by **FastAPI** (Python), chosen for its speed and native support for asynchronous tasks.
*   **State Management**: Simple and effective data handling to ensure the voice-to-form flow is seamless.

---

### 📂 How it's organized

The repository is split into two main parts:

*   **/backend**: The Python core. This is where the voice processing logic and the categorization models live.
*   **/frontend**: The React application. Handles the audio recording, real-time transcription display, and the final form-filling UI.

---

### 🏁 Getting Started

If you want to run this locally, follow these steps:

#### Backend Setup
1. Move into the backend folder: `cd ai-product-categorization/backend`
2. Create a virtual environment: `python -m venv venv`
3. Activate it: `source venv/bin/activate` (or `.\venv\Scripts\activate` on Windows)
4. Install dependencies: `pip install -r requirements.txt`
5. Fire up the server: `uvicorn main:app --reload`

#### Frontend Setup
1. Move into the frontend folder: `cd ../frontend`
2. Install the packages: `npm install`
3. Start the dev server: `npm run dev`

Open your browser to the local URL (usually `localhost:5173`) and you're good to go.

---

### 🛤 Roadmap
* [ ] Integration with more robust LLM providers for better extraction accuracy.
* [ ] Mobile-first UI refinements for on-the-go inventory management.
* [ ] Support for multi-lingual product descriptions.

---

Built by [Anmol Garg](https://github.com/AnmolGarg8)
