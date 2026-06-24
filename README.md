# 🔬 ResearchMind AI — Autonomous Scientific Discovery & Intellect Engine

[![Python Version](https://img.shields.io/badge/python-3.9%20%7C%203.10%20%7C%203.11-blue.svg)](https://www.python.org/)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2018.0.0-green.svg)](https://nodejs.org/)
[![Framework](https://img.shields.io/badge/Next.js-15.2-black.svg)](https://nextjs.org/)
[![API](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](LICENSE)

**ResearchMind AI** is a next-generation, agentic scientific research intelligence platform designed to accelerate scientific discovery. It enables researchers, academicians, and innovators to analyze, compare, dissect, and synthesize scientific knowledge from research documents.

The system combines advanced PDF processing, multimodal document analysis, semantic RAG (Retrieval-Augmented Generation), research critique networks, entity-relation knowledge graphs, automated literature review generators, and an autonomous model training & search loop into a unified developer dashboard.

---

## 📌 Table of Contents

- [💡 Overview](#-overview)
- [🗺️ System Architecture](#️-system-architecture)
- [🤖 Autonomous Scientific Discovery Loop](#-autonomous-scientific-discovery-loop)
- [🚀 Key Features](#-key-features)
- [🛠️ Technology Stack](#️-technology-stack)
- [📁 Repository Structure](#-repository-structure)
- [📡 Configuration & Environment Variables](#-configuration--environment-variables)
- [🏁 Getting Started Locally](#-getting-started-locally)
- [🐳 Running with Docker](#-running-with-docker)
- [📚 Core Capabilities Matrix](#-core-capabilities-matrix)
- [🔮 Future Scope](#-future-scope)
- [👨‍💻 Developer & Contact](#-developer--contact)

---

## 💡 Overview

ResearchMind AI is built to transform static research papers (PDFs) into dynamic, actionable intelligence. It automatically reads mathematical formulas, text sections, tables, and references to build a structured vector and graph memory. 

Using this memory, the system powers an AI Research Copilot capable of doing side-by-side comparative analysis, generating comprehensive draft literature reviews, highlighting research gaps, and calculating scientific novelty/reproducibility scores.

> [!TIP]
> **Why ResearchMind AI?**
> *   **Reduce Reading Time**: Synthesizes complex papers into TL;DRs and executive summaries in seconds.
> *   **Uncover Hidden Links**: Builds a topological knowledge graph showing entities (models, metrics, datasets) and their relationships.
> *   **Evaluate Quality**: Grades literature on mathematical rigor, experimental design, and reproducibility.

---

## 🗺️ System Architecture

The following diagram illustrates the data flow and system interactions between the Next.js frontend dashboard, the FastAPI gateway router, the specialized cognitive multi-agent system, the RAG vector memory layer, and the autonomous scientific discovery pipelines.

```mermaid
graph TD
    %% Frontend Layer
    subgraph Frontend [Next.js Web Dashboard]
        UI[Interactive UI Pages]
        KG[Knowledge Graph View]
        Charts[Recharts Analytics]
        Voice[Speech & Voice Interface]
    end

    %% API Gateway Layer
    subgraph Gateway [FastAPI Backend]
        API[FastAPI Router Gateway]
        CORS[CORS Middleware]
        Parser[Smart PDF Parser / OCR]
    end

    %% Cognitive & Agent Layers
    subgraph Cognitive [Cognitive & Multi-Agent Network]
        Orch[Master Orchestrator]
        SharedBus[Shared Memory Communication Bus]
        AgentReviewer[Reviewer Agent]
        AgentCritic[Critic Agent]
        AgentVision[Vision OCR Agent]
        AgentRAG[RAG Agent]
    end

    %% Storage & Indexing
    subgraph Storage [RAG & Vector Memory]
        Chroma[ChromaDB Vector Store]
        Embed[Sentence-Transformers Embeddings]
        Cache[Local File Cache / Uploads]
    end

    %% Discovery Engine
    subgraph Discovery [Autonomous Scientific Discovery Lab]
        AGIDirector[AGI Scientific Director]
        Hypothesis[Hypothesis Generation Engine]
        ExpDesign[Experiment Design Engine]
        NAS[Neural Architecture Search Engine]
        AutoTrain[Training Automation Loop]
        DeployEng[Deployment & Scaling Engine]
        SelfLearn[Self-Learning & Feedback Core]
        MetaReason[Meta-Reasoning & Reflection Engine]
        WorldModel[Scientific World Model]
    end

    %% Connections
    UI -->|HTTP Requests| API
    Voice <-->|Web Speech API & pyttsx3| API
    API --> Parser
    Parser -->|Saves PDF & Images| Cache
    API --> Orch
    Orch -->|Routes Tasks| SharedBus
    SharedBus <--> AgentReviewer
    SharedBus <--> AgentCritic
    SharedBus <--> AgentVision
    SharedBus <--> AgentRAG
    AgentRAG <--> Chroma
    Chroma <--> Embed
    
    API --> AGIDirector
    AGIDirector --> Hypothesis
    Hypothesis --> ExpDesign
    ExpDesign --> NAS
    NAS --> AutoTrain
    AutoTrain --> DeployEng
    DeployEng --> SelfLearn
    SelfLearn --> MetaReason
    MetaReason --> WorldModel
    WorldModel -->|Synthesizes Predictions| AGIDirector
    
    UI -->|Query/Update Graph| KG
    UI -->|Visualize Performance| Charts
```

### Modular Interaction Flow
```
Frontend Dashboard ──► FastAPI Backend ──► AI Agent Cluster ──► RAG & Chroma DB ──► Semantic Knowledge Graph ──► Discovery & Recommendation Feed
```

---

## 🤖 Autonomous Scientific Discovery Loop

ResearchMind AI incorporates an advanced, self-improving AGI discovery lab consisting of nine integrated cognitive sub-engines:

| Sub-Engine | Core Responsibility | Key Functionalities |
| :--- | :--- | :--- |
| **🧠 AGI Scientific Director** | High-level goal planning & task routing | Manages objectives, delegates subtasks, aggregates results |
| **💡 Hypothesis Generator** | Scientific hypothesis synthesis | Mines vector memory for research gaps and generates testable theories |
| **📐 Experiment Designer** | Methodology formalization | Outlines pipelines, algorithm parameters, and datasets |
| **🖥️ NAS Engine** | Neural Architecture Search | Generates optimal Deep Learning models for validation |
| **🔁 Auto-Training Loop** | Model training orchestration | Manages compute execution, metrics collection, and checkpoints |
| **🚀 Deployment Engine** | Deployment and route preparation | Packages models into production microservices, tests scaling |
| **🔄 Self-Learning Core** | Closed-loop feedback gathering | Analyzes evaluation logs and tunes model hyper-parameters |
| **🪞 Meta-Reasoning Engine** | Failure analysis & self-reflection | Audits agent logs, resolves reasoning bottlenecks and logical loops |
| **🌍 Scientific World Model** | Long-term outcome simulation | Builds state transitions to guide the system's long-term directions |

---

## 🚀 Key Features

### 📄 Intelligent Document Processing & OCR
*   **PDF Upload Gateway**: Upload academic papers securely.
*   **Smart PDF Parser**: Extracts metadata, authors, DOI, references, and indexes sections using `pdfplumber` and `PyMuPDF`.
*   **OCR Text & Math Extractor**: Multi-column parsing and image text extraction.
*   **Figure & Table Isolator**: Captures diagrams, charts, and tables for subsequent visual LLM analysis.

### 🧠 Advanced RAG & Semantic Copilot
*   **Multi-Paper RAG Chat**: Chat with a single paper or across your entire library simultaneously.
*   **Citation-Backed Answers**: Every answer references exact headings, authors, and page numbers.
*   **Vector Cache**: ChromaDB vector store maps semantic embeddings without keyword dependency.

### ⭐ Automated Reviewer & Critic
*   **Strengths & Weaknesses**: Audits papers for structural flow, contribution size, and logic gaps.
*   **Reproducibility Checklist**: Generates a guide with mathematical steps and hyperparameters to replicate results.
*   **Rigorous Scoring Matrix**: Grades papers on **Novelty**, **Innovation**, **Technical Quality**, **Clarity**, **Dataset Adequacy**, and **Reproducibility** to form a consolidated **Research Health Score**.

### 🕸️ Knowledge Graph & Literature Review
*   **Entity Extraction**: Identifies key models, datasets, tasks, frameworks, metrics, and authors.
*   **Semantic Relationship Mapping**: Establishes links like `USES`, `IMPROVES`, `OUTPERFORMS`, `EVALUATED_ON`, and `CITES` to visualize concepts.
*   **Auto Literature Review**: Drafts publication-ready literature reviews including Related Work, Comparative Matrix, and Gaps.

### 📤 Multi-Format Export Center
*   Export summarized reports, review drafts, and score analysis directly to **PDF**, Microsoft **Word (DOCX)**, or Microsoft **PowerPoint (PPT)** slides.

---

## 🛠️ Technology Stack

| Layer | Tools & Technologies |
| :--- | :--- |
| **Frontend UI** | Next.js 15.2 (App Router), React 19, TypeScript, Tailwind CSS v4, Vanilla CSS |
| **Visualizations** | Recharts (charts & metrics), D3.js (interactive Knowledge Graph nodes) |
| **Backend Web** | FastAPI (Python 3.9+), Uvicorn, SlowAPI (rate-limiting), Pydantic |
| **Database / ORM** | PostgreSQL / SQLite, SQLAlchemy ORM |
| **AI / NLP Models** | Hugging Face Transformers, Sentence-Transformers (`all-MiniLM-L6-v2`), PyTorch, SciSpaCy |
| **OCR & Parsing** | OpenCV, EasyOCR, PyMuPDF (`fitz`), pdfplumber, pdfminer.six |
| **Graph & Vector Memory** | ChromaDB (vector indexing), NetworkX (graph topology & centrality metrics) |
| **Caching & Telemetry** | Redis (caching and traffic telemetry) |

---

## 📁 Repository Structure

```
researchmind-ai/
├── backend/                   # FastAPI gateway & AI services core
│   ├── app/                   # Application directory
│   │   ├── agents/            # Base agent classes & message bus
│   │   ├── agi_director/      # AGI planning & orchestration loop
│   │   ├── agi_reasoning/     # Logic fusion & multimodal reasoning
│   │   ├── ai/                # Summarizers, critics, and scoring
│   │   ├── api/routes/        # REST endpoint routers (upload, chat, nas, etc.)
│   │   ├── core/              # Global settings, CORS, and rate limiters
│   │   ├── database/          # SQLite models, sessions, and connections
│   │   ├── memory/            # Semantic RAG collections & episodic loops
│   │   └── main.py            # FastAPI main gateway entry point
│   ├── Dockerfile             # Backend container setup
│   └── requirements.txt       # Python backend dependencies
├── frontend/                  # Next.js Dashboard UI
│   ├── app/                   # App Router dashboard pages
│   ├── components/            # Recharts analytics & D3 Knowledge Graphs
│   ├── services/              # API Axios client connectors
│   ├── Dockerfile             # Frontend container setup
│   └── package.json           # Node configuration
├── docker/                    # Multi-container orchestration configurations
│   ├── docker-compose.yml     # Compose config running frontend, backend, and Redis
│   └── README.md              # Container installation instructions
├── docs/                      # Technical manuals & architecture references
│   ├── architecture.md        # Comprehensive system architectural walkthrough
│   ├── api_endpoints.md       # API routers directory & JSON formats
│   ├── getting_started.md     # Step-by-step developer setup tutorial
│   └── autonomous_agents.md   # Interactive agents loops design
└── README.md                  # Global presentation file (this file)
```

---

## 📡 Configuration & Environment Variables

To configure the backend, create a `.env` file under the `/backend` directory:

```env
# Database Connection Configuration (e.g. Neon PostgreSQL or local PostgreSQL)
# If left blank/unset, SQLite will be used at backend/researchmind.db
DATABASE_URL=postgresql://user:password@host/dbname

# Authentication & Security
JWT_SECRET=your_jwt_secret_here

# Hugging Face Embeddings Token
HF_TOKEN=your_huggingface_token_here

# Storage Paths
CHROMA_PATH=chroma_db

# Redis Connection URL (For rate-limiting & metrics cache)
REDIS_URL=redis://localhost:6379/0

# Environment Mode (development / testing / production)
ENVIRONMENT=production
```

---

## 🏁 Getting Started Locally

> [!IMPORTANT]
> Ensure you have **Python 3.9 - 3.11** and **Node.js >= 18.0.0** installed on your machine.

### 1. Start Backend Gateway
```bash
cd backend
python -m venv venv

# Windows Activation:
.\venv\Scripts\activate
# macOS/Linux Activation:
source venv/bin/activate

pip install -r requirements.txt
python create_tables.py
uvicorn app.main:app --reload --port 8000
```
*   **Swagger API Documentation**: Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) in your browser.

### 2. Start Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
*   **Application Web Console**: Open [http://localhost:3000](http://localhost:3000).

---

## 🐳 Running with Docker

You can run the entire platform instantly using Docker Compose. In the project root, execute:
```bash
cd docker
docker compose up --build
```
This builds and boots Next.js, FastAPI, and Redis. For more detailed instructions, refer to the [Docker Setup Manual](file:///c:/Users/devap/Documents/researchmind-ai/docker/README.md).

---

## 📚 Core Capabilities Matrix

| Feature | Description | Status |
| :--- | :--- | :---: |
| **PDF Parsing** | Outlining, metadata, DOI extraction | ✅ |
| **OCR Analysis** | Image, table, and formula OCR extraction | ✅ |
| **AI Summarization** | Executive digests, beginner summary, TL;DRs | ✅ |
| **Research Critique** | Strengths, weaknesses, bias, and limitation audits | ✅ |
| **Research Health Score** | Consolidated matrix scores (Novelty, Quality, etc.) | ✅ |
| **RAG Chat** | Context-rich, page-anchored multi-document Q&A | ✅ |
| **Knowledge Graph** | Mathematical entity-relation layout via D3.js | ✅ |
| **Literature Reviews** | Complete multi-paper draft literature compiler | ✅ |
| **AI Research Copilot** | Inline help for formula explanations and coding baselines | ✅ |
| **Export Center** | Report downloads in PDF, DOCX, and PPT formats | ✅ |

---

## 🔮 Future Scope
*   **Realtime arXiv Feed**: Daily automated scraping and vector indexing matching user interest vectors.
*   **Trend Impact Forecast**: Predicts how a paper's citation count will scale based on topological graph centrality.
*   **Collaborative Multi-Agent Debate**: Live multi-agent debate threads reviewing research methodologies dynamically.

---

## 👨‍💻 Developer & Contact

**DEVAPRASATH K**  
*B.Tech Artificial Intelligence & Data Science*  
Mahendra Engineering College  
Namakkal, Tamil Nadu, India  

*   **LinkedIn**: [Devaprasath K](https://www.linkedin.com/in/k-devaprasath-a5079332b)
*   **GitHub**: [@devaprasathk28-dot](https://github.com/devaprasathk28-dot)

---
*"Transforming Research Papers into Actionable Scientific Intelligence."*
