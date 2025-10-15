"""
Script to load standings data into the database
"""

from db.session import Base, engine
from sqlalchemy.orm import sessionmaker
from models import League, Team, Standing
from standings_scraper import scrape_nhl_standings, scrape_premier_league_standings, scrape_nfl_standings
from datetime import datetime

SessionLocal = sessionmaker(bind=engine)

def get_or_create_team(session, team_name, league):
    """Get existing team or create if doesn't exist"""
    team = session.query(Team).filter(
        Team.name == team_name,
        Team.league_id == league.id
    ).first()
    
    if not team:
        team = Team(name=team_name, league_id=league.id)
        session.add(team)
        session.flush()
    
    return team

def load_nhl_standings():
    """Load NHL standings"""
    with SessionLocal() as session:
        league = session.query(League).filter(League.name == 'NHL').first()
        if not league:
            print("❌ NHL league not found in database")
            return
        
        standings_data = scrape_nhl_standings()
        
        # Clear existing standings for this league
        session.query(Standing).filter(Standing.league_id == league.id).delete()
        
        for data in standings_data:
            # Get or create team
            team = get_or_create_team(session, data['team_name'], league)
            
            # Create standing entry
            standing = Standing(
                league_id=league.id,
                team_id=team.id,
                wins=data.get('wins', 0),
                losses=data.get('losses', 0),
                ot_losses=data.get('ot_losses', 0),
                points=data.get('points', 0),
                points_pct=data.get('points_pct', 0.0),
                goals_for=data.get('goals_for', 0),
                goals_against=data.get('goals_against', 0),
                goal_diff=data.get('goal_diff', 0),
                division=data.get('division'),
                season='2025-26',
                games_played=data.get('wins', 0) + data.get('losses', 0) + data.get('ot_losses', 0)
            )
            session.add(standing)
        
        session.commit()
        print(f"✅ Loaded {len(standings_data)} NHL standings")

def load_premier_league_standings():
    """Load Premier League standings"""
    with SessionLocal() as session:
        league = session.query(League).filter(League.name == 'PREMIER_LEAGUE').first()
        if not league:
            print("❌ Premier League not found in database")
            return
        
        standings_data = scrape_premier_league_standings()
        
        # Clear existing standings for this league
        session.query(Standing).filter(Standing.league_id == league.id).delete()
        
        for data in standings_data:
            # Get or create team
            team = get_or_create_team(session, data['team_name'], league)
            
            # Create standing entry
            standing = Standing(
                league_id=league.id,
                team_id=team.id,
                wins=data.get('wins', 0),
                draws=data.get('draws', 0),
                losses=data.get('losses', 0),
                points=data.get('points', 0),
                goals_for=data.get('goals_for', 0),
                goals_against=data.get('goals_against', 0),
                goal_diff=data.get('goal_diff', 0),
                division=data.get('division'),
                season='2024-25',
                games_played=data.get('games_played', 0)
            )
            session.add(standing)
        
        session.commit()
        print(f"✅ Loaded {len(standings_data)} Premier League standings")

def load_nfl_standings():
    """Load NFL standings"""
    with SessionLocal() as session:
        league = session.query(League).filter(League.name == 'NFL').first()
        if not league:
            print("❌ NFL league not found in database")
            return
        
        standings_data = scrape_nfl_standings()
        
        # Clear existing standings for this league
        session.query(Standing).filter(Standing.league_id == league.id).delete()
        
        for data in standings_data:
            # Get or create team
            team = get_or_create_team(session, data['team_name'], league)
            
            # Create standing entry
            standing = Standing(
                league_id=league.id,
                team_id=team.id,
                wins=data.get('wins', 0),
                losses=data.get('losses', 0),
                ties=data.get('ties', 0),
                win_pct=data.get('win_pct', 0.0),
                points_for=data.get('points_for', 0),
                points_against=data.get('points_against', 0),
                point_diff=data.get('point_diff', 0),
                division=data.get('division'),
                season='2025',
                games_played=data.get('wins', 0) + data.get('losses', 0) + data.get('ties', 0)
            )
            session.add(standing)
        
        session.commit()
        print(f"✅ Loaded {len(standings_data)} NFL standings")

def load_all_standings():
    """Load standings for all leagues"""
    print("\n🏒 Loading NHL standings...")
    load_nhl_standings()
    
    print("\n⚽ Loading Premier League standings...")
    load_premier_league_standings()
    
    print("\n🏈 Loading NFL standings...")
    load_nfl_standings()
    
    print("\n🎉 All standings loaded successfully!")

if __name__ == "__main__":
    load_all_standings()

