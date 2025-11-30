import os
import shutil
from llama_parse import LlamaParse
from llama_index.core.node_parser import SentenceSplitter 
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core import VectorStoreIndex, StorageContext, load_index_from_storage
from llama_index.vector_stores.milvus import MilvusVectorStore

# Define paths
UPLOAD_DIR = "./data_uploads"
STORAGE_DIR = "./storage_rag"
# Default local fallback (will be overridden by Docker env var)
DEFAULT_DB_FILE = "./milvus_rag.db"

os.makedirs(UPLOAD_DIR, exist_ok=True)

async def process_document(file_content: bytes, filename: str):
    print(f"📥 Processing new file: {filename}...")
    
    # 1. CLEANUP: Delete old local database if it exists
    # This ensures we don't have mixed data when running locally
    if os.path.exists(DEFAULT_DB_FILE):
        try:
            os.remove(DEFAULT_DB_FILE)
            print("🗑️  Deleted old local Vector DB file")
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
    print("⏳ Parsing PDF (LlamaParse)...")
    parser = LlamaParse(result_type="markdown", verbose=True, language="en")
    documents = await parser.aload_data(file_path)

    # 4. Chunk
    print("✂️  Chunking data...")
    node_parser = SentenceSplitter(chunk_size=1024, chunk_overlap=200)
    nodes = node_parser.get_nodes_from_documents(documents)

    # 5. Create Fresh Database (Dynamic Connection)
    # Check if we are running in Docker (HTTP) or Local (File)
    milvus_uri = os.getenv("MILVUS_URI", DEFAULT_DB_FILE)
    
    print(f"💾 Updating Knowledge Base at {milvus_uri}...")
    
    vector_store = MilvusVectorStore(
        uri=milvus_uri, 
        dim=1536, 
        overwrite=True, # This drops the collection on the server side automatically
        token="" # Token is only needed for cloud/server instances, ignored locally
    )
    
    # 6. Index & Persist
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    index = VectorStoreIndex(
        nodes, 
        storage_context=storage_context,
        embed_model=OpenAIEmbedding(model="text-embedding-3-small")
    )
    
    # We still persist the DocStore (summaries/mappings) to disk
    # The Vectors go to Milvus, the Metadata goes here.
    index.storage_context.persist(persist_dir=STORAGE_DIR)

    print(f"🎉 Successfully ingested {filename}")