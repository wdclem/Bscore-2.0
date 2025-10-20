from datetime import datetime
from db.session import Base, engine
from sqlalchemy.orm import sessionmaker
from league_scrapper import fetch_nfl_data, fetch_nhl_data, fetch_nba_data, fetch_mlb_data
from premier_league_scrapper import fetch_premier_league_data
from models import League, Team, Game
import argparse
import pytz

SessionLocal = sessionmaker(bind=engine)

def get_or_create_league(session, name: str) -> League:
    name = name.strip().upper()
    league = session.query(League).filter(League.name == name).first()
    if league:
        return league
    league = League(name=name)
    session.add(league)
    session.flush()
    return league

def get_or_create_team(session, name: str, league_id: int, logo_url: str = None) -> Team:
    name = name.strip()
    team = session.query(Team).filter(Team.name == name, Team.league_id == league_id).first()
    if team:
        if logo_url and team.logo_url != logo_url:
            team.logo_url = logo_url
        return team
    team = Team(name=name, league_id=league_id, logo_url=logo_url)
    session.add(team)
    session.flush()
    return team

def get_or_create_game(session, home_team_id: int, away_team_id: int, game_date: datetime, league_id: int, home_score: int, away_score: int, attendance: str = None, venue: str = None, referee: str = None) -> Game:
    # Check if game already exists
    existing_game = session.query(Game).filter(
        Game.home_team_id == home_team_id,
        Game.away_team_id == away_team_id,
        Game.game_date == game_date,
        Game.league_id == league_id
    ).first()
    
    if existing_game:
        # Update scores if they've changed
        if existing_game.home_score != home_score or existing_game.away_score != away_score:
            existing_game.home_score = home_score
            existing_game.away_score = away_score
            print(f"  🔄 Updated game: {existing_game.home_team.name} vs {existing_game.away_team.name}: {home_score}-{away_score}")
        else:
            print(f"  ⏭️  Skipped existing game: {existing_game.home_team.name} vs {existing_game.away_team.name}")
        return existing_game
    
    # Create new game with ALL data
    game = Game(
        game_date=game_date,
        home_team_id=home_team_id,
        away_team_id=away_team_id,
        home_score=home_score,
        away_score=away_score,
        league_id=league_id,
        attendance=attendance,  # ← Include in creation
        venue=venue,            # ← Include in creation
        referee=referee,        # ← Include in creation
    )
    session.add(game)
    session.flush()
    return game

def run_scrape(leagues: list[str] = None):
    Base.metadata.create_all(bind=engine)
    LEAGUE_FETCHERS = {
        "NFL": fetch_nfl_data,
        "NHL": fetch_nhl_data,
        "NBA": fetch_nba_data,
        "MLB": fetch_mlb_data,
        "PREMIER_LEAGUE": fetch_premier_league_data,
    }

    if leagues:
        target_items = [(name, LEAGUE_FETCHERS[name]) for name in leagues if name in LEAGUE_FETCHERS]
    else:
        target_items = list(LEAGUE_FETCHERS.items())

    for league_name, fetcher in target_items:
        with SessionLocal() as session:
            print(f"\n Processing {league_name}...")
            games = fetcher()
            league = get_or_create_league(session, league_name)
            print(f" Found {len(games)} games for {league.name}")

            new_games = 0
            updated_games = 0
            skipped_games = 0

            for g in games:
                game_date = g.get('game_date')
                if not game_date:
                    print(f"⚠️  No date found for {g['homeTeam']} vs {g['awayTeam']}, skipping...")
                    continue
                
                home_team = get_or_create_team(session, g["homeTeam"], league.id, g.get("homeLogo"))
                away_team = get_or_create_team(session, g["awayTeam"], league.id, g.get("awayLogo"))
                
                # Check if this is a new or existing game
                existing_game = session.query(Game).filter(
                    Game.home_team_id == home_team.id,
                    Game.away_team_id == away_team.id,
                    Game.game_date == game_date,
                    Game.league_id == league.id
                ).first()
                
                if existing_game:
                    # Always update the additional data, regardless of score changes
                    existing_game.attendance = g.get("attendance")
                    existing_game.venue = g.get("venue") 
                    existing_game.referee = g.get("referee")
                    
                    # Only update scores if they've changed
                    if existing_game.home_score != int(g["homeScore"]) or existing_game.away_score != int(g["awayScore"]):
                        existing_game.home_score = int(g["homeScore"])
                        existing_game.away_score = int(g["awayScore"])
                        updated_games += 1
                        print(f"  🔄 Updated: {home_team.name} vs {away_team.name}: {g['homeScore']}-{g['awayScore']} at {g.get('venue', 'Unknown')}")
                    else:
                        skipped_games += 1
                        print(f"  ⏭️  Skipped: {home_team.name} vs {away_team.name}")
                else:
                    # Create new game with all data
                    game = get_or_create_game(
                        session, 
                        home_team.id, 
                        away_team.id, 
                        game_date, 
                        league.id, 
                        int(g["homeScore"]), 
                        int(g["awayScore"]),
                        g.get("attendance"),  # ← Pass the data
                        g.get("venue"),       # ← Pass the data
                        g.get("referee")      # ← Pass the data
                    )
                    new_games += 1
                    print(f"  ➕ New: {home_team.name} vs {away_team.name}: {g['homeScore']}-{g['awayScore']} at {g.get('venue', 'Unknown')}")

            session.commit()
            print(f"✅ {league.name}: {new_games} new, {updated_games} updated, {skipped_games} skipped")
    
    print("\n🎉 Scraping complete!")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--once", action="store_true", help="Run scraper once and exit")
    parser.add_argument("--league", action="append", help="Limit to specific league(s). Can be used multiple times.")
    args = parser.parse_args()

    if args.once:
        run_scrape(args.league)
    else:
        from apscheduler.schedulers.blocking import BlockingScheduler
        from apscheduler.triggers.cron import CronTrigger
        
        # Helsinki timezone
        helsinki_tz = pytz.timezone('Europe/Helsinki')
        
        scheduler = BlockingScheduler(timezone=helsinki_tz)
        
        # US leagues in Helsinki morning (e.g., 06:00, 07:00, 08:00, 12:00)
        scheduler.add_job(
            run_scrape,
            CronTrigger(hour='6,7,8,10,12', minute=0, timezone=helsinki_tz),
            id='scraper_us_morning',
            kwargs={"leagues": ["NFL", "NBA", "MLB", "NHL"]}
        )

        # Premier League in Helsinki evening (e.g., 18:00, 20:00)
        scheduler.add_job(
            run_scrape,
            CronTrigger(hour='16,18,19,22,0,1', minute=0, timezone=helsinki_tz),
            id='scraper_pl_evening',
            kwargs={"leagues": ["PREMIER_LEAGUE"]}
        )

        print("🕐 Scheduler started - US leagues at 06/07/08/12, PL at 18/20 Helsinki time")
        scheduler.start()

if __name__ == "__main__":
    main()