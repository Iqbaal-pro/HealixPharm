from fastapi import FastAPI
from app.database.db import engine
from app.database.base import Base
from app.routes.reminder_routes import router as reminder_router

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(reminder_router)
