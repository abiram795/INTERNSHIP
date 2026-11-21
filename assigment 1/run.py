#!/usr/bin/env python3
"""
Root entry point to launch the API C2C Automation Application.
"""
import os
import uvicorn
from dotenv import load_dotenv

load_dotenv()

if __name__ == "__main__":
    host = os.getenv("APP_HOST", "127.0.0.1")
    port = int(os.getenv("APP_PORT", 8000))
    print(f"\n========================================================")
    print(f"🚀 Starting API C2C - LinkedIn Job Search & Email Automator")
    print(f"📡 Dashboard URL: http://{host}:{port}")
    print(f"📚 OpenAPI Specs: http://{host}:{port}/docs")
    print(f"========================================================\n")
    uvicorn.run("backend.main:app", host=host, port=port, reload=True)

