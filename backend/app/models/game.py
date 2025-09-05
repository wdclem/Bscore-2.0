from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from db.session import Base

class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    game_date = Column(DateTime, nullable=False)
    home_team_id = Column(Integer, ForeignKey("teams.id"))
    away_team_id = Column(Integer, ForeignKey("teams.id"))
    home_score = Column(Integer)
    away_score = Column(Integer)
    league_id = Column(Integer, ForeignKey("leagues.id"))

    # Add unique constraint to prevent duplicate games
    __table_args__ = (
        UniqueConstraint('league_id', 'home_team_id', 'away_team_id', 'game_date', name='unique_game'),
    )

    league = relationship("League", back_populates="games")
    home_team = relationship("Team", back_populates="home_games", foreign_keys=[home_team_id])
    away_team = relationship("Team", back_populates="away_games", foreign_keys=[away_team_id])

    def __repr__(self):
        return f"<Game(id={self.id}, game_date={self.game_date}, home_team_id={self.home_team_id}, away_team_id={self.away_team_id})>"