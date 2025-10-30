#!/usr/bin/env python3
"""
Standings scraper for all leagues
Scrapes standings data from official sources and stores in database
"""

import requests
from bs4 import BeautifulSoup
from datetime import datetime
import time
import re
from typing import List, Dict, Optional
from db.session import SessionLocal
from models import League, Team, Standing

def make_request_with_retry(url: str, headers: dict = None, max_retries: int = 3) -> Optional[requests.Response]:
    """Make HTTP request with retry logic and rate limiting"""
    if headers is None:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    
    for attempt in range(max_retries):
        try:
            response = requests.get(url, headers=headers, timeout=30)
            if response.status_code == 200:
                return response
            elif response.status_code == 429:  # Rate limited
                wait_time = (2 ** attempt) + (time.time() % 1)
                print(f"⏳ Rate limited, waiting {wait_time:.1f}s...")
                time.sleep(wait_time)
            else:
                print(f"❌ HTTP {response.status_code} for {url}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
        except Exception as e:
            print(f"❌ Request failed (attempt {attempt + 1}): {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
    
    return None

def scrape_nhl_standings() -> List[Dict]:
    """Scrape NHL standings from hockey-reference.com"""
    print("🏒 Scraping NHL standings...")
    
    url = "https://www.hockey-reference.com/leagues/NHL_2026_standings.html"
    
    response = make_request_with_retry(url)
    if not response:
        print("❌ Failed to get NHL standings")
        return []
    
    soup = BeautifulSoup(response.content, 'html.parser')
    standings = []
    
    # Find all standings tables (Eastern and Western conferences)
    tables = soup.find_all('table', {'id': re.compile(r'standings_(EAS|WES)')})
    if not tables:
        print("❌ NHL standings tables not found")
        return []
    
    # Use a dictionary to track teams and avoid duplicates
    teams_dict = {}
    
    for table in tables:
        # Find all team links in the table directly
        team_links = table.find_all('a', href=re.compile(r'/teams/'))
        
        for link in team_links:
            try:
                team_name = link.text.strip()
                href = link.get('href', '')
                team_abbr = href.split('/')[-1].replace('.html', '').upper()
                
                # Skip if we already have this team
                if team_name in teams_dict:
                    continue
                
                # Find the parent row to get stats
                row = link.find_parent('tr')
                if row:
                    cells = row.find_all('td')
                    if len(cells) >= 8:
                        teams_dict[team_name] = {
                            'team_name': team_name,
                            'team_abbr': team_abbr,
                            'games_played': int(cells[0].text.strip()) if cells[0].text.strip().isdigit() else 0,
                            'wins': int(cells[1].text.strip()) if cells[1].text.strip().isdigit() else 0,
                            'losses': int(cells[2].text.strip()) if cells[2].text.strip().isdigit() else 0,
                            'ot_losses': int(cells[3].text.strip()) if cells[3].text.strip().isdigit() else 0,
                            'points': int(cells[4].text.strip()) if cells[4].text.strip().isdigit() else 0,
                            'points_pct': float(cells[5].text.strip()) if cells[5].text.strip().replace('.', '').isdigit() else 0.0,
                            'goals_for': int(cells[6].text.strip()) if cells[6].text.strip().isdigit() else 0,
                            'goals_against': int(cells[7].text.strip()) if cells[7].text.strip().isdigit() else 0,
                            'goal_diff': int(cells[8].text.strip()) if cells[8].text.strip().lstrip('-').isdigit() else 0,
                            'division': None,  # Will be determined from table context
                            'conference': 'Eastern' if 'EAS' in table.get('id', '') else 'Western'
                        }
            except (ValueError, AttributeError) as e:
                print(f"⚠️ Error parsing NHL team: {e}")
                continue
    
    # Convert dictionary values to list
    standings = list(teams_dict.values())
    
    print(f"✅ Scraped {len(standings)} NHL teams")
    return standings

def scrape_nfl_standings() -> List[Dict]:
    """Scrape NFL standings from pro-football-reference.com"""
    print("🏈 Scraping NFL standings...")
    
    current_year = datetime.now().year
    url = f"https://www.pro-football-reference.com/years/{current_year}/"
    
    response = make_request_with_retry(url)
    if not response:
        print("❌ Failed to get NFL standings")
        return []
    
    soup = BeautifulSoup(response.content, 'html.parser')
    standings = []
    
    # Use a dictionary to track teams and avoid duplicates
    teams_dict = {}
    
    # Find all division tables
    division_tables = soup.find_all('table', {'class': 'sortable'})
    
    for table in division_tables:
        # Check if this is a standings table (has team names)
        rows = table.find('tbody').find_all('tr') if table.find('tbody') else table.find_all('tr')
        
        for row in rows:
            cells = row.find_all(['td', 'th'])
            if len(cells) >= 8:
                team_cell = cells[0]
                team_link = team_cell.find('a')
                if team_link:
                    team_name = team_link.text.strip()
                    
                    # Skip if we already have this team
                    if team_name in teams_dict:
                        continue
                    
                    try:
                        teams_dict[team_name] = {
                            'team_name': team_name,
                            'team_abbr': team_name.split()[-1],  # Use last word as abbreviation
                            'games_played': int(cells[1].text.strip()) if cells[1].text.strip().isdigit() else 0,
                            'wins': int(cells[2].text.strip()) if cells[2].text.strip().isdigit() else 0,
                            'losses': int(cells[3].text.strip()) if cells[3].text.strip().isdigit() else 0,
                            'ties': int(cells[4].text.strip()) if cells[4].text.strip().isdigit() else 0,
                            'win_pct': float(cells[5].text.strip()) if cells[5].text.strip().replace('.', '').isdigit() else 0.0,
                            'points_for': int(cells[6].text.strip()) if cells[6].text.strip().isdigit() else 0,
                            'points_against': int(cells[7].text.strip()) if cells[7].text.strip().isdigit() else 0,
                            'point_diff': int(cells[8].text.strip()) if cells[8].text.strip().lstrip('-').isdigit() else 0,
                            'division': None,  # Will be set based on table context
                            'conference': None  # Will be set based on table context
                        }
                    except (ValueError, AttributeError) as e:
                        print(f"⚠️ Error parsing NFL row: {e}")
                        continue
    
    # Convert dictionary values to list
    standings = list(teams_dict.values())
    
    print(f"✅ Scraped {len(standings)} NFL teams")
    return standings

def scrape_nba_standings() -> List[Dict]:
    """Scrape NBA standings from basketball-reference.com"""
    print("🏀 Scraping NBA standings...")
    
    url = "https://www.basketball-reference.com/leagues/NBA_2026_standings.html"
    
    response = make_request_with_retry(url)
    if not response:
        print("❌ Failed to get NBA standings")
        return []
    
    soup = BeautifulSoup(response.content, 'html.parser')
    standings = []
    
    # NBA standings are in conference tables
    tables = soup.find_all('table', {'id': re.compile(r'confs_standings_(E|W)')})
    
    for table in tables:
        # Find all team links in the table directly
        team_links = table.find_all('a', href=re.compile(r'/teams/'))
        
        for link in team_links:
            try:
                team_name = link.text.strip()
                # Extract team abbreviation from href
                href = link.get('href', '')
                team_abbr = href.split('/')[-2].upper() # e.g., /teams/BOS/ -> BOS
                
                # Find the parent row to get stats
                row = link.find_parent('tr')
                if row:
                    cells = row.find_all('td')
                    if len(cells) >= 7:  # NBA has 7 cells, not 8
                        # Determine conference from table ID
                        conference = 'Eastern' if 'E' in table.get('id', '') else 'Western'
                        
                        standings.append({
                            'team_name': team_name,
                            'team_abbr': team_abbr,
                            'wins': int(cells[0].text.strip()) if cells[0].text.strip().isdigit() else 0,
                            'losses': int(cells[1].text.strip()) if cells[1].text.strip().isdigit() else 0,
                            'win_pct': float(cells[2].text.strip()) if cells[2].text.strip().replace('.', '').isdigit() else 0.0,
                            'games_played': int(cells[0].text.strip()) + int(cells[1].text.strip()) if cells[0].text.strip().isdigit() and cells[1].text.strip().isdigit() else 0,
                            'points_for': float(cells[4].text.strip()) if cells[4].text.strip().replace('.', '').isdigit() else 0,
                            'points_against': float(cells[5].text.strip()) if cells[5].text.strip().replace('.', '').isdigit() else 0,
                            'point_diff': float(cells[6].text.strip()) if cells[6].text.strip().replace('.', '').isdigit() else 0,
                            'division': None,  # Will be set based on context
                            'conference': conference
                        })
            except (ValueError, AttributeError) as e:
                print(f"⚠️ Error parsing NBA team: {e}")
                continue
    
    print(f"✅ Scraped {len(standings)} NBA teams")
    return standings

def scrape_premier_league_standings() -> List[Dict]:
    """Scrape Premier League standings from fbref.com"""
    print("⚽ Scraping Premier League standings...")
    
    url = "https://fbref.com/en/comps/9/Premier-League-Stats"
    
    response = make_request_with_retry(url)
    if not response:
        print("❌ Failed to get Premier League standings")
        return []
    
    soup = BeautifulSoup(response.content, 'html.parser')
    standings = []
    
    # Use a dictionary to track teams and avoid duplicates
    teams_dict = {}
    
    # Find the standings table
    table = soup.find('table', {'id': 'results2025-202691_overall'})
    if not table:
        print("❌ Premier League standings table not found")
        return []
    
    # Find all team links in the table directly
    team_links = table.find_all('a', href=re.compile(r'/en/squads/'))
    
    for link in team_links:
        try:
            team_name = link.text.strip()
            
            # Skip if we already have this team
            if team_name in teams_dict:
                continue
                
            # Extract team abbreviation from href
            href = link.get('href', '')
            team_abbr = href.split('/')[-1].replace('/', '').upper()
            
            # Find the parent row to get stats
            row = link.find_parent('tr')
            if row:
                cells = row.find_all('td')
                if len(cells) >= 10:
                    teams_dict[team_name] = {
                        'team_name': team_name,
                        'team_abbr': team_abbr,
                        'games_played': int(cells[1].text.strip()) if cells[1].text.strip().isdigit() else 0,
                        'wins': int(cells[2].text.strip()) if cells[2].text.strip().isdigit() else 0,
                        'draws': int(cells[3].text.strip()) if cells[3].text.strip().isdigit() else 0,
                        'losses': int(cells[4].text.strip()) if cells[4].text.strip().isdigit() else 0,
                        'points': int(cells[5].text.strip()) if cells[5].text.strip().isdigit() else 0,
                        'goals_for': int(cells[6].text.strip()) if cells[6].text.strip().isdigit() else 0,
                        'goals_against': int(cells[7].text.strip()) if cells[7].text.strip().isdigit() else 0,
                        'goal_diff': int(cells[8].text.strip()) if cells[8].text.strip().lstrip('-').isdigit() else 0,
                        'division': None,
                        'conference': None
                    }
        except (ValueError, AttributeError) as e:
            print(f"⚠️ Error parsing Premier League team: {e}")
            continue
    
    # Convert dictionary values to list
    standings = list(teams_dict.values())
    
    print(f"✅ Scraped {len(standings)} Premier League teams")
    return standings

def save_standings_to_db(league_name: str, standings_data: List[Dict]):
    """Save standings data to database"""
    print(f"💾 Saving {league_name} standings to database...")
    
    with SessionLocal() as session:
        # Get league
        league = session.query(League).filter(League.name == league_name).first()
        if not league:
            print(f"❌ League {league_name} not found")
            return
        
        # Get current season
        current_year = datetime.now().year
        season = f"{current_year}-{current_year + 1}"
        
        # Clear existing standings for this league/season
        session.query(Standing).filter(
            Standing.league_id == league.id,
            Standing.season == season
        ).delete()
        
        saved_count = 0
        for standing_data in standings_data:
            # Find team by name
            team = session.query(Team).filter(
                Team.league_id == league.id,
                Team.name.ilike(f"%{standing_data['team_name']}%")
            ).first()
            
            if not team:
                # Try to find by abbreviation
                team = session.query(Team).filter(
                    Team.league_id == league.id,
                    Team.name.ilike(f"%{standing_data['team_abbr']}%")
                ).first()
            
            if team:
                # Create standing record
                standing = Standing(
                    league_id=league.id,
                    team_id=team.id,
                    season=season,
                    games_played=standing_data.get('games_played', 0),
                    wins=standing_data.get('wins', 0),
                    losses=standing_data.get('losses', 0),
                    draws=standing_data.get('draws'),
                    ot_losses=standing_data.get('ot_losses'),
                    ties=standing_data.get('ties'),
                    points=standing_data.get('points'),
                    win_pct=standing_data.get('win_pct'),
                    points_pct=standing_data.get('points_pct'),
                    goals_for=standing_data.get('goals_for'),
                    goals_against=standing_data.get('goals_against'),
                    points_for=standing_data.get('points_for'),
                    points_against=standing_data.get('points_against'),
                    goal_diff=standing_data.get('goal_diff'),
                    point_diff=standing_data.get('point_diff'),
                    division=standing_data.get('division'),
                    conference=standing_data.get('conference'),
                    last_updated=datetime.now()
                )
                
                session.add(standing)
                saved_count += 1
            else:
                print(f"⚠️ Team not found: {standing_data['team_name']} ({standing_data['team_abbr']})")
        
        session.commit()
        print(f"✅ Saved {saved_count} {league_name} standings")

def run_standings_scrape():
    """Run standings scraping for all leagues"""
    print("\n🔄 Starting standings scraping...")
    
    # NHL
    try:
        nhl_standings = scrape_nhl_standings()
        if nhl_standings:
            save_standings_to_db("NHL", nhl_standings)
    except Exception as e:
        print(f"❌ Error scraping NHL standings: {e}")
    
    # NFL
    try:
        nfl_standings = scrape_nfl_standings()
        if nfl_standings:
            save_standings_to_db("NFL", nfl_standings)
    except Exception as e:
        print(f"❌ Error scraping NFL standings: {e}")
    
    # NBA
    try:
        nba_standings = scrape_nba_standings()
        if nba_standings:
            save_standings_to_db("NBA", nba_standings)
    except Exception as e:
        print(f"❌ Error scraping NBA standings: {e}")
    
    # Premier League
    try:
        pl_standings = scrape_premier_league_standings()
        if pl_standings:
            save_standings_to_db("PREMIER_LEAGUE", pl_standings)
    except Exception as e:
        print(f"❌ Error scraping Premier League standings: {e}")
    
    print("\n🎉 Standings scraping complete!")

if __name__ == "__main__":
    run_standings_scrape()