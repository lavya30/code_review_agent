from dotenv import load_dotenv
load_dotenv()
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph ,END
from typing import TypedDict, Annotated
import operator

llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0)

class SecurityState(TypedDict):
    messages: Annotated[list, operator.add]
    code: str           # code to review
    language: str
    security_findings: str

def security_node(state: SecurityState):
    response = llm.invoke([
        SystemMessage("""You are expert security engineer at Meta.
Analyze code for security vulnerabilities:
1. SQL Injection
2. XSS vulnerabilities
3. Hardcoded secrets / API keys
4. Insecure dependencies
5. Authentication/Authorization flaws
6. Input validation issues
7. Sensitive data exposure
8. OWASP Top 10 issues

Rate each finding: CRITICAL / HIGH / MEDIUM / LOW
Format as markdown."""),
        *state["messages"]
    ])
    return {
        "security_findings": response.content,
        "messages": [response]
    }

def build_security():
    builder = StateGraph(SecurityState)
    builder.add_node("security", security_node)
    builder.set_entry_point("security")
    builder.add_edge("security", END)
    return builder.compile()
