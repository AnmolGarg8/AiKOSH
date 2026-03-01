from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import categorize

app = FastAPI(title="AI Product Categorization API", description="API for MSME Product Categorization")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categorize.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Product Categorization API"}
