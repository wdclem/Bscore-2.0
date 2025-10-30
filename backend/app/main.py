from datetime import datetime
from db.session import Base, engine
from sqlalchemy.orm import sessionmaker
from league_scrapper import fetch_nfl_data, fetch_nhl_data, fetch_nba_data
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
    print(f"\n🔄 Starting scrape at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - leagues: {leagues or 'all'}")
    Base.metadata.create_all(bind=engine)
    LEAGUE_FETCHERS = {
        "NFL": fetch_nfl_data,
        "NHL": fetch_nhl_data,
        "NBA": fetch_nba_data,
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
    """Run league-specific player stats scraping"""
    print(f"\n🔄 Starting league-specific player stats scraping at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}...")
    
    try:
        # NHL player stats (skaters and goalies)
        from nhl_player_stats_scraper import run_nhl_player_stats_scrape
        run_nhl_player_stats_scrape()
    except Exception as e:
        print(f"❌ Error scraping NHL player stats: {e}")
    
    try:
        # NBA player stats
        from nba_player_stats_scraper import run_nba_player_stats_scrape
        run_nba_player_stats_scrape()
    except Exception as e:
        print(f"❌ Error scraping NBA player stats: {e}")
    
    try:
        # Premier League player stats
        from premier_league_player_stats_scraper import run_premier_league_player_stats_scrape
        run_premier_league_player_stats_scrape()
    except Exception as e:
        print(f"❌ Error scraping Premier League player stats: {e}")
    
    # Note: NFL player stats scraper not implemented yet due to complexity of different positions
    print("ℹ️  NFL player stats scraper not implemented yet - positions are too diverse")
    
    print("🎉 League-specific player stats scraping complete!")

def run_standings_scrape():
    """Run standings scraping for all leagues"""
    print(f"\n🔄 Starting standings scraping at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}...")
    from standings_scraper import run_standings_scrape as scrape_standings
    scrape_standings()

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
        from apscheduler.triggers.date import DateTrigger
        import logging
        
        # Helsinki timezone
        helsinki_tz = pytz.timezone('Europe/Helsinki')
        
        # Configure logging for scheduler
        logging.basicConfig(level=logging.INFO)
        
        # Ensure missed runs are handled gracefully
        scheduler = BlockingScheduler(
            timezone=helsinki_tz,
            job_defaults={
                'misfire_grace_time': 6 * 60 * 60,  # allow 6h late execution
                'coalesce': True,                   # coalesce multiple missed runs into one
                'max_instances': 1,
            }
        )
        
        # US leagues in Helsinki morning (e.g., 06:00, 07:00, 08:00, 12:00)
        scheduler.add_job(
            run_scrape,
            CronTrigger(hour='6,7,8,10,12,13', minute=0, timezone=helsinki_tz),
            id='scraper_us_morning',
            kwargs={"leagues": ["NFL", "NBA", "NHL"]}
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

        # Standings scraping - daily at 2 AM Helsinki time
        scheduler.add_job(
            run_standings_scrape,
            CronTrigger(hour='2', minute=0, timezone=helsinki_tz),
            id='scraper_standings',
            kwargs={}
        )

        print("🕐 Scheduler started - US leagues at 06/07/08/10/12/13, PL at 16/18/19/22/0/1, Player stats at 00/10, Standings at 02 Helsinki time")
        print("📅 Current Helsinki time:", datetime.now(helsinki_tz).strftime('%Y-%m-%d %H:%M:%S %Z'))
        print("⏰ Scheduled jobs:")
        for job in scheduler.get_jobs():
            print(f"   - {job.id}: {job.trigger}")

        # Immediate catch-up run so we don't miss data after downtime
        try:
            scheduler.add_job(
                run_scrape,
                DateTrigger(run_date=datetime.now(helsinki_tz)),
                id='scraper_catchup_now',
                kwargs={"leagues": ["NFL", "NBA", "NHL"]},
                replace_existing=True,
            )
            print("▶️ Scheduled immediate catch-up run for NFL/NBA/NHL")
        except Exception as e:
            print(f"⚠️ Failed to schedule immediate catch-up: {e}")
        scheduler.start()

if __name__ == "__main__":
    main()