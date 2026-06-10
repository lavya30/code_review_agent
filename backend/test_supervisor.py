from dotenv import load_dotenv
load_dotenv()

from agents.supervisor import build_supervisor

supervisor = build_supervisor()

code = """
import sqlite3

API_KEY = "sk-1234567890abcdef"

def get_user(username):
    conn = sqlite3.connect("users.db")
    query = f"SELECT * FROM users WHERE username = '{username}'"
    return conn.execute(query).fetchone()

def find_duplicates(lst):
    duplicates = []
    for i in range(len(lst)):
        for j in range(len(lst)):
            if i != j and lst[i] == lst[j]:
                if lst[i] not in duplicates:
                    duplicates.append(lst[i])
    return duplicates
"""

result = supervisor.invoke({
    "messages": [],
    "code": code,
    "language": "python",
    "analysis": "",
    "security_findings": "",
    "optimizations": "",
    "final_report": "",
    "next": ""
})

print("\n=== FINAL REPORT ===")
print(result["final_report"])