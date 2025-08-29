from datetime import datetime
from nhl_scraper import fetch_nhl_data
from db.session import Base, engine, SessionLocal
from models import League, Team, Game


def get_or_create_league(session, name: str) -> League:
    league = session.query(League).filter(League.name == name).first()
    if league:
        return league
    league = League(name=name)
    session.add(league)
    session.commit()
    session.refresh(league)
    return league


def get_or_create_team(session, name: str, league_id: int) -> Team:
    team = session.query(Team).filter(Team.name == name, Team.league_id == league_id).first()
    if team:
        return team
    team = Team(name=name, league_id=league_id)
    session.add(team)
    session.commit()
    session.refresh(team)
    return team


if __name__ == "__main__":
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    # Fetch games
    nhl_games = fetch_nhl_data()

    # Persist to Postgres
    with SessionLocal() as session:
        league = get_or_create_league(session, "NHL")

        for g in nhl_games:
            home_team = get_or_create_team(session, g["homeTeam"], league.id)
            away_team = get_or_create_team(session, g["awayTeam"], league.id)

            game = Game(
                date=datetime.utcnow(),
                home_team_id=home_team.id,
                away_team_id=away_team.id,
                home_score=int(g["homeScore"]),
                away_score=int(g["awayScore"]),
                league_id=league.id,
            )
            session.add(game)

        session.commit()

    print("✅ Games scraped and saved to Postgres.")
