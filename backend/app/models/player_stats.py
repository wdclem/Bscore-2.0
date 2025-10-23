from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Text
from sqlalchemy.orm import relationship
from db.session import Base

class PlayerStats(Base):
    __tablename__ = "player_stats"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"))
    league_id = Column(Integer, ForeignKey("leagues.id"))
    season = Column(String, nullable=False)  # e.g., "2025-2026"
    stat_type = Column(String, nullable=False)  # e.g., "scoring", "passing", "rushing"
    
    # Common stats
    goals = Column(Integer, default=0)
    assists = Column(Integer, default=0)
    points = Column(Integer, default=0)
    
    # Football stats
    pass_yards = Column(Integer, default=0)
    pass_touchdowns = Column(Integer, default=0)
    interceptions = Column(Integer, default=0)
    rush_yards = Column(Integer, default=0)
    rush_touchdowns = Column(Integer, default=0)
    receiving_yards = Column(Integer, default=0)
    receiving_touchdowns = Column(Integer, default=0)
    
    # Basketball stats
    points_per_game = Column(Float, default=0.0)
    rebounds_per_game = Column(Float, default=0.0)
    assists_per_game = Column(Float, default=0.0)
    
    # Additional stats (stored as JSON string for flexibility)
    additional_stats = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)
    
    # Relationships
    player = relationship("Player", back_populates="stats")
    league = relationship("League", back_populates="player_stats")
    
    def __repr__(self):
        return f"<PlayerStats(id={self.id}, player_id={self.player_id}, league_id={self.league_id}, season='{self.season}', stat_type='{self.stat_type}')>"
