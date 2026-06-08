from dotenv import load_dotenv
load_dotenv()

from agents.reporter import build_reporter
from langchain_core.messages import HumanMessage

reporter = build_reporter()

result = reporter.invoke({
    "messages": [HumanMessage("""
Generate final code review report combining these findings:

ANALYSIS FINDINGS:
- divide() has no zero division check
- get_user() has no bounds check
- calculate_average() crashes on empty list

SECURITY FINDINGS:
- CRITICAL: SQL injection in get_user()
- CRITICAL: Hardcoded API keys
- HIGH: Plain text passwords

OPTIMIZATION FINDINGS:
- find_duplicates() is O(n²) should be O(n)
- reverse_string() should use slicing
""")],
    "code": "sample code",
    "analysis": "bugs found",
    "security_findings": "vulns found",
    "optimizations": "improvements found",
    "final_report": ""
})

print(result["final_report"])