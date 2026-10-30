import asyncio, sys
from main import app
from httpx import AsyncClient, ASGITransport

print("Imported successfully. Running async test...", flush=True)

async def main():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        print("Sending GET /health...", flush=True)
        res = await ac.get("/health")
        print("Response:", res.status_code, res.json(), flush=True)

asyncio.run(main())
print("Async test finished cleanly!", flush=True)
