from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from db.session import Base
from datetime import datetime

class NBAPlayerStats(Base):
    __tablename__ = "nba_player_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    league_id = Column(Integer, ForeignKey("leagues.id"), nullable=False)
    season = Column(String(10), nullable=False)  # e.g., "2025-2026"
    
    # Basic stats
    games_played = Column(Integer, default=0)
    games_started = Column(Integer, default=0)
    minutes_played = Column(Float, default=0.0)
    
    # Field goals
    field_goals = Column(Integer, default=0)
    field_goal_attempts = Column(Integer, default=0)
    field_goal_percentage = Column(Float, default=0.0)
    
    # Three pointers
    three_pointers = Column(Integer, default=0)
    three_point_attempts = Column(Integer, default=0)
    three_point_percentage = Column(Float, default=0.0)
    
    # Two pointers
    two_pointers = Column(Integer, default=0)
    two_point_attempts = Column(Integer, default=0)
    two_point_percentage = Column(Float, default=0.0)
    
    # Free throws
    free_throws = Column(Integer, default=0)
    free_throw_attempts = Column(Integer, default=0)
    free_throw_percentage = Column(Float, default=0.0)
    
    # Effective field goal percentage
    effective_field_goal_percentage = Column(Float, default=0.0)
    
    # Rebounds
    offensive_rebounds = Column(Integer, default=0)
    defensive_rebounds = Column(Integer, default=0)
    total_rebounds = Column(Integer, default=0)
    
    # Assists and turnovers
    assists = Column(Integer, default=0)
    steals = Column(Integer, default=0)
    blocks = Column(Integer, default=0)
    turnovers = Column(Integer, default=0)
    personal_fouls = Column(Integer, default=0)
    
    # Points
    points = Column(Integer, default=0)
    
    # Advanced stats (per game)
    points_per_game = Column(Float, default=0.0)
    rebounds_per_game = Column(Float, default=0.0)
    assists_per_game = Column(Float, default=0.0)
    steals_per_game = Column(Float, default=0.0)
    blocks_per_game = Column(Float, default=0.0)
    turnovers_per_game = Column(Float, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    player = relationship("Player", back_populates="nba_stats")
    league = relationship("League", back_populates="nba_player_stats")

