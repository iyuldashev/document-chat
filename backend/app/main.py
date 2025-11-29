from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from app.engine import get_chat_engine
from app.ingestion import process_document
import gc # <--- NEW IMPORT

load_dotenv()

# ... (Keep Data Models classes as is) ...
class ChatRequest(BaseModel):
    message: str

class SourceNode(BaseModel):
    score: float
    text: str

class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceNode]

# Global state
rag_engine = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global rag_engine
    rag_engine = get_chat_engine()
    yield
    rag_engine = None

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "running", "engine_loaded": rag_engine is not None}

@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    if not rag_engine:
        raise HTTPException(status_code=503, detail="RAG Engine is warming up. Please wait.")
    try:
        response = rag_engine.query(request.message)
        sources = [
            SourceNode(score=node.score, text=node.node.get_content()[:200] + "...")
            for node in response.source_nodes
        ]
        return ChatResponse(answer=str(response), sources=sources)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- THE FIXED BACKGROUND TASK ---
async def run_ingestion_and_reload(content: bytes, filename: str):
    global rag_engine
    
    print(f"🛑 Unloading Engine to release DB lock...")
    
    # 1. Kill the engine connection
    rag_engine = None 
    
    # 2. Force Python to clean up memory (closes the file handle)
    gc.collect() 
    
    print(f"🔄 Starting background ingestion for {filename}...")
    
    try:
        # 3. Run Ingestion (Now safe because DB is closed)
        await process_document(content, filename)
        
        # 4. Reload the Brain
        print("🧠 Reloading RAG Engine in memory...")
        rag_engine = get_chat_engine()
        print("✅ RAG Engine successfully reloaded!")
        
    except Exception as e:
        print(f"❌ Ingestion Failed: {e}")
        # Try to bring engine back even if ingestion failed
        rag_engine = get_chat_engine()

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...), 
    background_tasks: BackgroundTasks = None
):
    try:
        content = await file.read()
        background_tasks.add_task(run_ingestion_and_reload, content, file.filename)
        return {"message": "Processing started..."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))