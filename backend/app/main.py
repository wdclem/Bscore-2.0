from datetime import datetime
from db.session import Base, engine
from sqlalchemy.orm import sessionmaker
from league_scrapper import fetch_nfl_data, fetch_nhl_data, fetch_nba_data, fetch_mlb_data
from premier_league_scrapper import fetch_premier_league_data
from models import League, Team, Game, Player, PlayerStats
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

def get_or_create_player(session, name: str, team_id: int, league_id: int) -> Player:
    """Get or create a player"""
    player = session.query(Player).filter(
        Player.name == name,
        Player.team_id == team_id,
        Player.league_id == league_id
    ).first()
    
    if player:
        return player
    
    player = Player(
        name=name,
        team_id=team_id,
        league_id=league_id
    )
    session.add(player)
    session.flush()
    return player

def save_player_stats(session, league_id: int, season: str, stat_type: str, stats_data: list):
    """Save player stats to database"""
    from player_stats_scraper import (
        scrape_nhl_player_stats,
        scrape_premier_league_player_stats,
        scrape_nfl_player_stats,
        scrape_nba_player_stats
    )
    
    print(f"🔄 Saving {stat_type} stats for league {league_id}, season {season}")
    
    # Get the league name
    league = session.query(League).filter(League.id == league_id).first()
    if not league:
        print(f"❌ League with id {league_id} not found")
        return
    
    # Clear existing stats for this league/season/stat_type
    session.query(PlayerStats).filter(
        PlayerStats.league_id == league_id,
        PlayerStats.season == season,
        PlayerStats.stat_type == stat_type
    ).delete()
    
    saved_count = 0
    for stat in stats_data:
        # Get or create player
        player = get_or_create_player(session, stat['name'], stat.get('team_id', 1), league_id)
        
        # Create player stats record
        player_stat = PlayerStats(
            player_id=player.id,
            league_id=league_id,
            season=season,
            stat_type=stat_type,
            goals=stat.get('goals', 0),
            assists=stat.get('assists', 0),
            points=stat.get('points', 0),
            pass_yards=stat.get('pass_yards', 0),
            pass_touchdowns=stat.get('pass_touchdowns', 0),
            interceptions=stat.get('interceptions', 0),
            rush_yards=stat.get('rush_yards', 0),
            rush_touchdowns=stat.get('rush_touchdowns', 0),
            receiving_yards=stat.get('receiving_yards', 0),
            receiving_touchdowns=stat.get('receiving_touchdowns', 0),
            points_per_game=stat.get('points_per_game', 0.0),
            rebounds_per_game=stat.get('rebounds_per_game', 0.0),
            assists_per_game=stat.get('assists_per_game', 0.0),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        session.add(player_stat)
        saved_count += 1
    
    session.commit()
    print(f"✅ Saved {saved_count} player stats for {league.name}")

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

def run_player_stats_scrape():
    """Run player stats scraping for all leagues"""
    from datetime import datetime
    
    print("\n🔄 Starting player stats scraping...")
    current_year = datetime.now().year
    season = f"{current_year}-{current_year + 1}"
    
    with SessionLocal() as session:
        # Get all leagues
        leagues = session.query(League).all()
        
        for league in leagues:
            print(f"\n📊 Scraping player stats for {league.name}...")
            
            try:
                if league.name == "NHL":
                    from player_stats_scraper import scrape_nhl_player_stats
                    stats_data = scrape_nhl_player_stats('scoring', 20)
                    if stats_data:
                        save_player_stats(session, league.id, season, 'scoring', stats_data)
                
                elif league.name == "PREMIER_LEAGUE":
                    from player_stats_scraper import scrape_premier_league_player_stats
                    stats_data = scrape_premier_league_player_stats('scoring', 20)
                    if stats_data:
                        save_player_stats(session, league.id, season, 'scoring', stats_data)
                
                elif league.name == "NFL":
                    from player_stats_scraper import scrape_nfl_player_stats
                    # Scrape passing stats for NFL
                    stats_data = scrape_nfl_player_stats('passing', 20)
                    if stats_data:
                        save_player_stats(session, league.id, season, 'passing', stats_data)
                
                elif league.name == "NBA":
                    from player_stats_scraper import scrape_nba_player_stats
                    stats_data = scrape_nba_player_stats(20)
                    if stats_data:
                        save_player_stats(session, league.id, season, 'basketball', stats_data)
                
                print(f"✅ {league.name} player stats updated")
                
            except Exception as e:
                print(f"❌ Error scraping {league.name} player stats: {e}")
                continue
    
    print("\n🎉 Player stats scraping complete!")

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
            kwargs={"leagues": ["NFL", "NBA", "NHL"]}  # MLB deactivated
        )

        # Premier League in Helsinki evening (e.g., 18:00, 20:00)
        scheduler.add_job(
            run_scrape,
            CronTrigger(hour='16,18,19,22,0,1', minute=0, timezone=helsinki_tz),
            id='scraper_pl_evening',
            kwargs={"leagues": ["PREMIER_LEAGUE"]}
        )

        # Player stats scraping - twice daily at midnight and 10 AM Helsinki time
        scheduler.add_job(
            run_player_stats_scrape,
            CronTrigger(hour='0,10', minute=0, timezone=helsinki_tz),
            id='scraper_player_stats',
            kwargs={}
        )

        print("🕐 Scheduler started - US leagues at 06/07/08/12, PL at 18/20, Player stats at 00/10 Helsinki time")
        scheduler.start()

if __name__ == "__main__":
    main()