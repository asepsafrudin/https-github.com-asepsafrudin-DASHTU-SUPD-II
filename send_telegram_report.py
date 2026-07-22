import os
import requests
from dotenv import load_dotenv

def send_telegram_message():
    load_dotenv("/home/aseps/MCP/.env")
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    
    message = """🚨 *Laporan Audit Keamanan DASHTU-SUPD-II Selesai*

*Temuan Audit:*
- 1 CRITICAL (Broken Access Control / IDOR pada API)
- 2 HIGH (Broken Auth & Ketiadaan Session, Hardcoded Secrets di .env)
- 1 MEDIUM (Weak Cryptographic Hash Fallback)
- 1 LOW (Risiko SQL Dinamis)

Laporan lengkap telah dicatat di `tasks/01_active/TASK-109-audit-dashtu-supd-ii.md` dan sudah di-push.

*Git Commit:* 968e6d5a8f906c139dc68527c4219223f768be0c
*Link:* https://github.com/asepsafrudin/mcp-universal-agent-system/commit/968e6d5a8f906c139dc68527c4219223f768be0c

Silakan tinjau file task tersebut dan lakukan mitigasi segera.
"""

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "Markdown"
    }
    
    response = requests.post(url, json=payload)
    print("Status Code:", response.status_code)
    print("Response:", response.text)

if __name__ == "__main__":
    send_telegram_message()
