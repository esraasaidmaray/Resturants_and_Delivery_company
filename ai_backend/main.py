import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

# Load environment variables from .env or .env.local
load_dotenv()
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env.local"))

try:
    from recommender import recommend_restaurants
    from chat_agent import generate_chat_response
except ImportError:
    from ai_backend.recommender import recommend_restaurants
    from ai_backend.chat_agent import generate_chat_response

app = FastAPI(
    title="Thawq Saudi Restaurants AI Backend 🇸🇦",
    description="Python FastAPI backend powering restaurant recommendations and Gemini AI Chat",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PreferencesRequest(BaseModel):
    cityId: Optional[str] = ""
    cuisines: Optional[List[str]] = []
    allergies: Optional[List[str]] = []
    diet: Optional[str] = "none"
    favorites: Optional[List[str]] = []
    freeText: Optional[str] = ""
    craving: Optional[str] = ""
    budget: Optional[str] = "any"
    occasion: Optional[str] = "any"

class ChatRequest(BaseModel):
    messages: List[Dict[str, Any]]
    recommendations: Optional[List[Dict[str, Any]]] = []

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Thawq Saudi Restaurants Python AI Backend 🐍",
        "version": "1.0.0"
    }

@app.post("/api/recommend")
def recommend_endpoint(prefs: PreferencesRequest):
    try:
        results = recommend_restaurants(prefs.dict())
        return {
            "success": True,
            "count": len(results),
            "recommendations": results,
            "engine": "Python Pandas & Scoring Engine 🐍"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
def chat_endpoint(req: ChatRequest):
    try:
        reply = generate_chat_response(req.messages, req.recommendations or [])
        return {
            "success": True,
            "reply": reply,
            "engine": "Python Gemini AI Agent 🤖🐍"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
