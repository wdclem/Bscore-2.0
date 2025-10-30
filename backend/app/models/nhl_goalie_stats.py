from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from db.session import Base
from datetime import datetime

class NHLGoalieStats(Base):
    __tablename__ = "nhl_goalie_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    league_id = Column(Integer, ForeignKey("leagues.id"), nullable=False)
    season = Column(String(10), nullable=False)  # e.g., "2025-2026"
    
    # Basic stats
    games_played = Column(Integer, default=0)
    games_started = Column(Integer, default=0)
    wins = Column(Integer, default=0)
    losses = Column(Integer, default=0)
    ties = Column(Integer, default=0)
    overtime_losses = Column(Integer, default=0)
    
    # Goals against
    goals_against = Column(Integer, default=0)
    goals_against_average = Column(Float, default=0.0)
    
    # Saves
    saves = Column(Integer, default=0)
    save_percentage = Column(Float, default=0.0)
    
    # Shutouts
    shutouts = Column(Integer, default=0)
    
    # Time on ice (in minutes)
    time_on_ice = Column(Float, default=0.0)
    time_on_ice_per_game = Column(Float, default=0.0)
    
    # Penalties
    penalty_minutes = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    player = relationship("Player", back_populates="nhl_goalie_stats")
    league = relationship("League", back_populates="nhl_goalie_stats")

