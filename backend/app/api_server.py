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
                "homeTeamId": g.home_team_id,
                "awayTeamId": g.away_team_id,
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

@app.get("/api/teams/{team_id}/stats")
async def get_team_stats(team_id: int):
    with SessionLocal() as session:
        # Get team
        team = session.query(Team).filter(Team.id == team_id).first()
        if not team:
            raise HTTPException(status_code=404, detail="Team not found")
        
        # Get all games for this team (both home and away)
        home_games = session.query(Game).filter(
            Game.home_team_id == team_id,
            Game.home_score.isnot(None),
            Game.away_score.isnot(None)
        ).all()
        
        away_games = session.query(Game).filter(
            Game.away_team_id == team_id,
            Game.home_score.isnot(None),
            Game.away_score.isnot(None)
        ).all()
        
        # Calculate stats
        wins = 0
        losses = 0
        draws = 0
        
        # Process home games
        for game in home_games:
            if game.home_score > game.away_score:
                wins += 1
            elif game.home_score < game.away_score:
                losses += 1
            else:
                draws += 1
        
        # Process away games
        for game in away_games:
            if game.away_score > game.home_score:
                wins += 1
            elif game.away_score < game.home_score:
                losses += 1
            else:
                draws += 1
        
        total_games = wins + losses + draws
        win_pct = (wins / total_games * 100) if total_games > 0 else 0
        
        return {
            "team_id": team.id,
            "team_name": team.name,
            "team_logo": team.logo_url,
            "wins": wins,
            "losses": losses,
            "draws": draws,
            "total_games": total_games,
            "win_percentage": round(win_pct, 1)
        }

@app.get("/api/leagues/{league_code}/top-scorers")
async def get_top_scorers(league_code: str, limit: int = 10):
    with SessionLocal() as session:
        # Get league
        league = session.query(League).filter(League.name == league_code).first()
        if not league:
            raise HTTPException(status_code=404, detail="League not found")
        
        # Import scrapers
        from player_stats_scraper import (
            scrape_nhl_player_stats,
            scrape_premier_league_player_stats,
            scrape_nfl_player_stats,
            scrape_nba_player_stats
        )
        
        # Call the appropriate scraper with fallback to mock data
        try:
            if league_code == "NHL":
                players = scrape_nhl_player_stats('scoring', limit)
            elif league_code == "PREMIER_LEAGUE":
                players = scrape_premier_league_player_stats('scoring', limit)
            elif league_code == "NFL":
                # NFL doesn't have individual goal scorers, return empty
                players = []
            elif league_code == "NBA":
                # NBA doesn't have individual goal scorers, return empty  
                players = []
            else:
                players = []
            
            # If scraper returns empty data, use fallback mock data
            if not players:
                print(f"⚠️ Scraper returned empty data for {league_code}, using fallback data")
                if league_code == "NHL":
                    players = [
                        {"name": "Connor McDavid", "team": "EDM", "position": "C", "goals": 12, "assists": 18, "points": 30},
                        {"name": "Leon Draisaitl", "team": "EDM", "position": "C", "goals": 8, "assists": 15, "points": 23},
                        {"name": "Nathan MacKinnon", "team": "COL", "position": "C", "goals": 10, "assists": 12, "points": 22},
                        {"name": "Artemi Panarin", "team": "NYR", "position": "LW", "goals": 9, "assists": 14, "points": 23},
                        {"name": "David Pastrnak", "team": "BOS", "position": "RW", "goals": 11, "assists": 8, "points": 19}
                    ]
                elif league_code == "PREMIER_LEAGUE":
                    players = [
                        {"name": "Erling Haaland", "team": "Manchester City", "position": "F", "goals": 8, "assists": 2, "points": 10},
                        {"name": "Mohamed Salah", "team": "Liverpool", "position": "F", "goals": 6, "assists": 4, "points": 10},
                        {"name": "Ollie Watkins", "team": "Aston Villa", "position": "F", "goals": 7, "assists": 1, "points": 8},
                        {"name": "Son Heung-min", "team": "Tottenham", "position": "F", "goals": 5, "assists": 3, "points": 8},
                        {"name": "Bukayo Saka", "team": "Arsenal", "position": "F", "goals": 4, "assists": 2, "points": 6}
                    ]
        except Exception as e:
            print(f"❌ Error calling scraper for {league_code}: {e}")
            players = []
        
        # Sort by goals and return top N
        players.sort(key=lambda x: x.get("goals", 0), reverse=True)
        return players[:limit]

