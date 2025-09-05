from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from db.session import Base

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    league_id = Column(Integer, ForeignKey("leagues.id"))
    logo_url = Column(String)

    league = relationship("League", back_populates="teams")
    home_games = relationship("Game", back_populates="home_team", foreign_keys='Game.home_team_id')
    away_games = relationship("Game", back_populates="away_team", foreign_keys='Game.away_team_id')
    players = relationship("Player", back_populates="team")

    def __repr__(self):
        return f"<Team(id={self.id}, name='{self.name}', league_id={self.league_id})>"