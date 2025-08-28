from sqlalchemy.orm import relationship
from db.session import Base

class League(Base):
    __tablename__ = "leagues"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    teams = relationship("Team", back_populates="league")
    games = relationship("Game", back_populates="league")
    players = relationship("Player", back_populates="league")

    def __repr__(self):
        return f"<League(id={self.id}, name='{self.name}')>"