@app.get("/api/leagues/{league_code}/attendance-stats")
async def get_attendance_stats(league_code: str):
    with SessionLocal() as session:
        # Get league
        league = session.query(League).filter(League.name == league_code).first()
        if not league:
            raise HTTPException(status_code=404, detail="League not found")
        
        # Get all games with attendance data
        games = session.query(Game).filter(
            Game.league_id == league.id,
            Game.attendance.isnot(None),
            Game.attendance != ""
        ).all()
        
        if not games:
            return {
                "total_games": 0,
                "highest_attendance": None,
                "average_attendance": None,
                "total_attendance": 0,
                "games_with_attendance": 0
            }
        
        # Parse attendance numbers and track game details
        attendance_numbers = []
        game_details = []
        
        for game in games:
            try:
                # Remove commas and convert to int
                attendance_str = game.attendance.replace(',', '').replace(' ', '')
                attendance_num = int(attendance_str)
                attendance_numbers.append(attendance_num)
                
                # Get team names for this game
                home_team = session.query(Team).filter(Team.id == game.home_team_id).first()
                away_team = session.query(Team).filter(Team.id == game.away_team_id).first()
                
                game_details.append({
                    "attendance": attendance_num,
                    "home_team": home_team.name if home_team else "Unknown",
                    "away_team": away_team.name if away_team else "Unknown",
                    "home_score": game.home_score,
                    "away_score": game.away_score,
                    "venue": game.venue,
                    "game_date": game.game_date.isoformat() if game.game_date else None
                })
            except (ValueError, AttributeError):
                # Skip games with invalid attendance data
                continue
        
        if not attendance_numbers:
            return {
                "total_games": len(games),
                "highest_attendance": None,
                "average_attendance": None,
                "total_attendance": 0,
                "games_with_attendance": 0,
                "highest_attendance_game": None
            }
        
        highest_attendance = max(attendance_numbers)
        average_attendance = sum(attendance_numbers) / len(attendance_numbers)
        total_attendance = sum(attendance_numbers)
        
        # Find the game with highest attendance
        highest_game = None
        for game_detail in game_details:
            if game_detail["attendance"] == highest_attendance:
                highest_game = game_detail
                break
        
        return {
            "total_games": len(games),
            "highest_attendance": highest_attendance,
            "average_attendance": round(average_attendance, 0),
            "total_attendance": total_attendance,
            "games_with_attendance": len(attendance_numbers),
            "highest_attendance_game": highest_game
        }

@app.get("/api/leagues/{league_code}/score-distribution")
async def get_score_distribution(league_code: str):
    with SessionLocal() as session:
        # Get league
        league = session.query(League).filter(League.name == league_code).first()
        if not league:
            raise HTTPException(status_code=404, detail="League not found")
        
        # Get all games with scores
        games = session.query(Game).filter(
            Game.league_id == league.id,
            Game.home_score.isnot(None),
            Game.away_score.isnot(None)
        ).all()
        
        if not games:
            return {
                "total_games": 0,
                "score_distribution": [],
                "most_common_score": None,
                "average_goals_per_game": 0
            }
        
        # Count score occurrences
        score_counts = {}
        total_goals = 0
        
        for game in games:
            home_score = game.home_score
            away_score = game.away_score
            total_goals += home_score + away_score
            
            # Create score key (always put smaller score first for consistency)
            if home_score <= away_score:
                score_key = f"{home_score}-{away_score}"
            else:
                score_key = f"{away_score}-{home_score}"
            
            score_counts[score_key] = score_counts.get(score_key, 0) + 1
        
        # Convert to list and sort by frequency
        score_distribution = [
            {"score": score, "count": count, "percentage": round((count / len(games)) * 100, 1)}
            for score, count in score_counts.items()
        ]
        score_distribution.sort(key=lambda x: x["count"], reverse=True)
        
        # Find most common score
        most_common_score = score_distribution[0]["score"] if score_distribution else None
        
        # Calculate average goals per game
        average_goals = round(total_goals / len(games), 1)
        
        return {
            "total_games": len(games),
            "score_distribution": score_distribution,
            "most_common_score": most_common_score,
            "average_goals_per_game": average_goals
        }

