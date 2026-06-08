from dotenv import load_dotenv
load_dotenv()

from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from typing import TypedDict, Annotated
import operator
import os

llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0)

@tool
def save_report(filename: str, content: str) -> str:
    """Save final code review report to markdown file."""
    try:
        os.makedirs("reports", exist_ok=True)
        path = f"reports/{filename}.md"
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        return f"✅ Report saved to {path}"
    except Exception as e:
        return f"Error: {e}"

tools = [save_report]
llm_with_tools = llm.bind_tools(tools)
tool_node = ToolNode(tools)

class ReporterState(TypedDict):
    messages: Annotated[list, operator.add]
    code: str
    analysis: str
    security_findings: str
    optimizations: str
    final_report: str

def reporter_node(state: ReporterState):
    response = llm_with_tools.invoke([
        SystemMessage("""You are senior engineering manager at Google.
Combine all findings into one professional code review report.

Structure:
# Code Review Report
## Executive Summary (overall score /10, key issues)
## Critical Issues (must fix before merge)
## Security Vulnerabilities
## Performance & Optimization
## Code Quality
## Recommendations (priority ordered)
## Conclusion

Be concise but thorough.
ALWAYS save report using save_report tool with filename 'code-review'."""),
        *state["messages"]
    ])
    return {
        "final_report": response.content,
        "messages": [response]
    }

def route(state: ReporterState):
    last = state["messages"][-1]
    if hasattr(last, "tool_calls") and last.tool_calls:
        return "tools"
    return "end"

def build_reporter():
    builder = StateGraph(ReporterState)
    builder.add_node("reporter", reporter_node)
    builder.add_node("tools", tool_node)
    builder.set_entry_point("reporter")
    builder.add_conditional_edges("reporter", route, {"tools": "tools", "end": END})
    builder.add_edge("tools", "reporter")
    return builder.compile()