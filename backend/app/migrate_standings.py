"""
Migration script to add standings table to the database
Run this once to create the standings table
"""

from db.session import Base, engine
from models import Standing
import psycopg2
import os

def create_standings_table():
    """Create the standings table"""
    print("Creating standings table...")
    
    # Create tables using SQLAlchemy
    Base.metadata.create_all(bind=engine)
    
    print("✅ Standings table created successfully!")

if __name__ == "__main__":
    create_standings_table()

