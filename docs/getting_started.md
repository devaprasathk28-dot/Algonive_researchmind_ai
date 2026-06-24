# 🏁 Getting Started Guide

This guide describes how to set up, configure, and run ResearchMind AI locally for development purposes.

---

## 📋 System Requirements
*   **Operating System**: Windows 10/11, macOS, or Linux
*   **Python**: Python 3.9 to 3.11
*   **Node.js**: Node.js 18.x or 20.x (with `npm` or `yarn`)
*   **Git**: For version control

---

## 🐍 1. Backend Setup (FastAPI)

The backend handles core agent loops, PDF parsing, OCR, vector database embeddings, and API request routing.

### Step 1: Navigate to Backend Directory
Open your terminal and navigate to the backend folder:
```bash
cd backend
```

### Step 2: Create a Virtual Environment
It is highly recommended to use a Python virtual environment to avoid package dependency conflicts:

**On Windows (Command Prompt / PowerShell)**:
```powershell
python -m venv venv
.\venv\Scripts\activate
```

**On macOS / Linux**:
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies
Install all required libraries listed in `requirements.txt`:
```bash
pip install -r requirements.txt
```

> [!NOTE]
> Installing packages like `torch` or `easyocr` might take some time depending on your network bandwidth and hardware speed.

### Step 4: Configure Environment Variables
Copy or rename `.env.example` (or create a new `.env` file) inside the `backend` folder:
```env
DATABASE_URL=sqlite:///./researchmind.db
JWT_SECRET=your-super-secret-jwt-signing-key
HF_TOKEN=your_huggingface_token
CHROMA_PATH=chroma_db
REDIS_URL=redis://localhost:6379/0
ENVIRONMENT=development
```

### Step 5: Initialize Database Tables
Run the database setup script to create SQLite/PostgreSQL schemas and initialize tables:
```bash
python create_tables.py
```

### Step 6: Start FastAPI Dev Server
Launch the server using Uvicorn with reload mode enabled:
```bash
uvicorn app.main:app --reload --port 8000
```
*   **API Gateway URL**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
*   **Swagger API Playground**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
*   **Re-doc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 💻 2. Frontend Setup (Next.js)

The frontend is a dynamic dashboard built with Next.js and TypeScript, supporting interactive graphs and real-time visualization of analytics.

### Step 1: Navigate to Frontend Directory
Open a new terminal session and navigate to the frontend folder:
```bash
cd frontend
```

### Step 2: Install Node Packages
Install the workspace node packages:
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a `.env.local` file in the `frontend` folder to configure the gateway endpoint:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 4: Start Next.js Dev Server
Start the development server:
```bash
npm run dev
```
*   **Web Dashboard URL**: [http://localhost:3000](http://localhost:3000)

---

## 🧪 3. Verifying Local Setup

To verify that both frontend and backend are communicating correctly:
1.  Open the web dashboard at `http://localhost:3000`.
2.  Navigate to the sign-up page and create a developer account.
3.  Upload a short academic paper PDF.
4.  Verify that text parsing, outline structure analysis, and scoring metrics populate correctly on the analytics charts.
