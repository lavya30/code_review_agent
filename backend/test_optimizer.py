from dotenv import load_dotenv
load_dotenv()

from agents.optimizer import build_optimizer
from langchain_core.messages import HumanMessage

optimizer = build_optimizer()

code = """
def find_duplicates(lst):
    duplicates = []
    for i in range(len(lst)):
        for j in range(len(lst)):
            if i != j and lst[i] == lst[j]:
                if lst[i] not in duplicates:
                    duplicates.append(lst[i])
    return duplicates

def reverse_string(s):
    result = ""
    for char in s:
        result = char + result
    return result
"""

result = optimizer.invoke({
    "messages": [HumanMessage(f"Optimize this code:\n\n{code}")],
    "code": code,
    "language": "python",
    "optimizations": ""
})

print(result["optimizations"])