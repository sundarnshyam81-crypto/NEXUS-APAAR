import asyncio, sys, time
from main import app
from httpx import AsyncClient, ASGITransport

print("Imported main. Testing direct ASGI request without lifespan handshake...", flush=True)

async def run():
    transport = ASGITransport(app=app)
    # Do NOT call __aenter__ so no lifespan.startup deadlock occurs!
    ac = AsyncClient(transport=transport, base_url="http://test")
    
    t0 = time.time()
    print("Testing GET /health...", flush=True)
    res = await ac.get("/health")
    print(f"GET /health: {res.status_code} in {time.time()-t0:.3f}s -> {res.json()}", flush=True)
    
    t0 = time.time()
    print("Testing GET /...", flush=True)
    res = await ac.get("/")
    print(f"GET /: {res.status_code} in {time.time()-t0:.3f}s -> {res.json()}", flush=True)

asyncio.run(run())
print("Pure ASGI test finished successfully!", flush=True)
