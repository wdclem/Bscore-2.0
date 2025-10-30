from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from db.session import Base

class League(Base):
    __tablename__ = "leagues"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    teams = relationship("Team", back_populates="league")
    games = relationship("Game", back_populates="league")
    players = relationship("Player", back_populates="league")
    standings = relationship("Standing", back_populates="league")
    player_stats = relationship("PlayerStats", back_populates="league")
    nhl_player_stats = relationship("NHLPlayerStats", back_populates="league")
    nhl_goalie_stats = relationship("NHLGoalieStats", back_populates="league")
    nba_player_stats = relationship("NBAPlayerStats", back_populates="league")
    premier_league_player_stats = relationship("PremierLeaguePlayerStats", back_populates="league")

    def __repr__(self):
        return f"<League(id={self.id}, name='{self.name}')>"