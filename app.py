from fastapi import FastAPI, HTTPException, Header, Request, Depends
from pydantic import BaseModel, Field
from optimum.onnxruntime import ORTModelForCausalLM
from transformers import AutoTokenizer
import torch
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware
import os
from google import genai
from google.genai import types
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from dotenv import load_dotenv
import jwt
from jwt import PyJWKClient
import httpx

load_dotenv()

# Configure logging

logging.basicConfig(
    level=logging.INFO,
)
logger = logging.getLogger(__name__)


logging.getLogger("transformers").setLevel(logging.WARNING)
logging.getLogger("motor").setLevel(logging.WARNING)
logging.getLogger("pymongo").setLevel(logging.WARNING)

# Initialize FastAPI app

app = FastAPI(
    title="Nepali Disaster Response Chatbot",
    description="A GPT-2 based chatbot for disaster response in Nepali language",
    version="1.0.0"
)

# MongoDB Configuration

MONGO_URL = os.environ.get("MONGO")
if not MONGO_URL:
    logger.error("MONGO environment variable not set!")
mongo_client = AsyncIOMotorClient(MONGO_URL)
db = mongo_client["nepali_chatbot"]
chats_collection = db["chats"]
userchats_collection = db["userchats"]

# Clerk Configuration

CLERK_SECRET_KEY = os.environ.get("CLERK_SECRET_KEY")
CLERK_PUBLISHABLE_KEY = os.environ.get("CLERK_PUBLISHABLE_KEY")
CLERK_JWKS_URL = os.environ.get(
    "CLERK_JWKS_URL"
)

# CORS Middleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("CLIENT_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Schema

class MessagePart(BaseModel):
    text: str

class HistoryItem(BaseModel):
    role: str
    parts: List[MessagePart]
    img: Optional[str] = None

