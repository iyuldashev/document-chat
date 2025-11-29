import os
import shutil
from llama_parse import LlamaParse
from llama_index.core.node_parser import SentenceSplitter # <--- CHANGED THIS
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core import VectorStoreIndex, StorageContext, load_index_from_storage
from llama_index.vector_stores.milvus import MilvusVectorStore

# Define paths
UPLOAD_DIR = "./data_uploads"
STORAGE_DIR = "./storage_rag"
DB_FILE = "./milvus_rag.db"

os.makedirs(UPLOAD_DIR, exist_ok=True)

async def process_document(file_content: bytes, filename: str):
    print(f"📥 Processing new file: {filename}...")
    
    # 1. CLEANUP: Delete old database
    if os.path.exists(DB_FILE):
        try:
            os.remove(DB_FILE)
            print("🗑️  Deleted old Vector DB")
        except:
            pass
    
    if os.path.exists(STORAGE_DIR):
        try:
            shutil.rmtree(STORAGE_DIR)
            print("🗑️  Deleted old DocStore")
        except:
            pass

    # 2. Save file locally
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(file_content)

    # 3. Parse (LlamaParse)
    # LlamaParse converts the PDF to beautiful Markdown.
    print("⏳ Parsing PDF (LlamaParse)...")
    parser = LlamaParse(result_type="markdown", verbose=True, language="en")
    documents = await parser.aload_data(file_path)

    # 4. Chunk (The Fix)
    # We switched to SentenceSplitter. It keeps the raw text/markdown as-is.
    print("✂️  Chunking data...")
    node_parser = SentenceSplitter(chunk_size=1024, chunk_overlap=200)
    nodes = node_parser.get_nodes_from_documents(documents)

    # 5. Create Fresh Database
    print("💾 Creating new Knowledge Base...")
    vector_store = MilvusVectorStore(
        uri=DB_FILE, 
        dim=1536, 
        overwrite=True
    )
    
    # 6. Index & Persist
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    index = VectorStoreIndex(
        nodes, 
        storage_context=storage_context,
        embed_model=OpenAIEmbedding(model="text-embedding-3-small")
    )
    index.storage_context.persist(persist_dir=STORAGE_DIR)

    print(f"🎉 Successfully ingested {filename}")