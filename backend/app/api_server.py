from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import sessionmaker
from db.session import Base, engine
from models import League, Team, Game, Standing
from datetime import datetime
import uvicorn
import os
from typing import Optional
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, and_, or_
from sqlalchemy.orm import relationship

app = FastAPI(title="BetterScore API")

# Get allowed origins from environment variable or use defaults
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
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

@app.get("/api/leagues")
async def get_leagues():
    with SessionLocal() as session:
        leagues = session.query(League).all()
        return [{"id": l.id, "name": l.name, "code": l.name} for l in leagues]

@app.get("/api/leagues/{league_code}/teams")
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
        games = query.order_by(Game.game_date.desc()).offset(offset).limit(limit).all()
        
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

@app.get("/api/leagues/{league_code}/standings")
async def get_league_standings(league_code: str):
    with SessionLocal() as session:
        # Get league
        league = session.query(League).filter(League.name == league_code).first()
        if not league:
            raise HTTPException(status_code=404, detail="League not found")
        
        # Get standings ordered by points/wins
        standings = session.query(Standing).filter(Standing.league_id == league.id).all()
        
        # Sort based on league type
        if league_code in ['NHL', 'PREMIER_LEAGUE']:
            # Sort by points (descending)
            standings.sort(key=lambda x: (x.points or 0, x.wins or 0), reverse=True)
        else:
            # Sort by win percentage (descending)
            standings.sort(key=lambda x: (x.win_pct or 0, x.wins or 0), reverse=True)
        
        # Format response
        result = []
        for s in standings:
            standing_data = {
                "team_id": s.team_id,
                "team_name": s.team.name,
                "team_logo": s.team.logo_url,
                "wins": s.wins,
                "losses": s.losses,
                "draws": s.draws,
                "ot_losses": s.ot_losses,
                "ties": s.ties,
                "points": s.points,
                "win_pct": s.win_pct,
                "points_pct": s.points_pct,
                "goals_for": s.goals_for,
                "goals_against": s.goals_against,
                "points_for": s.points_for,
                "points_against": s.points_against,
                "goal_diff": s.goal_diff,
                "point_diff": s.point_diff,
                "division": s.division,
                "conference": s.conference,
                "games_played": s.games_played,
            }
            result.append(standing_data)
        
        return result

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
