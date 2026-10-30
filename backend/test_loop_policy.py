import sys, os, asyncio

sys.stdout.reconfigure(encoding='utf-8', line_buffering=True) if hasattr(sys.stdout, 'reconfigure') else None

print("Default policy:", asyncio.get_event_loop_policy(), flush=True)

if sys.platform == "win32":
    print("Switching to WindowsSelectorEventLoopPolicy...", flush=True)
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    print("New policy:", asyncio.get_event_loop_policy(), flush=True)

async def test_coro():
    print("Running inside coroutine with SelectorEventLoop!", flush=True)
    return 42

res = asyncio.run(test_coro())
print(f"asyncio.run returned: {res} successfully!", flush=True)
