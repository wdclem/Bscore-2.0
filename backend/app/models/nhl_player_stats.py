from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from db.session import Base
from datetime import datetime

class NHLPlayerStats(Base):
    __tablename__ = "nhl_player_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    league_id = Column(Integer, ForeignKey("leagues.id"), nullable=False)
    season = Column(String(10), nullable=False)  # e.g., "2025-2026"
    
    # Basic stats
    games_played = Column(Integer, default=0)
    goals = Column(Integer, default=0)
    assists = Column(Integer, default=0)
    points = Column(Integer, default=0)  # goals + assists
    plus_minus = Column(Integer, default=0)
    penalty_minutes = Column(Integer, default=0)
    
    # Advanced stats
    power_play_goals = Column(Integer, default=0)
    power_play_assists = Column(Integer, default=0)
    power_play_points = Column(Integer, default=0)
    short_handed_goals = Column(Integer, default=0)
    short_handed_assists = Column(Integer, default=0)
    short_handed_points = Column(Integer, default=0)
    game_winning_goals = Column(Integer, default=0)
    overtime_goals = Column(Integer, default=0)
    shots = Column(Integer, default=0)
    shooting_percentage = Column(Float, default=0.0)
    
    # Time on ice (in minutes)
    time_on_ice = Column(Float, default=0.0)
    average_time_on_ice = Column(Float, default=0.0)
    
    # Faceoffs
    faceoff_wins = Column(Integer, default=0)
    faceoff_losses = Column(Integer, default=0)
    faceoff_percentage = Column(Float, default=0.0)
    
    # Blocks and hits
    blocks = Column(Integer, default=0)
    hits = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    player = relationship("Player", back_populates="nhl_stats")
    league = relationship("League", back_populates="nhl_player_stats")

