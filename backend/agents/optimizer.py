from dotenv import load_dotenv
load_dotenv()

from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator

llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0)

class OptimizerState(TypedDict):
    messages: Annotated[list, operator.add]
    code: str
    language: str
    optimizations: str

def optimizer_node(state: OptimizerState):
    response = llm.invoke([
        SystemMessage("""You are expert performance engineer at Microsoft.
Analyze code for improvements:
1. Time complexity issues (O(n²) that can be O(n))
2. Space complexity issues
3. Redundant operations
4. Better data structures to use
5. Python best practices
6. Readability improvements
7. Missing docstrings/comments

For each suggestion show:
- Current code
- Improved code
- Why it's better

Format as markdown."""),
        *state["messages"]
    ])
    return {
        "optimizations": response.content,
        "messages": [response]
    }

def build_optimizer():
    builder = StateGraph(OptimizerState)
    builder.add_node("optimizer", optimizer_node)
    builder.set_entry_point("optimizer")
    builder.add_edge("optimizer", END)
    return builder.compile()