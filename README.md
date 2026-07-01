# 📄 DocMind - Enterprise-Grade RAG Application

DocMind is a full-stack RAG (Retrieval-Augmented Generation) application that allows users to upload complex PDF documents (financial reports, technical manuals, etc.) and chat with them in real-time.

Unlike basic PDF chat apps, DocMind uses a **Two-Stage Retrieval Pipeline (Hybrid Search + Reranking)** and **Vision-Aware Parsing** to handle complex tables and layouts accurately.

![Project Status](https://img.shields.io/badge/Status-Production-success)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue)
![Backend](https://img.shields.io/badge/Backend-FastAPI-009688)
![Frontend](https://img.shields.io/badge/Frontend-React-61DAFB)
![AWS](https://img.shields.io/badge/Deployment-AWS_EC2-FF9900)

---

## 🏗️ Architecture

The system is designed as a decoupled microservices architecture:

* **Frontend:** React + Vite + Tailwind CSS (Deployed on **Vercel**).
* **Backend:** FastAPI (Python) running in a Docker container (Deployed on **AWS EC2**).
* **Database:** Milvus Standalone Vector Database + MinIO + Etcd (Self-hosted via Docker Compose on **AWS EC2** with local persistence volumes).
* **Orchestration:** LlamaIndex.
* **SSL & Reverse Proxy:** **Caddy** handles automatic Let's Encrypt SSL certificates and forwards traffic to the backend container.

---

### The RAG Pipeline
1. **Ingestion:** PDFs are parsed using **LlamaParse** (Vision-Language Model) to preserve table structures.
2. **Chunking:** Content is split using a sliding window strategy (1024 tokens) to maintain context.
3. **Embedding:** Text is converted to vectors using `text-embedding-3-small`.
4. **Retrieval:** Top-k semantic matches are fetched from Milvus.
5. **Reranking:** **Cohere Rerank** re-scores the retrieved chunks to filter out noise.
6. **Synthesis:** LLM models generate the final answer with **collapsible source citations**.
