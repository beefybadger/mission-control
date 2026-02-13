from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import uvicorn
import os

app = FastAPI(title="Gap-Filler AI Brain")

# Business Knowledge Base
BUSINESS_INFO = {
    "name": "Elite Plumbing London",
    "services": ["Emergency repairs", "Leak detection", "Boiler servicing"],
    "pricing": "£80 call-out fee + £60/hr",
    "hours": "24/7 Emergency Service",
    "requirements": ["Address", "Phone Number"]
}

class Message(BaseModel):
    user_id: str
    text: str

@app.get("/", response_class=HTMLResponse)
def read_root():
    if os.path.exists("index.html"):
        with open("index.html", "r") as f:
            return f.read()
    return "<h1>AI Brain is Online</h1><p>index.html not found</p>"

@app.post("/chat")
def chat(message: Message):
    text = message.text.lower()
    
    # Simple keyword routing for POC
    if any(word in text for word in ["burst", "leak", "emergency", "flood", "help"]):
        response = f"This sounds like an emergency. I can dispatch an Elite plumber to you in London immediately. Our call-out fee is {BUSINESS_INFO['pricing']}. Can I have your address and a phone number to confirm the booking?"
    elif any(word in text for word in ["price", "cost", "how much"]):
        response = f"Our standard pricing is {BUSINESS_INFO['pricing']}. Would you like to schedule a visit?"
    else:
        response = f"Hello! I'm the AI receptionist for {BUSINESS_INFO['name']}. We specialize in {', '.join(BUSINESS_INFO['services'])}. How can I help you today?"
        
    return {
        "reply": response,
        "business": BUSINESS_INFO["name"],
        "intent_detected": "booking_inquiry" if "address" in response else "general_info"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
