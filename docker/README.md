# 🐳 ResearchMind AI Docker Guide

This directory contains the Docker configuration for containerizing the complete ResearchMind AI application stack. 

By using the provided configuration, you can run the entire platform—including the Next.js frontend, FastAPI backend gateway, and Redis cache—using a single command.

---

## 🛠️ Prerequisites
Ensure you have the following installed on your host system:
*   [Docker](https://docs.docker.com/get-docker/) (v20.10.0 or higher)
*   [Docker Compose](https://docs.docker.com/compose/install/) (v2.0.0 or higher)

---

## 🚀 Quick Start

### 1. Build and Run the Stack
To build the Docker images and start all services in the foreground, navigate to the `docker` directory and run:

```bash
docker compose up --build
```

To run the containers in background (detached mode):

```bash
docker compose up -d --build
```

### 2. Verify Running Services
After starting the containers, verify they are healthy:

| Service | Port | Description | Health Endpoint / URL |
| :--- | :--- | :--- | :--- |
| **Frontend** | `3000` | Next.js Dashboard | [http://localhost:3000](http://localhost:3000) |
| **Backend** | `8000` | FastAPI Web Gateway | [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger Docs) |
| **Redis** | `6379` | Traffic monitoring & caching | Caching and background triggers |

To verify the backend status, open [http://localhost:8000/health](http://localhost:8000/health) in your browser.

---

## 💾 Volumes and Data Persistence

To prevent data loss when containers are restarted or rebuilt, the `docker-compose.yml` mounts several local named volumes:

1.  **`backend_storage`**: Mounted at `/app/storage`. Persists:
    *   SQLite database (`researchmind.db`)
    *   ChromaDB vector store vector indexes (`chroma_db/`)
    *   File uploads (`uploads/`)
2.  **`backend_reports`**: Mounted at `/app/generated_reports`. Persists generated PDF, Word, and PowerPoint research analysis reports.
3.  **`redis_data`**: Mounted at `/data`. Persists cached dashboard metrics and rate limiter state.

To remove all persistent data (e.g. for a clean reset), run:
```bash
docker compose down -v
```

---

## ⚙️ Environment Variables

The `docker-compose.yml` exposes environment variables to the backend service. You can adjust these values directly in the compose file or create an `.env` file in this directory:

*   `DATABASE_URL`: Set to `sqlite:////app/storage/researchmind.db` by default. Can be updated to point to a production PostgreSQL database (e.g. Neon, RDS).
*   `REDIS_URL`: Connection string for the Redis service (`redis://redis:6379/0`).
*   `CHROMA_PATH`: Location of the local Chroma vector index (`/app/storage/chroma_db`).
*   `JWT_SECRET`: Secret key used for signing user authorization tokens. Update this to a secure key in production.
*   `HF_TOKEN`: HuggingFace authorization token to bypass rate limits when pulling embeddings or language models.

---

## 🔍 Useful Commands

### Check Service Logs
```bash
# View all logs
docker compose logs -f

# View only backend logs
docker compose logs -f backend
```

### Access Container Terminal
To debug or run database migrations directly inside the backend:
```bash
docker compose exec backend bash
```

### Stop All Services
```bash
docker compose down
```
