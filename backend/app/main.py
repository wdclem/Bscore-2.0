from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .nhl_scraper import fetch_nhl_data
from .db import save_to_db, get_games

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/games")
def list_games():
    return get_games()


@app.post("/scrape")
def scrape_and_store():
    games = fetch_nhl_data()
    save_to_db(games)
    return {"saved": len(games)}
