from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from api.db.session import init_db
from api.events import router as event_router
from api.analytics import router as analytics_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(lifespan=lifespan)


app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")

app.include_router(event_router, prefix="/api/events", tags=["Events"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["Analytics"])

@app.get("/healthz")
def health_check():
    return {"status": "ok"}
