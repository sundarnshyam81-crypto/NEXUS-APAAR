import sys
sys.stdout.reconfigure(encoding='utf-8', line_buffering=True) if hasattr(sys.stdout, 'reconfigure') else None

print("1. Starting step-by-step test...", flush=True)
from main import app
print("2. main.app imported.", flush=True)
import httpx
print("3. httpx imported.", flush=True)
from httpx import ASGITransport
print("4. ASGITransport class imported.", flush=True)
t = ASGITransport(app=app)
print("5. ASGITransport instance created.", flush=True)
ac = httpx.AsyncClient(transport=t, base_url="http://test")
print("6. AsyncClient instance created.", flush=True)

import asyncio
print("7. asyncio imported.", flush=True)

async def test_coro():
    print("Inside coroutine!", flush=True)

print("8. Calling asyncio.run(test_coro())...", flush=True)
asyncio.run(test_coro())
print("9. asyncio.run completed successfully!", flush=True)
