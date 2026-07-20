from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import forms, voice, categorize, auth, matching, disputes, ayush

app = FastAPI(title="AI Voice Form Auto-Fill System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(matching.router)
app.include_router(disputes.router)
app.include_router(ayush.router)
app.include_router(forms.router)
app.include_router(voice.router)
app.include_router(categorize.router)

@app.get("/")
def read_root():
    return {"message": "Voice Form Auto-Fill API is running"}
