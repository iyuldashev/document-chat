import os
from llama_index.core import VectorStoreIndex, StorageContext, load_index_from_storage
from llama_index.vector_stores.milvus import MilvusVectorStore
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.openai import OpenAI
from llama_index.postprocessor.cohere_rerank import CohereRerank

def get_chat_engine():
    """
    Initializes the RAG engine.
    """
    print("🏗️  Booting up RAG Engine...")

    # 1. Check if Data Exists (Updated Logic)
    # We ONLY check for the 'storage_rag' folder.
    # We do NOT check for 'milvus_rag.db' because in Docker we use a URL.
    if not os.path.exists("./storage_rag"):
        print("⚠️  No 'storage_rag' folder found. Server starting in 'Empty Mode'.")
        print("👉  Please upload a document via the Frontend to initialize the brain.")
        return None

    # 2. Connect to Milvus (Dynamic)
    milvus_uri = os.getenv("MILVUS_URI", "./milvus_rag.db")
    print(f"🔌 Connecting to Milvus at: {milvus_uri}")

    vector_store = MilvusVectorStore(
        uri=milvus_uri, 
        dim=1536,
        overwrite=False,
        token=""
    )
    
    # 3. Load DocStore
    try:
        storage_context = StorageContext.from_defaults(
            vector_store=vector_store,
            persist_dir="./storage_rag"
        )
        index = load_index_from_storage(
            storage_context=storage_context,
            embed_model=OpenAIEmbedding(model="text-embedding-3-small"),
        )
    except Exception as e:
        print(f"❌ Error loading data from storage: {e}")
        return None

    # 4. Setup Reranker
    cohere_rerank = CohereRerank(
        api_key=os.getenv("COHERE_API_KEY"), 
        top_n=3
    )

    # 5. Build Engine
    # IMPROVED PROMPT: Summarization and synthesis
    query_engine = index.as_query_engine(
        similarity_top_k=10,
        node_postprocessors=[cohere_rerank],
        llm=OpenAI(model="gpt-4o-mini"),
        system_prompt=(
            "You are a professional AI document assistant. "
            "When answering, do not just copy-paste the text. "
            "Instead, synthesize the information into a concise, easy-to-read summary. "
            "Use bullet points for lists and bold text for key terms. "
            "Tone: Helpful, clear, and direct."
        )
    )
    
    print("✅ RAG Engine Loaded Successfully!")
    return query_engine