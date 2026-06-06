from dotenv import load_dotenv
load_dotenv()
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph ,END
from typing import TypedDict, Annotated
import operator

llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0)
class AnalyzerState(TypedDict):
    messages: Annotated[list, operator.add]
    code: str           # code to review
    language: str       # python, js, etc
    analysis: str       # analyzer finding

def analyzer_node(state: AnalyzerState):
    response = llm.invoke([
        SystemMessage("""You are expert code analyzer at Google.
Analyze the given code and find:
1. Bugs and logical errors
2. Edge cases not handled
3. Null/None pointer issues
4. Type errors
5. Infinite loops or recursion issues

Be specific. Reference exact line numbers.
Format as markdown with sections."""),
        *state["messages"]
    ])
    return {
        "analysis": response.content,
        "messages": [response]
    }

def build_analyzer():
    builder = StateGraph(AnalyzerState)
    builder.add_node("analyzer", analyzer_node)
    builder.set_entry_point("analyzer")
    builder.add_edge("analyzer", END)
    return builder.compile()
