from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import sessionmaker
from db.session import Base, engine
from models import League, Team, Game
from datetime import datetime
import uvicorn
from typing import Optional
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, and_, or_
from sqlalchemy.orm import relationship

app = FastAPI(title="BetterScore API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SessionLocal = sessionmaker(bind=engine)

# Initialize database tables
Base.metadata.create_all(bind=engine)

@app.get("/")
async def root():
    return {"message": "BetterScore API is running"}

@app.get("/leagues")
async def get_leagues():
    with SessionLocal() as session:
        leagues = session.query(League).all()
        return [{"id": l.id, "name": l.name, "code": l.name} for l in leagues]

@app.get("/leagues/{league_code}/teams")
async def get_league_teams(league_code: str):
    with SessionLocal() as session:
        league = session.query(League).filter(League.name == league_code.upper()).first()
        if not league:
            raise HTTPException(status_code=404, detail="League not found")
        
        teams = session.query(Team).filter(Team.league_id == league.id).order_by(Team.name).all()
        
        result = []
        for t in teams:
            result.append({
                "id": t.id,
                "name": t.name,
                "logoUrl": t.logo_url
            })
        return result

@app.get("/api/leagues/{league_code}/games")
async def get_league_games(
    league_code: str,
    limit: int = 10,
    offset: int = 0,
    team: Optional[str] = None
):
    with SessionLocal() as session:
        # Get league
        league = session.query(League).filter(League.name == league_code).first()
        if not league:
            raise HTTPException(status_code=404, detail="League not found")
        
        # Build query
        query = session.query(Game).filter(Game.league_id == league.id)
        
        # Filter by team if specified
        if team:
            query = query.join(Team, or_(
                and_(Game.home_team_id == Team.id, Team.name.ilike(f"%{team}%")),
                and_(Game.away_team_id == Team.id, Team.name.ilike(f"%{team}%"))
            ))
        
        # Get games with pagination
        games = query.offset(offset).limit(limit).all()
        
        # Format response
        result = []
        for g in games:
            game_data = {
                "id": g.id,
                "game_date": g.game_date.isoformat() if g.game_date else None,
                "homeTeam": g.home_team.name,
                "awayTeam": g.away_team.name,
                "homeScore": g.home_score,
                "awayScore": g.away_score,
                "homeTeamLogo": g.home_team.logo_url,
                "awayTeamLogo": g.away_team.logo_url,
                "attendance": g.attendance,
                "venue": g.venue,
                "referee": g.referee,
            }
            result.append(game_data)
        
        return result

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
