from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from db.session import Base

class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"))
    league_id = Column(Integer, ForeignKey("leagues.id"))

    team = relationship("Team", back_populates="players")
    league = relationship("League", back_populates="players")

    def __repr__(self):
        return f"<Player(id={self.id}, name='{self.name}', team_id={self.team_id}, league_id={self.league_id})>"
