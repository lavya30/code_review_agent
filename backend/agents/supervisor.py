from dotenv import load_dotenv
load_dotenv()

from langchain_core.messages import HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator

from agents.analyzer import build_analyzer
from agents.security import build_security
from agents.optimizer import build_optimizer
from agents.reporter import build_reporter

# BUILD ALL AGENTS ONCE
analyzer = build_analyzer()
security = build_security()
optimizer = build_optimizer()
reporter = build_reporter()

class SupervisorState(TypedDict):
    messages: Annotated[list, operator.add]
    code: str
    language: str
    analysis: str
    security_findings: str
    optimizations: str
    final_report: str
    next: str

def supervisor_node(state: SupervisorState):
    if not state["analysis"]:
        next_agent = "analyzer"
    elif not state["security_findings"]:
        next_agent = "security"
    elif not state["optimizations"]:
        next_agent = "optimizer"
    elif not state["final_report"]:
        next_agent = "reporter"
    else:
        next_agent = "finish"

    print(f"\n→ Supervisor: {next_agent}")
    return {"next": next_agent}

def run_analyzer(state: SupervisorState):
    print("🔍 Analyzer working...")
    result = analyzer.invoke({
        "messages": [HumanMessage(f"Review this {state['language']} code:\n\n{state['code']}")],
        "code": state["code"],
        "language": state["language"],
        "analysis": ""
    })
    findings = result["analysis"]
    return {
        "analysis": findings,
        "messages": [AIMessage(content=findings, name="analyzer")]
    }

def run_security(state: SupervisorState):
    print("🔒 Security working...")
    result = security.invoke({
        "messages": [HumanMessage(f"Find security vulnerabilities:\n\n{state['code']}")],
        "code": state["code"],
        "language": state["language"],
        "security_findings": ""
    })
    findings = result["security_findings"]
    return {
        "security_findings": findings,
        "messages": [AIMessage(content=findings, name="security")]
    }

def run_optimizer(state: SupervisorState):
    print("⚡ Optimizer working...")
    result = optimizer.invoke({
        "messages": [HumanMessage(f"Optimize this code:\n\n{state['code']}")],
        "code": state["code"],
        "language": state["language"],
        "optimizations": ""
    })
    findings = result["optimizations"]
    return {
        "optimizations": findings,
        "messages": [AIMessage(content=findings, name="optimizer")]
    }

def run_reporter(state: SupervisorState):
    print("📝 Reporter working...")
    result = reporter.invoke({
        "messages": [HumanMessage(f"""
Generate final code review report:

ANALYSIS:
{state['analysis']}

SECURITY:
{state['security_findings']}

OPTIMIZATIONS:
{state['optimizations']}
""")],
        "code": state["code"],
        "analysis": state["analysis"],
        "security_findings": state["security_findings"],
        "optimizations": state["optimizations"],
        "final_report": ""
    })
    report = result["final_report"]
    return {
        "final_report": report,
        "messages": [AIMessage(content=report, name="reporter")]
    }

def route(state: SupervisorState):
    n = state["next"].lower()
    if n == "analyzer": return "analyzer"
    if n == "security": return "security"
    if n == "optimizer": return "optimizer"
    if n == "reporter": return "reporter"
    return "end"

def build_supervisor():
    builder = StateGraph(SupervisorState)
    builder.add_node("supervisor", supervisor_node)
    builder.add_node("analyzer", run_analyzer)
    builder.add_node("security", run_security)
    builder.add_node("optimizer", run_optimizer)
    builder.add_node("reporter", run_reporter)
    builder.set_entry_point("supervisor")
    builder.add_conditional_edges(
        "supervisor", route,
        {"analyzer": "analyzer", "security": "security",
         "optimizer": "optimizer", "reporter": "reporter", "end": END}
    )
    builder.add_edge("analyzer", "supervisor")
    builder.add_edge("security", "supervisor")
    builder.add_edge("optimizer", "supervisor")
    builder.add_edge("reporter", "supervisor")
    return builder.compile()