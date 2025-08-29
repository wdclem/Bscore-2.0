import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Read Postgres URL from environment variable
DATABASE_URL = os.getenv("POSTGRES_URL", "postgresql://user:password@localhost:5432/nhl_db")

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL, echo=True)  # echo=True prints SQL for debugging

# Create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()
