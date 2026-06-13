<p align="center">
  <h1 align="center">🔍 AI Code Review Agent</h1>
  <p align="center">
    <strong>Automated code review powered by a multi-agent AI pipeline</strong>
  </p>
  <p align="center">
    <a href="#features">Features</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#deployment">Deployment</a> •
    <a href="#api-reference">API Reference</a>
  </p>
</p>

---

An intelligent code review system that orchestrates **four specialized AI agents** through a supervisor-driven pipeline built with [LangGraph](https://github.com/langchain-ai/langgraph). Paste any code snippet and receive a comprehensive review covering bug detection, security vulnerabilities, performance optimizations, and an executive-level summary report — all in seconds.

## Features

- 🤖 **Multi-Agent Architecture** — Four purpose-built agents collaborate through a supervisor graph
- 🔍 **Deep Analysis** — Detects bugs, logic errors, edge cases, null/None issues, type mismatches, and infinite loops
- 🔒 **Security Scanning** — Identifies OWASP Top 10 vulnerabilities, SQL injection, XSS, hardcoded secrets, and more
- ⚡ **Performance Optimization** — Surfaces time/space complexity improvements, redundant operations, and better data structures
- 📝 **Executive Reports** — Generates structured markdown reports with severity ratings and prioritized recommendations
- 🌐 **Modern Web UI** — Sleek Next.js frontend with dark theme, real-time pipeline visualization, and tabbed results
- 🐳 **Docker Ready** — Backend containerized and deployable to any cloud platform
- 🌍 **Multi-Language Support** — Supports Python, JavaScript, TypeScript, Java, C++, Go, and Rust

## Architecture

```
┌────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js)               │
│  ┌──────────┐  ┌────────────┐  ┌───────────────┐  │
│  │Code Input│→ │ API Route  │→ │ Results Panel │  │
│  │  Editor  │  │ /api/review│  │  (Tabbed UI)  │  │
│  └──────────┘  └─────┬──────┘  └───────────────┘  │
└───────────────────────┼────────────────────────────┘
                        │ POST /review
┌───────────────────────▼────────────────────────────┐
│                   BACKEND (FastAPI)                 │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │              SUPERVISOR (LangGraph)           │  │
│  │                                              │  │
│  │   ┌──────────┐    ┌──────────┐               │  │
│  │   │ Analyzer │───→│ Security │               │  │
│  │   │  Agent   │    │  Agent   │               │  │
│  │   └──────────┘    └────┬─────┘               │  │
│  │                        │                     │  │
│  │   ┌──────────┐    ┌────▼─────┐               │  │
│  │   │ Reporter │←───│Optimizer │               │  │
│  │   │  Agent   │    │  Agent   │               │  │
│  │   └──────────┘    └──────────┘               │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

### Agent Pipeline

| Agent | Role | Persona | Key Checks |
|-------|------|---------|------------|
| **Analyzer** | Code quality analysis | Expert Code Analyzer | Bugs, logic errors, edge cases, null pointers, type errors, infinite loops |
| **Security** | Vulnerability detection | Security Engineer | SQL injection, XSS, hardcoded secrets, auth flaws, OWASP Top 10 |
| **Optimizer** | Performance improvement | Performance Engineer | Time/space complexity, redundant operations, data structures, best practices |
| **Reporter** | Final report generation | Senior Engineering Manager | Executive summary, severity scoring (/10), prioritized recommendations |

The **Supervisor** orchestrates the pipeline sequentially: `Analyzer → Security → Optimizer → Reporter`. Each agent feeds its findings to the next through shared state, and the Reporter consolidates everything into a structured review document.

## Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| [FastAPI](https://fastapi.tiangolo.com/) | REST API framework |
| [LangGraph](https://github.com/langchain-ai/langgraph) | Multi-agent orchestration |
| [LangChain](https://www.langchain.com/) | LLM integration layer |
| [Groq](https://groq.com/) | LLM inference (Llama 3.3 70B) |
| [Pydantic](https://docs.pydantic.dev/) | Request/response validation |
| [Uvicorn](https://www.uvicorn.org/) | ASGI server |

### Frontend
| Technology | Purpose |
|-----------|---------|
| [Next.js 16](https://nextjs.org/) | React framework (App Router) |
| [React 19](https://react.dev/) | UI library |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [react-markdown](https://github.com/remarkjs/react-markdown) | Markdown rendering |
| [highlight.js](https://highlightjs.org/) | Code syntax highlighting |

## Quick Start

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **Groq API Key** — [Get one free at groq.com](https://console.groq.com/keys)

### 1. Clone the Repository

```bash
git clone https://github.com/lavya30/code_review_agent.git
cd code_review_agent
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```env
GROQ_API_KEY=your_groq_api_key_here

# Optional: LangChain tracing
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langchain_api_key
LANGCHAIN_PROJECT=code-review-agent
```

Start the backend server:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
# Or simply:
python main.py
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

Create a `.env.local` file in the `frontend/` directory:

```env
BACKEND_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Deployment

### Backend (Docker)

The backend includes a production-ready Dockerfile:

```bash
cd backend

# Build
docker build -t code-review-agent .

# Run
docker run -p 8000:8000 \
  -e GROQ_API_KEY=your_key_here \
  code-review-agent
```

The backend is deployed on [Render](https://render.com) at the configured endpoint. Any Docker-compatible platform (Railway, Fly.io, AWS ECS, GCP Cloud Run) will work.

### Frontend (Vercel)

The Next.js frontend is optimized for [Vercel](https://vercel.com) deployment:

1. Push the repository to GitHub
2. Import the project in Vercel, setting the **Root Directory** to `frontend`
3. Add the `BACKEND_URL` environment variable pointing to your deployed backend
4. Deploy

## API Reference

### `GET /`

Returns service information and available routes.

```json
{
  "service": "Code Review Agent",
  "status": "ok",
  "routes": {
    "health": "/health",
    "review": "/review",
    "docs": "/docs"
  }
}
```

### `GET /health`

Health check endpoint.

```json
{ "status": "ok" }
```

### `POST /review`

Submit code for review. Returns analysis from all four agents.

**Request Body:**

```json
{
  "code": "def hello():\n    print('world')",
  "language": "python"
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `code` | `string` | *required* | The source code to review |
| `language` | `string` | `"python"` | Programming language of the code |

**Response:**

```json
{
  "analysis": "## Code Analysis\n...",
  "security": "## Security Findings\n...",
  "optimizations": "## Optimization Suggestions\n...",
  "report": "# Code Review Report\n## Executive Summary\n..."
}
```

## Testing

The backend includes test scripts for each agent:

```bash
cd backend

# Test the full supervisor pipeline
python test_supervisor.py

# Test individual agents
python test_analyzer.py
python test_security.py
python test_optimizer.py
python test_reporter.py
```

## Project Structure

```
code_review_agent/
├── backend/
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── analyzer.py          # Bug & code quality analysis agent
│   │   ├── security.py          # Security vulnerability detection agent
│   │   ├── optimizer.py         # Performance optimization agent
│   │   ├── reporter.py          # Final report generation agent (with tools)
│   │   └── supervisor.py        # LangGraph supervisor orchestrator
│   ├── main.py                  # FastAPI application entry point
│   ├── requirements.txt         # Python dependencies
│   ├── Dockerfile               # Container configuration
│   ├── .env                     # Environment variables (not committed)
│   ├── .gitignore
│   ├── .dockerignore
│   ├── test_analyzer.py         # Analyzer agent tests
│   ├── test_security.py         # Security agent tests
│   ├── test_optimizer.py        # Optimizer agent tests
│   ├── test_reporter.py         # Reporter agent tests
│   └── test_supervisor.py       # Full pipeline integration test
│
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   │   └── review/
│   │   │       └── route.ts     # Next.js API proxy route
│   │   ├── components/
│   │   │   └── MarkdownRenderer.tsx
│   │   ├── globals.css          # Global styles & design tokens
│   │   ├── layout.tsx           # Root layout with Geist font
│   │   └── page.tsx             # Main application page
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── .env.local               # Frontend environment variables
│
└── README.md
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | ✅ | Groq API key for Llama 3.3 70B inference |
| `LANGCHAIN_TRACING_V2` | ❌ | Enable LangSmith tracing (`true`/`false`) |
| `LANGCHAIN_API_KEY` | ❌ | LangSmith API key for observability |
| `LANGCHAIN_PROJECT` | ❌ | LangSmith project name |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `BACKEND_URL` | ✅ | URL of the deployed backend API |

## License

This project is open source. Feel free to use, modify, and distribute.

---


