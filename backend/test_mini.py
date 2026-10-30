from fastapi import FastAPI
from fastapi.testclient import TestClient
import sys

print("Python version:", sys.version, flush=True)
app = FastAPI()

@app.get("/ping")
def ping():
    return {"ping": "pong"}

print("Creating TestClient...", flush=True)
client = TestClient(app)
print("Sending get /ping...", flush=True)
r = client.get("/ping")
print("Response:", r.json(), flush=True)
