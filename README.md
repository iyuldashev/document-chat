# 📄 DocChat - Enterprise-Grade RAG Application

DocChat is a full-stack AI application that allows users to upload complex PDF documents (financial reports, technical manuals, etc.) and chat with them in real-time. 

Unlike basic PDF chat apps, DocChat uses a **Two-Stage Retrieval Pipeline (Hybrid Search + Reranking)** and **Vision-Aware Parsing** to handle complex tables and layouts accurately.

![Project Status](https://img.shields.io/badge/Status-Production-success)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue)
![Python](https://img.shields.io/badge/Backend-FastAPI-009688)
![React](https://img.shields.io/badge/Frontend-React-61DAFB)

## 🏗️ Architecture

The system is designed as a decoupled microservices architecture:

* **Frontend:** React + Vite + Tailwind (Deployed on **Vercel**).
* **Backend:** FastAPI (Python) running in a Docker container (Deployed on **Google Cloud Run**).
* **Database:** Milvus Vector Database (Managed **Zilliz Cloud**).
* **Orchestration:** LlamaIndex.

### The RAG Pipeline
1.  **Ingestion:** PDFs are parsed using **LlamaParse** (Vision-Language Model) to preserve table structures.
2.  **Chunking:** Content is split using a sliding window strategy (1024 tokens) to maintain context.
3.  **Embedding:** Text is converted to vectors using `text-embedding-3-small`.
4.  **Retrieval:** Top-k semantic matches are fetched from Milvus.
5.  **Reranking:** **Cohere Rerank** re-scores the retrieved chunks to filter out noise.
6.  **Synthesis:** LLM models generates the final answer with **collapsible source citations**.
