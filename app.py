from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from optimum.onnxruntime import ORTModelForCausalLM
from transformers import AutoTokenizer
import torch
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware
import os
from google import genai
from google.genai import types
# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Nepali Disaster Response Chatbot",
    description="A GPT-2 based chatbot for disaster response in Nepali language",
    version="1.0.0"
)
mongo_client = AsyncIOMotorClient(os.environ.get("MONGO"))
db = mongo_client["nepali_chatbot"]
chats_collection = db["chats"]
userchats_collection = db["userchats"]

# Setting up CORS for cross-browser request handling
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("CLIENT_URL", "http://localhost:5173")],
    allow_credentials=True,
     allow_methods=["*"],   # <-- add this
    allow_headers=["*"],  
)
def correct_response(question:str,answer:str) -> str:
    client = genai.Client(api_key='AIzaSyBNc_Yzs5uWlYtoXu_YK2QZtGAXQ5rUI1E')

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"Your job is to correct the output given by a trained gpt-2 model in Nepali.Your job is to reply in Nepali language only. Don't mix up with English or other language. This chatbot is not properly trained. So it gives sequence that does not make sense. Your job is to correct the output given by this model so that it is coherant and it makes sense.Make sure that you do not add unnecessary information that is not in the response. If the answer is not relevant to disaster related to Nepal, simply say ''मसँग विपद्सँग सम्बन्धित सीमित जानकारी मात्र छ। अन्य प्रश्नहरूको लागि इन्टरनेट हेर्नुहोस्।'.If the question is in English or any other language, just reply 'कृपया नेपाली भाषामा प्रश्न सोध्नुहोस्।'. Here is the question by the user and the answwer by the model: QUESTION{question}  ANSWER:{answer}",
        config=types.GenerateContentConfig(
            temperature=0.6
        )
    )
    return response.text

# Global variables for model and tokenizer
model = None
tokenizer = None

class ChatRequest(BaseModel):
    prompt: str
    max_length: int = 300
    temperature: float = 0.7
    num_return_sequences: int = 1

class ChatResponse(BaseModel):
    response: str
    original_prompt: str

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
        
        logger.info("Model and tokenizer loaded successfully!")
        
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        raise e

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Nepali Disaster Response Chatbot API",
        "status": "running",
        "model_loaded": model is not None and tokenizer is not None
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Generate response for the given prompt"""
    
    if model is None or tokenizer is None:
        raise HTTPException(
            status_code=503, 
            detail="Model not loaded. Please wait for the service to initialize."
        )
    
    try:
        # Validate input
        if not request.prompt.strip():
            raise HTTPException(status_code=400, detail="Prompt cannot be empty")
        
        if request.max_length < 10 or request.max_length > 1000:
            raise HTTPException(
                status_code=400, 
                detail="max_length must be between 10 and 1000"
            )
        
        if request.temperature < 0.1 or request.temperature > 2.0:
            raise HTTPException(
                status_code=400, 
                detail="temperature must be between 0.1 and 2.0"
            )
        
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
        if '<bot>:' in generated_text:
            bot_response = generated_text.split('<bot>:')[1].strip()
        else:
            # If no '<bot>:' found, return the generated text after the prompt
            bot_response = generated_text[len(request.prompt):].strip()
        
        return ChatResponse(
            response=correct_response(request.prompt,bot_response),
            original_prompt=request.prompt
        )
        
    except Exception as e:
        logger.error(f"Error generating response: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)