class Chat(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    userId: str
    history: List[HistoryItem] = []
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

    class Config:
        populate_by_name = True

class ChatSummary(BaseModel):
    id: str = Field(alias="_id")
    title: str
    createdAt: Optional[datetime] = None

    class Config:
        populate_by_name = True

class UserChats(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    userId: str
    chats: List[ChatSummary] = []
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

    class Config:
        populate_by_name = True

# Request/Response Models
class CreateChatRequest(BaseModel):
    text: str

class UpdateChatRequest(BaseModel):
    question: Optional[str] = None
    answer: str
    img: Optional[str] = None

class ChatRequest(BaseModel):
    prompt: str
    max_length: int = 300
    temperature: float = 0.7
    num_return_sequences: int = 1

class ChatResponse(BaseModel):
    response: str
    original_prompt: str

# Clerk Token Verification

async def verify_clerk_token(authorization: Optional[str] = Header(None)) -> str:
    """Verify Clerk JWT using public JWKS and return user ID."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    token = authorization.replace("Bearer ", "").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Invalid token format")

    try:
        jwks_client = PyJWKClient(CLERK_JWKS_URL)
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        decoded_token = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            leeway=300 
        )
        user_id = decoded_token.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token (no user ID)")
        logger.info(f"Authenticated user: {user_id}")
        return user_id

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        logger.error(f"Token verification failed: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


def correct_response(question: str, answer: str) -> str:
    try:
        client = genai.Client(api_key=os.environ.get("GEN_KEY"))
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"""Your job is to correct the output given by a trained gpt-2 model in Nepali.
            Reply only in Nepali. Ensure the text is coherent, natural, and relevant to disasters in Nepal.
            If irrelevant, respond: 'मसँग विपद्सँग सम्बन्धित सीमित जानकारी मात्र छ। अन्य प्रश्नहरूको लागि इन्टरनेट हेर्नुहोस्।'
            If the question is not in Nepali, respond: 'कृपया नेपाली भाषामा प्रश्न सोध्नुहोस्।'
            QUESTION: {question}
            ANSWER: {answer}""",
            config=types.GenerateContentConfig(temperature=0.6)
        )
        return response.text
    except Exception as e:
        logger.error(f"Error in correct_response: {str(e)}")
        return answer

# Global variables for model and tokenizer

model = None
tokenizer = None

@app.on_event("startup")
async def load_model():
    """Load the model and tokenizer on startup"""
    global model, tokenizer
    try:
        logger.info("Loading model and tokenizer...")

        # Load the ONNX model

        model = ORTModelForCausalLM.from_pretrained(
            "Neupane9Sujal/GPT2-chatbot-nepali-for-disaster",
            export=True
        )

        # Load the tokenizer

        tokenizer = AutoTokenizer.from_pretrained(
            "Neupane9Sujal/GPT2-chatbot-nepali-for-disaster"
        )
        await mongo_client.admin.command('ping')
        logger.info("Model, tokenizer and MongoDB loaded successfully!")
    except Exception as e:
        logger.error(f"Startup error: {str(e)}")

# API Routes

@app.get("/")
async def root():
    mongo_connected = False
    try:
        await mongo_client.admin.command('ping')
        mongo_connected = True
    except:
        pass

    return {
        "message": "Nepali Disaster Response Chatbot API",
        "status": "running",
        "model_loaded": model is not None,
        "mongo_connected": mongo_connected
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Generate response for the given prompt"""
    if model is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    try:
        # Tokenize input

        inputs = tokenizer(request.prompt, return_tensors="pt")
        
        # Generate response
        
        with torch.no_grad():
            outputs = model.generate(
                input_ids=inputs["input_ids"],
                attention_mask=inputs["attention_mask"],
                max_length=request.max_length,
                num_return_sequences=request.num_return_sequences,
                temperature=request.temperature,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )

        # Decode the output
        
        generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

         # Extract bot response (assuming the format includes '<bot>:')
         
        bot_response = (
            generated_text.split("<bot>:")[1].strip()
            if "<bot>:" in generated_text
            else generated_text[len(request.prompt):].strip()
        )
        corrected = correct_response(request.prompt, bot_response)
        return ChatResponse(response=corrected, original_prompt=request.prompt)

    except Exception as e:
        logger.error(f"Chat generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

# Endpoints for chat management

@app.post("/api/chats", status_code=201)
# Creating Chat
async def create_chat(request: CreateChatRequest, userId: str = Depends(verify_clerk_token)):
    try:
        new_chat = {
            "userId": userId,
            "history": [{"role": "user", "parts": [{"text": request.text}]}],
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        result = await chats_collection.insert_one(new_chat)
        chat_id = str(result.inserted_id)

        chat_summary = {
            "_id": chat_id,
            "title": request.text[:40],
            "createdAt": datetime.utcnow()
        }

        user_chats = await userchats_collection.find_one({"userId": userId})
        if not user_chats:
            await userchats_collection.insert_one({
                "userId": userId,
                "chats": [chat_summary],
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            })
        else:
            await userchats_collection.update_one(
                {"userId": userId},
                {"$push": {"chats": chat_summary}, "$set": {"updatedAt": datetime.utcnow()}}
            )

        return {"chatId": chat_id}

    except Exception as e:
        logger.error(f"Create chat error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/userchats")
async def get_user_chats(userId: str = Depends(verify_clerk_token)):
    try:
        user_chats = await userchats_collection.find_one({"userId": userId})
        return user_chats.get("chats", []) if user_chats else []
    except Exception as e:
        logger.error(f"Fetch userchats error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chats/{chat_id}")
async def get_chat(chat_id: str, userId: str = Depends(verify_clerk_token)):
    try:
        chat = await chats_collection.find_one({"_id": ObjectId(chat_id), "userId": userId})
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        chat["_id"] = str(chat["_id"])
        return chat
    except Exception as e:
        logger.error(f"Fetch chat error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/chats/{chat_id}")
# Updating chat
async def update_chat(chat_id: str, request: UpdateChatRequest, userId: str = Depends(verify_clerk_token)):
    try:
        new_items = []
        if request.question:
            user_msg = {"role": "user", "parts": [{"text": request.question}]}
            if request.img:
                user_msg["img"] = request.img
            new_items.append(user_msg)
        new_items.append({"role": "model", "parts": [{"text": request.answer}]})

        result = await chats_collection.update_one(
            {"_id": ObjectId(chat_id), "userId": userId},
            {"$push": {"history": {"$each": new_items}}, "$set": {"updatedAt": datetime.utcnow()}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Chat not found")
        return {"message": "Chat updated successfully"}
    except Exception as e:
        logger.error(f"Update chat error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/chats/{chat_id}", status_code=200)
# Deleteing chat
async def delete_chat(chat_id: str, userId: str = Depends(verify_clerk_token)):
    try:
        # Delete from chats collection
        result = await chats_collection.delete_one({"_id": ObjectId(chat_id), "userId": userId})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Chat not found")

        # Remove from user's chat summaries
        await userchats_collection.update_one(
            {"userId": userId},
            {"$pull": {"chats": {"_id": chat_id}}, "$set": {"updatedAt": datetime.utcnow()}}
        )

        return {"message": "Chat deleted successfully"}
    except Exception as e:
        logger.error(f"Delete chat error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/contacts")
async def get_contacts():
    """Fetch all emergency contacts from MongoDB"""
    try:
        contacts_cursor = db["emergency_contacts"].find()
        contacts = []
        async for contact in contacts_cursor:
            contact["_id"] = str(contact["_id"])  # Convert ObjectId → string
            contacts.append(contact)
        return contacts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
