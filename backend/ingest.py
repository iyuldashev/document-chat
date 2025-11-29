# ingest.py
import os
import asyncio
from dotenv import load_dotenv
from llama_parse import LlamaParse
from llama_index.core.node_parser import MarkdownElementNodeParser
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core import VectorStoreIndex, StorageContext
from llama_index.vector_stores.milvus import MilvusVectorStore

load_dotenv() 

async def main():
    if not os.getenv("LLAMA_CLOUD_API_KEY"):
        print("❌ Error: Keys missing.")
        return

    # 1. Parse
    print("🚀 1. Parsing Document...")
    parser = LlamaParse(
        result_type="markdown", 
        verbose=True, 
        language="en"
    )
    documents = await parser.aload_data("./NVIDIA-2024.pdf") 

    # 2. Chunk
    print("✂️  2. Chunking Data...")
    node_parser = MarkdownElementNodeParser(
        llm=OpenAI(model="gpt-4o-mini"), 
        num_workers=4
    )
    nodes = node_parser.get_nodes_from_documents(documents)
    print(f"   Generated {len(nodes)} chunks.")

    # 3. Setup Storage (Milvus + Local File)
    print("💾 3. Saving to Milvus + Local DocStore...")
    
    vector_store = MilvusVectorStore(
        uri="./milvus_rag.db", 
        dim=1536, 
        overwrite=True
    )
    
    storage_context = StorageContext.from_defaults(vector_store=vector_store)

    # 4. Index & Persist
    index = VectorStoreIndex(
        nodes, 
        storage_context=storage_context,
        embed_model=OpenAIEmbedding(model="text-embedding-3-small")
    )
    
    # CRITICAL: Save the "Filing Cabinet" to disk
    index.storage_context.persist(persist_dir="./storage_rag")
    
    print("✅ Success! Data saved to './milvus_rag.db' AND './storage_rag/'")

if __name__ == "__main__":
    asyncio.run(main())