from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from db.session import Base

class Game(Base):
    __tablename__ = "games"
    
    id = Column(Integer, primary_key=True, index=True)
    game_date = Column(DateTime, nullable=True)
    home_team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    away_team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    home_score = Column(Integer, nullable=True)
    away_score = Column(Integer, nullable=True)
    league_id = Column(Integer, ForeignKey("leagues.id"), nullable=False)
    attendance = Column(String(100), nullable=True)
    venue = Column(String(200), nullable=True)
    referee = Column(String(100), nullable=True)
    
    # Relationships
    home_team = relationship("Team", foreign_keys=[home_team_id])
    away_team = relationship("Team", foreign_keys=[away_team_id])
    league = relationship("League")

    def __repr__(self):
        return f"<Game(id={self.id}, game_date={self.game_date}, home_team_id={self.home_team_id}, away_team_id={self.away_team_id})>"