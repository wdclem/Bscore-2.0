from datetime import datetime
from db.session import Base, engine
from sqlalchemy.orm import sessionmaker
from league_scrapper import fetch_nfl_data, fetch_nhl_data, fetch_nba_data, fetch_mlb_data
from models import League, Team, Game
import argparse

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

def get_or_create_game(session, home_team_id: int, away_team_id: int, game_date: datetime, league_id: int, home_score: int, away_score: int) -> Game:
    game = session.query(Game).filter(
        Game.home_team_id == home_team_id,
        Game.away_team_id == away_team_id,
        Game.game_date == game_date,
        Game.league_id == league_id
    ).first()
    if game:
        return game
    game = Game(
        game_date=game_date,
        home_team_id=home_team_id,
        away_team_id=away_team_id,
        home_score=home_score,
        away_score=away_score,
        league_id=league_id,
    )
    session.add(game)
    session.flush()
    return game

def run_scrape():
    Base.metadata.create_all(bind=engine)
    LEAGUE_FETCHERS = {
        "NFL": fetch_nfl_data,
        "NHL": fetch_nhl_data,
        "NBA": fetch_nba_data,
        "MLB": fetch_mlb_data,
    }

    for league_name, fetcher in LEAGUE_FETCHERS.items():
        with SessionLocal() as session:
            games = fetcher()
            league = get_or_create_league(session, league_name)
            print(f"Processing {league.name} (id={league.id}), games={len(games)}")

            for g in games:
                game_date = g.get('game_date')
                if not game_date:
                    print(f"⚠️  No date found for {g['homeTeam']} vs {g['awayTeam']}, skipping...")
                    continue
                home_team = get_or_create_team(session, g["homeTeam"], league.id, g.get("homeLogo"))
                away_team = get_or_create_team(session, g["awayTeam"], league.id, g.get("awayLogo"))
                game = get_or_create_game(session, home_team.id, away_team.id, game_date, league.id, int(g["homeScore"]), int(g["awayScore"]))
                print(f"  + game: {home_team.name} vs {away_team.name} -> league_id={league.id}")

            session.commit()
    print("✅ Scheduled scrape complete")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--once", action="store_true", help="Run scraper once and exit")
    args = parser.parse_args()

    if args.once:
        run_scrape()
    else:
        from apscheduler.schedulers.blocking import BlockingScheduler
        scheduler = BlockingScheduler()
        scheduler.add_job(run_scrape, "interval", hours=6, next_run_time=datetime.utcnow())
        print("🕐 Scheduler started - running every hour")
        scheduler.start()

if __name__ == "__main__":
    main()