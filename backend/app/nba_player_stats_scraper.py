import requests
from bs4 import BeautifulSoup
import time
from typing import List, Dict
from datetime import datetime
import re

from db.session import SessionLocal
from models import League, Team, Player, NBAPlayerStats

def make_request_with_retry(url: str, headers: Dict = None, max_retries: int = 5) -> requests.Response:
    """Makes an HTTP request with retries and exponential backoff."""
    if headers is None:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    
    for attempt in range(max_retries):
        try:
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            print(f"Attempt {attempt + 1} failed for {url}: {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
    
    return None

def scrape_nba_player_stats() -> List[Dict]:
    """Scrape NBA player stats from basketball-reference.com"""
    print("🏀 Scraping NBA player stats...")
    
    url = "https://www.basketball-reference.com/leagues/NBA_2025_totals.html#totals_stats::pts"
    
    response = make_request_with_retry(url)
    if not response:
        print("❌ Failed to get NBA player stats")
        return []
    
    soup = BeautifulSoup(response.content, 'html.parser')
    stats = []
    
    # Find the stats table
    table = soup.find('table', {'id': 'totals_stats'})
    if not table:
        print("❌ NBA player stats table not found")
        return []
    
    # Get all rows from the table body
    tbody = table.find('tbody')
    if not tbody:
        print("❌ NBA player stats table body not found")
        return []
    
    rows = tbody.find_all('tr')
    
    for row in rows:
        try:
            cells = row.find_all(['td', 'th'])
            if len(cells) < 25:  # Skip header rows or incomplete rows
                continue
            
            # Extract player name and team
            player_cell = cells[1]  # Player name is in the second column
            player_link = player_cell.find('a')
            if not player_link:
                continue
                
            player_name = player_link.text.strip()
            
            # Extract team abbreviation
            team_cell = cells[2]  # Team is in the third column
            team_link = team_cell.find('a')
            team_abbr = team_link.text.strip() if team_link else "UNK"
            
            # Extract position
            position = cells[3].text.strip() if len(cells) > 3 else "UNK"
            
            # Extract stats
            stats_data = {
                'player_name': player_name,
                'team_abbr': team_abbr,
                'position': position,
                'games_played': int(cells[4].text.strip()) if cells[4].text.strip().isdigit() else 0,
                'games_started': int(cells[5].text.strip()) if cells[5].text.strip().isdigit() else 0,
                'minutes_played': float(cells[6].text.strip()) if cells[6].text.strip().replace('.', '').isdigit() else 0.0,
                'field_goals': int(cells[7].text.strip()) if cells[7].text.strip().isdigit() else 0,
                'field_goal_attempts': int(cells[8].text.strip()) if cells[8].text.strip().isdigit() else 0,
                'field_goal_percentage': float(cells[9].text.strip()) if cells[9].text.strip().replace('.', '').isdigit() else 0.0,
                'three_pointers': int(cells[10].text.strip()) if cells[10].text.strip().isdigit() else 0,
                'three_point_attempts': int(cells[11].text.strip()) if cells[11].text.strip().isdigit() else 0,
                'three_point_percentage': float(cells[12].text.strip()) if cells[12].text.strip().replace('.', '').isdigit() else 0.0,
                'two_pointers': int(cells[13].text.strip()) if cells[13].text.strip().isdigit() else 0,
                'two_point_attempts': int(cells[14].text.strip()) if cells[14].text.strip().isdigit() else 0,
                'two_point_percentage': float(cells[15].text.strip()) if cells[15].text.strip().replace('.', '').isdigit() else 0.0,
                'free_throws': int(cells[16].text.strip()) if cells[16].text.strip().isdigit() else 0,
                'free_throw_attempts': int(cells[17].text.strip()) if cells[17].text.strip().isdigit() else 0,
                'free_throw_percentage': float(cells[18].text.strip()) if cells[18].text.strip().replace('.', '').isdigit() else 0.0,
                'effective_field_goal_percentage': float(cells[19].text.strip()) if cells[19].text.strip().replace('.', '').isdigit() else 0.0,
                'offensive_rebounds': int(cells[20].text.strip()) if cells[20].text.strip().isdigit() else 0,
                'defensive_rebounds': int(cells[21].text.strip()) if cells[21].text.strip().isdigit() else 0,
                'total_rebounds': int(cells[22].text.strip()) if cells[22].text.strip().isdigit() else 0,
                'assists': int(cells[23].text.strip()) if cells[23].text.strip().isdigit() else 0,
                'steals': int(cells[24].text.strip()) if cells[24].text.strip().isdigit() else 0,
                'blocks': int(cells[25].text.strip()) if cells[25].text.strip().isdigit() else 0,
                'turnovers': int(cells[26].text.strip()) if cells[26].text.strip().isdigit() else 0,
                'personal_fouls': int(cells[27].text.strip()) if cells[27].text.strip().isdigit() else 0,
                'points': int(cells[28].text.strip()) if cells[28].text.strip().isdigit() else 0,
            }
            
            # Calculate per-game stats
            if stats_data['games_played'] > 0:
                stats_data['points_per_game'] = round(stats_data['points'] / stats_data['games_played'], 1)
                stats_data['rebounds_per_game'] = round(stats_data['total_rebounds'] / stats_data['games_played'], 1)
                stats_data['assists_per_game'] = round(stats_data['assists'] / stats_data['games_played'], 1)
                stats_data['steals_per_game'] = round(stats_data['steals'] / stats_data['games_played'], 1)
                stats_data['blocks_per_game'] = round(stats_data['blocks'] / stats_data['games_played'], 1)
                stats_data['turnovers_per_game'] = round(stats_data['turnovers'] / stats_data['games_played'], 1)
            else:
                stats_data['points_per_game'] = 0.0
                stats_data['rebounds_per_game'] = 0.0
                stats_data['assists_per_game'] = 0.0
                stats_data['steals_per_game'] = 0.0
                stats_data['blocks_per_game'] = 0.0
                stats_data['turnovers_per_game'] = 0.0
            
            stats.append(stats_data)
            
        except (ValueError, AttributeError, IndexError) as e:
            print(f"⚠️ Error parsing NBA player row: {e}")
            continue
    
    print(f"✅ Scraped {len(stats)} NBA player stats")
    return stats

def save_nba_player_stats_to_db():
    """Save NBA player stats to database"""
    print("💾 Saving NBA player stats to database...")
    
    with SessionLocal() as session:
        # Get NBA league
        nba_league = session.query(League).filter(League.name == "NBA").first()
        if not nba_league:
            print("❌ NBA league not found")
            return
        
        current_year = datetime.now().year
        season = f"{current_year}-{current_year + 1}"
        
        # Clear existing NBA player stats for this season
        session.query(NBAPlayerStats).filter(
            NBAPlayerStats.league_id == nba_league.id,
            NBAPlayerStats.season == season
        ).delete()
        
        session.commit()
        
        # Scrape and save player stats
        player_stats = scrape_nba_player_stats()
        saved_players = 0
        
        for stat in player_stats:
            # Get or create player
            player = session.query(Player).filter(
                Player.name == stat['player_name'],
                Player.league_id == nba_league.id
            ).first()
            
            if not player:
                # Try to find team
                team = session.query(Team).filter(
                    Team.name.ilike(f"%{stat['team_abbr']}%"),
                    Team.league_id == nba_league.id
                ).first()
                
                if not team:
                    print(f"  ⚠️ Team '{stat['team_abbr']}' not found for player '{stat['player_name']}'. Creating player without team.")
                    team_id = None
                else:
                    team_id = team.id
                
                player = Player(
                    name=stat['player_name'],
                    team_id=team_id,
                    league_id=nba_league.id
                )
                session.add(player)
                session.flush()
            
            # Create NBA player stats record
            now = datetime.utcnow()
            nba_stat = NBAPlayerStats(
                player_id=player.id,
                league_id=nba_league.id,
                season=season,
                games_played=stat['games_played'],
                games_started=stat['games_started'],
                minutes_played=stat['minutes_played'],
                field_goals=stat['field_goals'],
                field_goal_attempts=stat['field_goal_attempts'],
                field_goal_percentage=stat['field_goal_percentage'],
                three_pointers=stat['three_pointers'],
                three_point_attempts=stat['three_point_attempts'],
                three_point_percentage=stat['three_point_percentage'],
                two_pointers=stat['two_pointers'],
                two_point_attempts=stat['two_point_attempts'],
                two_point_percentage=stat['two_point_percentage'],
                free_throws=stat['free_throws'],
                free_throw_attempts=stat['free_throw_attempts'],
                free_throw_percentage=stat['free_throw_percentage'],
                effective_field_goal_percentage=stat['effective_field_goal_percentage'],
                offensive_rebounds=stat['offensive_rebounds'],
                defensive_rebounds=stat['defensive_rebounds'],
                total_rebounds=stat['total_rebounds'],
                assists=stat['assists'],
                steals=stat['steals'],
                blocks=stat['blocks'],
                turnovers=stat['turnovers'],
                personal_fouls=stat['personal_fouls'],
                points=stat['points'],
                points_per_game=stat['points_per_game'],
                rebounds_per_game=stat['rebounds_per_game'],
                assists_per_game=stat['assists_per_game'],
                steals_per_game=stat['steals_per_game'],
                blocks_per_game=stat['blocks_per_game'],
                turnovers_per_game=stat['turnovers_per_game'],
                created_at=now,
                updated_at=now
            )
            session.add(nba_stat)
            saved_players += 1
        
        session.commit()
        print(f"✅ Saved {saved_players} NBA player stats")

def run_nba_player_stats_scrape():
    """Main function to run NBA player stats scraping"""
    print("\n🔄 Starting NBA player stats scraping...")
    save_nba_player_stats_to_db()
    print("🎉 NBA player stats scraping complete!")

if __name__ == "__main__":
    run_nba_player_stats_scrape()
