from dotenv import load_dotenv
load_dotenv()

from agents.security import build_security
from langchain_core.messages import HumanMessage

security = build_security()

# vulnerable code
code = """
import sqlite3

API_KEY = "sk-1234567890abcdef"
DB_PASSWORD = "admin123"

def get_user(username):
    conn = sqlite3.connect("users.db")
    query = f"SELECT * FROM users WHERE username = '{username}'"
    result = conn.execute(query)
    return result.fetchone()

def login(username, password):
    user = get_user(username)
    if user and user[2] == password:
        return True
    return False
"""

result = security.invoke({
    "messages": [HumanMessage(f"Find security vulnerabilities:\n\n{code}")],
    "code": code,
    "language": "python",
    "security_findings": ""
})

print(result["security_findings"])