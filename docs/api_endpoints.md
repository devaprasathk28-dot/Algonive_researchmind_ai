# 📡 API Directory Reference

This document catalogs the key FastAPI backend endpoints, including their request bodies, parameters, and response structures.

---

## 📂 1. Document Management & Processing

### `POST` `/upload-paper`
Uploads a raw PDF academic paper, performs layout analysis, extracts sections, and runs initial scoring.
*   **Content-Type**: `multipart/form-data`
*   **Payload**: `file: UploadFile` (Academic paper PDF)
*   **Response (`200 OK`)**:
    ```json
    {
      "filename": "paper.pdf",
      "message": "File successfully uploaded and analyzed",
      "title": "Attention Is All You Need",
      "abstract": "We propose a new simple network architecture...",
      "sections": {
        "introduction": "The dominant sequence transduction models...",
        "methodology": "The Transformer follows this overall architecture..."
      },
      "research_scores": {
        "novelty": 8.5,
        "clarity": 9.0,
        "technical_quality": 8.8,
        "reproducibility": 7.5,
        "overall_score": 8.45
      }
    }
    ```

### `GET` `/uploads-list`
Lists all uploaded and indexed papers.
*   **Response (`200 OK`)**:
    ```json
    {
      "uploads": ["attention_is_all_you_need.pdf", "resnet_cvpr.pdf"],
      "total_count": 2
    }
    ```

---

## 🧠 2. Academic Critique & Summarization

### `POST` `/summarize-paper`
Generates a structured multi-tier summary of a paper.
*   **Request Body**:
    ```json
    {
      "filename": "paper.pdf",
      "title": "Attention Is All You Need",
      "sections": {
        "abstract": "...",
        "introduction": "..."
      }
    }
    ```
*   **Response (`200 OK`)**:
    ```json
    {
      "tldr": "Introduces the Transformer model replacing recurrent layers with self-attention.",
      "beginner_summary": "This paper presents a new way for computers to understand sentences by looking at all words simultaneously...",
      "key_contributions": [
        "Self-attention mechanism",
        "Parallelized training capability",
        "State-of-the-art translation accuracy"
      ]
    }
    ```

### `POST` `/critique-paper`
Evaluates the technical merits, limitations, and reproducibility checklist.
*   **Request Body**: Similar to `/summarize-paper`
*   **Response (`200 OK`)**:
    ```json
    {
      "strengths": [
        { "point": "Highly parallelizable", "explanation": "Dispensing with recurrence allows parallel training" }
      ],
      "weaknesses": [
        { "point": "Memory scaling", "explanation": "Quadratic complexity with respect to sequence length" }
      ],
      "reproducibility": {
        "score": 8.0,
        "issues": ["Requires large GPUs for training"],
        "suggestions": ["Use pre-trained models or gradient checkpointing"]
      }
    }
    ```

---

## 🔍 3. Vector RAG & Interactive Chat

### `POST` `/initialize-rag`
Splits and indexes a paper's text chunks into the ChromaDB vector database.
*   **Request Body**:
    ```json
    {
      "text": "Full document text or sections concatenations..."
    }
    ```
*   **Response (`200 OK`)**:
    ```json
    {
      "message": "ChromaDB collection initialized",
      "chunks": 42
    }
    ```

### `POST` `/chat-with-paper`
Queries the vector database using semantic search and answers questions using relevant retrieved context.
*   **Request Body**:
    ```json
    {
      "query": "What baseline datasets were used for training?"
    }
    ```
*   **Response (`200 OK`)**:
    ```json
    {
      "query": "What baseline datasets were used for training?",
      "retrieved_chunks": [
        "We trained on the WMT 2014 English-to-German dataset containing 4.5 million sentence pairs..."
      ],
      "answer": "The model was evaluated on the WMT 2014 English-to-German and English-to-French translation datasets."
    }
    ```

---

## 📈 4. Graph Analytics & Predictions

### `POST` `/generate-knowledge-graph`
Extracts entities (frameworks, models, datasets) and relationships to build nodes and edges.
*   **Response (`200 OK`)**:
    ```json
    {
      "nodes": [
        { "id": "Transformer", "label": "Model", "mention_count": 12 },
        { "id": "WMT 2014", "label": "Dataset", "mention_count": 5 }
      ],
      "edges": [
        { "source": "Transformer", "target": "WMT 2014", "relation": "evaluated_on" }
      ],
      "total_nodes": 2,
      "total_edges": 1
    }
    ```

### `POST` `/predict-research-trends`
Forecasts growth topics, trend tiers, and research trajectories based on historic submissions.
*   **Response (`200 OK`)**:
    ```json
    {
      "detected_topics": ["Self-Attention", "Generative AI"],
      "topic_frequency": { "Self-Attention": 15 },
      "growth_predictions": {
        "Self-Attention": { "growth_score": 9.4, "growth_level": "Exponential" }
      },
      "future_forecasts": [
        "Expect optimization of self-attention scaling from quadratic to linear time complexity."
      ]
    }
    ```

---

## 💾 5. Export Formats

### `POST` `/export/reports`
Generates downloadable document reports summarizing paper analyses.
*   **Request Body**:
    ```json
    {
      "title": "Attention Is All You Need",
      "summary": "This paper presents...",
      "critique": "The critique reveals..."
    }
    ```
*   **Response (`200 OK`)**:
    ```json
    {
      "message": "Reports successfully exported",
      "reports": {
        "pdf": "/storage/exports/Attention_Is_All_You_Need.pdf",
        "docx": "/storage/exports/Attention_Is_All_You_Need.docx",
        "pptx": "/storage/exports/Attention_Is_All_You_Need.pptx"
      }
    }
    ```