@app.get("/api/leagues/{league_code}/home-away-stats")
async def get_home_away_stats(league_code: str):
    with SessionLocal() as session:
        # Get league
        league = session.query(League).filter(League.name == league_code).first()
        if not league:
            raise HTTPException(status_code=404, detail="League not found")
        
        # Get all games with scores
        games = session.query(Game).filter(
            Game.league_id == league.id,
            Game.home_score.isnot(None),
            Game.away_score.isnot(None)
        ).all()
        
        if not games:
            return {
                "total_games": 0,
                "home_wins": 0,
                "away_wins": 0,
                "draws": 0,
                "home_win_percentage": 0,
                "away_win_percentage": 0,
                "draw_percentage": 0
            }
        
        # Calculate home vs away stats
        home_wins = 0
        away_wins = 0
        draws = 0
        
        for game in games:
            if game.home_score > game.away_score:
                home_wins += 1
            elif game.home_score < game.away_score:
                away_wins += 1
            else:
                draws += 1
        
        total_games = len(games)
        home_win_pct = round((home_wins / total_games) * 100, 1)
        away_win_pct = round((away_wins / total_games) * 100, 1)
        draw_pct = round((draws / total_games) * 100, 1)
        
        return {
            "total_games": total_games,
            "home_wins": home_wins,
            "away_wins": away_wins,
            "draws": draws,
            "home_win_percentage": home_win_pct,
            "away_win_percentage": away_win_pct,
            "draw_percentage": draw_pct
        }

@app.get("/api/leagues/{league_code}/venue-stats")
async def get_venue_stats(league_code: str):
    with SessionLocal() as session:
        # Get league
        league = session.query(League).filter(League.name == league_code).first()
        if not league:
            raise HTTPException(status_code=404, detail="League not found")
        
        # Get all games with venue data
        games = session.query(Game).filter(
            Game.league_id == league.id,
            Game.venue.isnot(None),
            Game.venue != ""
        ).all()
        
        if not games:
            return {
                "total_games": 0,
                "venues": [],
                "most_used_venue": None,
                "total_unique_venues": 0
            }
        
        # Count games by venue
        venue_counts = {}
        for game in games:
            venue = game.venue.strip()
            if venue:
                venue_counts[venue] = venue_counts.get(venue, 0) + 1
        
        # Convert to list and sort by frequency
        venues = [
            {"venue": venue, "games": count, "percentage": round((count / len(games)) * 100, 1)}
            for venue, count in venue_counts.items()
        ]
        venues.sort(key=lambda x: x["games"], reverse=True)
        
        # Find most used venue
        most_used_venue = venues[0]["venue"] if venues else None
        
        return {
            "total_games": len(games),
            "venues": venues,
            "most_used_venue": most_used_venue,
            "total_unique_venues": len(venues)
        }

