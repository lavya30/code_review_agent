from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
from agents.supervisor import build_supervisor

app = FastAPI(title="Code Review Agent")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

supervisor = build_supervisor()


@app.get("/")
async def root():
    return {
        "service": "Code Review Agent",
        "status": "ok",
        "routes": {
            "health": "/health",
            "review": "/review",
            "docs": "/docs",
        },
    }

class ReviewRequest(BaseModel):
    code: str
    language: str = "python"

@app.post("/review")
async def review_code(req: ReviewRequest):
    result = supervisor.invoke({
        "messages": [],
        "code": req.code,
        "language": req.language,
        "analysis": "",
        "security_findings": "",
        "optimizations": "",
        "final_report": "",
        "next": ""
    })
    return {
        "analysis": result["analysis"],
        "security": result["security_findings"],
        "optimizations": result["optimizations"],
        "report": result["final_report"]
    }

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, timeout_keep_alive=120)