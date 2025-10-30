from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from db.session import Base
from datetime import datetime

class PremierLeaguePlayerStats(Base):
    __tablename__ = "premier_league_player_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    league_id = Column(Integer, ForeignKey("leagues.id"), nullable=False)
    season = Column(String(10), nullable=False)  # e.g., "2025-2026"
    
    # Basic stats
    games_played = Column(Integer, default=0)
    games_started = Column(Integer, default=0)
    minutes_played = Column(Integer, default=0)
    minutes_per_game = Column(Float, default=0.0)
    
    # Goals and assists
    goals = Column(Integer, default=0)
    assists = Column(Integer, default=0)
    goals_per_game = Column(Float, default=0.0)
    assists_per_game = Column(Float, default=0.0)
    
    # Shots
    shots = Column(Integer, default=0)
    shots_on_target = Column(Integer, default=0)
    shots_per_game = Column(Float, default=0.0)
    shots_on_target_per_game = Column(Float, default=0.0)
    shot_accuracy = Column(Float, default=0.0)  # shots on target / shots
    
    # Passing
    passes = Column(Integer, default=0)
    passes_completed = Column(Integer, default=0)
    pass_accuracy = Column(Float, default=0.0)
    passes_per_game = Column(Float, default=0.0)
    
    # Key passes and chances created
    key_passes = Column(Integer, default=0)
    chances_created = Column(Integer, default=0)
    
    # Defensive stats
    tackles = Column(Integer, default=0)
    tackles_won = Column(Integer, default=0)
    tackle_accuracy = Column(Float, default=0.0)
    interceptions = Column(Integer, default=0)
    clearances = Column(Integer, default=0)
    blocks = Column(Integer, default=0)
    
    # Discipline
    yellow_cards = Column(Integer, default=0)
    red_cards = Column(Integer, default=0)
    fouls_committed = Column(Integer, default=0)
    fouls_drawn = Column(Integer, default=0)
    
    # Offsides
    offsides = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    player = relationship("Player", back_populates="premier_league_stats")
    league = relationship("League", back_populates="premier_league_player_stats")

