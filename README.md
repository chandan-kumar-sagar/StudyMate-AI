# StudyMate AI

## What is StudyMate AI?
StudyMate AI is a full-stack, multimodal Ed-Tech chatbot built for students. It allows users to ask questions using text, analyze images (like math problems), and search through uploaded educational documents (PDFs and Text files) using Retrieval-Augmented Generation (RAG). It also features an optional web search tool for answering questions requiring current information.

## Features
* **Text Chatbot**: Interactive conversational interface.
* **Image Understanding**: Upload images and ask questions about them using Vision models.
* **RAG (Retrieval-Augmented Generation)**: Upload PDFs/TXTs to create a searchable knowledge base.
* **Vector Database**: Uses ChromaDB for fast similarity search.
* **Source Citations**: Answers generated using RAG include the exact source document.
* **Optional Web Search**: The AI can perform web searches for current information.

## Architecture

```text
React (Vite)
     │
     │ REST API
     ▼
Express Server (Node.js)
     │
     ├──── AI Service ─────────► Groq (Llama 3 Text & Vision)
     │
     ├──── RAG Service ────────► ChromaDB
     │
     ├──── Document Service ───► Extractor & Chunker
     │
     └──── Web Search Tool ────► DuckDuckGo
```

## RAG Flow
1. **Upload Document** → Text is extracted → Split into chunks (with overlap) → Embeddings generated locally (Xenova/transformers) → Stored in ChromaDB.
2. **Question** → User asks a question → Query is embedded → Cosine similarity search in ChromaDB → Top chunks retrieved → Provided to Groq LLM as context → Final answer with sources.

## Installation

### Prerequisites
- Node.js (v18+)
- A Groq API Key (Free)

### 1. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
npm run dev # (or node server.js)
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```

## Environment Variables (.env)
- `PORT`: Server port (default 5000)
- `GROQ_API_KEY`: Your Groq API key for text/vision models
- `CHROMA_URL`: ChromaDB instance URL (default `http://localhost:8000`)
- `CORS_ORIGIN`: Allowed frontend origin
- `RAG_TOP_K`: Number of chunks to retrieve for RAG
- `MAX_FILE_SIZE`: Max upload size in bytes

## Running Locally
Make sure both the frontend and backend servers are running. Access the frontend at `http://localhost:5173`. If you want to persist the ChromaDB database, you may want to run it via Docker: `docker run -p 8000:8000 chromadb/chroma`.

## Example Questions
* **Text**: "Explain Newton's laws in simple terms."
* **Image**: Upload a math equation image and ask "Solve this step by step."
* **RAG**: Upload `Biology Notes.pdf` and ask "According to the uploaded document, explain photosynthesis."
* **Tool Calling**: "Search the web for the latest information about quantum computing."

## How I would explain this project (Interview Talking Points)
1. **Why RAG?** RAG prevents hallucinations by grounding the LLM's answers in verified educational documents.
2. **Why ChromaDB?** It's an efficient, developer-friendly vector database ideal for semantic search.
3. **Why chunking?** LLMs have context limits. Chunking breaks large documents into digestible pieces, and overlap prevents cutting context mid-sentence.
4. **How similarity search works?** User queries are converted into high-dimensional vectors (embeddings). Cosine similarity measures the angle between the query vector and chunk vectors to find the most relevant meaning.
5. **How image processing works?** Images are base64-encoded and sent to a vision-capable model (Llama-3-vision) along with the prompt.
6. **How tool calling works?** The system checks intent (or uses function calling) to execute a web search, injects the results into the context window, and asks the LLM to synthesize the final answer.
7. **Why API keys are backend-only?** To prevent malicious users from stealing our quotas and incurring costs.