@app.get("/api/leagues/{league_code}/player-stats")
async def get_player_stats(league_code: str, stat_type: str = "scoring", limit: int = 20):
    with SessionLocal() as session:
        # Get league
        league = session.query(League).filter(League.name == league_code).first()
        if not league:
            raise HTTPException(status_code=404, detail="League not found")
        
        # Import scrapers
        from player_stats_scraper import (
            scrape_nhl_player_stats,
            scrape_premier_league_player_stats,
            scrape_nfl_player_stats,
            scrape_nba_player_stats
        )
        
        # Call the appropriate scraper with fallback to mock data
        try:
            if league_code == "NHL":
                players = scrape_nhl_player_stats(stat_type, limit)
            elif league_code == "PREMIER_LEAGUE":
                players = scrape_premier_league_player_stats(stat_type, limit)
            elif league_code == "NFL":
                players = scrape_nfl_player_stats(stat_type, limit)
            elif league_code == "NBA":
                players = scrape_nba_player_stats(limit)
            else:
                players = []
            
            # If scraper returns empty data, use fallback mock data
            if not players:
                print(f"⚠️ Scraper returned empty data for {league_code}, using fallback data")
                if league_code == "NHL":
                    players = [
                        {"name": "Connor McDavid", "team": "EDM", "position": "C", "goals": 12, "assists": 18, "points": 30},
                        {"name": "Leon Draisaitl", "team": "EDM", "position": "C", "goals": 8, "assists": 15, "points": 23},
                        {"name": "Nathan MacKinnon", "team": "COL", "position": "C", "goals": 10, "assists": 12, "points": 22},
                        {"name": "Artemi Panarin", "team": "NYR", "position": "LW", "goals": 9, "assists": 14, "points": 23},
                        {"name": "David Pastrnak", "team": "BOS", "position": "RW", "goals": 11, "assists": 8, "points": 19}
                    ]
                elif league_code == "PREMIER_LEAGUE":
                    players = [
                        {"name": "Erling Haaland", "team": "Manchester City", "position": "F", "goals": 8, "assists": 2, "points": 10},
                        {"name": "Mohamed Salah", "team": "Liverpool", "position": "F", "goals": 6, "assists": 4, "points": 10},
                        {"name": "Ollie Watkins", "team": "Aston Villa", "position": "F", "goals": 7, "assists": 1, "points": 8},
                        {"name": "Son Heung-min", "team": "Tottenham", "position": "F", "goals": 5, "assists": 3, "points": 8},
                        {"name": "Bukayo Saka", "team": "Arsenal", "position": "F", "goals": 4, "assists": 2, "points": 6}
                    ]
                elif league_code == "NFL" and stat_type == "passing":
                    players = [
                        {"name": "Josh Allen", "team": "BUF", "position": "QB", "pass_yards": 4306, "pass_touchdowns": 29, "interceptions": 18},
                        {"name": "Dak Prescott", "team": "DAL", "position": "QB", "pass_yards": 4516, "pass_touchdowns": 36, "interceptions": 9},
                        {"name": "Lamar Jackson", "team": "BAL", "position": "QB", "pass_yards": 3678, "pass_touchdowns": 24, "interceptions": 7},
                        {"name": "Tua Tagovailoa", "team": "MIA", "position": "QB", "pass_yards": 4624, "pass_touchdowns": 29, "interceptions": 14},
                        {"name": "Jalen Hurts", "team": "PHI", "position": "QB", "pass_yards": 3858, "pass_touchdowns": 23, "interceptions": 15}
                    ]
                elif league_code == "NBA":
                    players = [
                        {"name": "Luka Dončić", "team": "DAL", "position": "PG", "points_per_game": 33.9, "rebounds_per_game": 9.2, "assists_per_game": 9.8},
                        {"name": "Shai Gilgeous-Alexander", "team": "OKC", "position": "PG", "points_per_game": 30.1, "rebounds_per_game": 5.5, "assists_per_game": 6.2},
                        {"name": "Giannis Antetokounmpo", "team": "MIL", "position": "PF", "points_per_game": 30.4, "rebounds_per_game": 11.5, "assists_per_game": 6.5},
                        {"name": "Jayson Tatum", "team": "BOS", "position": "SF", "points_per_game": 26.9, "rebounds_per_game": 8.1, "assists_per_game": 4.9},
                        {"name": "Anthony Edwards", "team": "MIN", "position": "SG", "points_per_game": 25.9, "rebounds_per_game": 5.4, "assists_per_game": 5.1}
                    ]
        except Exception as e:
            print(f"❌ Error calling scraper for {league_code}: {e}")
            players = []
        
        return {
            "league": league_code,
            "stat_type": stat_type,
            "players": players[:limit]
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
