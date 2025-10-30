from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from db.session import Base
from datetime import datetime

class Standing(Base):
    __tablename__ = 'standings'
    
    id = Column(Integer, primary_key=True, index=True)
    league_id = Column(Integer, ForeignKey('leagues.id'), nullable=False)
    team_id = Column(Integer, ForeignKey('teams.id'), nullable=False)
    
    # Common fields across all leagues
    wins = Column(Integer, default=0)
    losses = Column(Integer, default=0)
    
    # League-specific fields (nullable for leagues that don't use them)
    draws = Column(Integer, nullable=True)  # Soccer
    ot_losses = Column(Integer, nullable=True)  # NHL
    ties = Column(Integer, nullable=True)  # NFL (rare but exists)
    
    # Points/Rankings
    points = Column(Integer, nullable=True)  # NHL, Soccer
    win_pct = Column(Float, nullable=True)  # NFL, NBA
    points_pct = Column(Float, nullable=True)  # NHL
    
    # Scoring stats
    goals_for = Column(Integer, nullable=True)  # Hockey, Soccer
    goals_against = Column(Integer, nullable=True)  # Hockey, Soccer
    points_for = Column(Integer, nullable=True)  # NFL
    points_against = Column(Integer, nullable=True)  # NFL
    goal_diff = Column(Integer, nullable=True)  # Soccer, Hockey
    point_diff = Column(Integer, nullable=True)  # NFL
    
    # Division/Conference info
    division = Column(String, nullable=True)
    conference = Column(String, nullable=True)
    
    # Metadata
    games_played = Column(Integer, default=0)
    season = Column(String, nullable=True)  # e.g., "2025-26"
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    league = relationship("League", back_populates="standings")
    team = relationship("Team", back_populates="standings")

