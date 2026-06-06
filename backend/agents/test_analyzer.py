from dotenv import load_dotenv
load_dotenv()

from analyzer import build_analyzer
from langchain_core.messages import HumanMessage

analyzer = build_analyzer()

# buggy code to review
code = """
def divide(a, b):
    return a / b

def get_user(users, id):
    return users[id]

def calculate_average(numbers):
    total = 0
    for n in numbers:
        total += n
    return total / len(numbers)
"""

result = analyzer.invoke({
    "messages": [HumanMessage(f"Review this Python code:\n\n{code}")],
    "code": code,
    "language": "python",
    "analysis": ""
})

print(result["analysis"])