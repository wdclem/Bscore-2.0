import requests
from bs4 import BeautifulSoup
import time
from typing import List, Dict
from datetime import datetime
import re

from db.session import SessionLocal
from models import League, Team, Player, NHLPlayerStats, NHLGoalieStats

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

def scrape_nhl_skaters() -> List[Dict]:
    """Scrape NHL skater stats from hockey-reference.com"""
    print("🏒 Scraping NHL skater stats...")
    
    url = "https://www.hockey-reference.com/leagues/NHL_2025_skaters.html"
    
    response = make_request_with_retry(url)
    if not response:
        print("❌ Failed to get NHL skater stats")
        return []
    
    soup = BeautifulSoup(response.content, 'html.parser')
    stats = []
    
    # Find the stats table
    table = soup.find('table', {'id': 'player_stats'})
    if not table:
        print("❌ NHL skater stats table not found")
        return []
    
    # Get all rows from the table body
    tbody = table.find('tbody')
    if not tbody:
        print("❌ NHL skater stats table body not found")
        return []
    
    rows = tbody.find_all('tr')
    
    for row in rows:
        try:
            cells = row.find_all(['td', 'th'])
            if len(cells) < 20:  # Skip header rows or incomplete rows
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
            
            # Extract stats
            stats_data = {
                'player_name': player_name,
                'team_abbr': team_abbr,
                'games_played': int(cells[4].text.strip()) if cells[4].text.strip().isdigit() else 0,
                'goals': int(cells[5].text.strip()) if cells[5].text.strip().isdigit() else 0,
                'assists': int(cells[6].text.strip()) if cells[6].text.strip().isdigit() else 0,
                'points': int(cells[7].text.strip()) if cells[7].text.strip().isdigit() else 0,
                'plus_minus': int(cells[8].text.strip()) if cells[8].text.strip().lstrip('-').isdigit() else 0,
                'penalty_minutes': int(cells[9].text.strip()) if cells[9].text.strip().isdigit() else 0,
                'power_play_goals': int(cells[10].text.strip()) if cells[10].text.strip().isdigit() else 0,
                'power_play_assists': int(cells[11].text.strip()) if cells[11].text.strip().isdigit() else 0,
                'power_play_points': int(cells[12].text.strip()) if cells[12].text.strip().isdigit() else 0,
                'short_handed_goals': int(cells[13].text.strip()) if cells[13].text.strip().isdigit() else 0,
                'short_handed_assists': int(cells[14].text.strip()) if cells[14].text.strip().isdigit() else 0,
                'short_handed_points': int(cells[15].text.strip()) if cells[15].text.strip().isdigit() else 0,
                'game_winning_goals': int(cells[16].text.strip()) if cells[16].text.strip().isdigit() else 0,
                'overtime_goals': int(cells[17].text.strip()) if cells[17].text.strip().isdigit() else 0,
                'shots': int(cells[18].text.strip()) if cells[18].text.strip().isdigit() else 0,
                'shooting_percentage': float(cells[19].text.strip()) if cells[19].text.strip().replace('.', '').isdigit() else 0.0,
                'time_on_ice': float(cells[20].text.strip()) if cells[20].text.strip().replace('.', '').isdigit() else 0.0,
                'average_time_on_ice': float(cells[21].text.strip()) if cells[21].text.strip().replace('.', '').isdigit() else 0.0,
                'faceoff_wins': int(cells[22].text.strip()) if cells[22].text.strip().isdigit() else 0,
                'faceoff_losses': int(cells[23].text.strip()) if cells[23].text.strip().isdigit() else 0,
                'faceoff_percentage': float(cells[24].text.strip()) if cells[24].text.strip().replace('.', '').isdigit() else 0.0,
                'blocks': int(cells[25].text.strip()) if cells[25].text.strip().isdigit() else 0,
                'hits': int(cells[26].text.strip()) if cells[26].text.strip().isdigit() else 0,
            }
            
            stats.append(stats_data)
            
        except (ValueError, AttributeError, IndexError) as e:
            print(f"⚠️ Error parsing NHL skater row: {e}")
            continue
    
    print(f"✅ Scraped {len(stats)} NHL skater stats")
    return stats

def scrape_nhl_goalies() -> List[Dict]:
    """Scrape NHL goalie stats from hockey-reference.com"""
    print("🏒 Scraping NHL goalie stats...")
    
    url = "https://www.hockey-reference.com/leagues/NHL_2025_goalies.html"
    
    response = make_request_with_retry(url)
    if not response:
        print("❌ Failed to get NHL goalie stats")
        return []
    
    soup = BeautifulSoup(response.content, 'html.parser')
    stats = []
    
    # Find the stats table
    table = soup.find('table', {'id': 'player_stats'})
    if not table:
        print("❌ NHL goalie stats table not found")
        return []
    
    # Get all rows from the table body
    tbody = table.find('tbody')
    if not tbody:
        print("❌ NHL goalie stats table body not found")
        return []
    
    rows = tbody.find_all('tr')
    
    for row in rows:
        try:
            cells = row.find_all(['td', 'th'])
            if len(cells) < 15:  # Skip header rows or incomplete rows
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
            
            # Extract stats
            stats_data = {
                'player_name': player_name,
                'team_abbr': team_abbr,
                'games_played': int(cells[4].text.strip()) if cells[4].text.strip().isdigit() else 0,
                'games_started': int(cells[5].text.strip()) if cells[5].text.strip().isdigit() else 0,
                'wins': int(cells[6].text.strip()) if cells[6].text.strip().isdigit() else 0,
                'losses': int(cells[7].text.strip()) if cells[7].text.strip().isdigit() else 0,
                'ties': int(cells[8].text.strip()) if cells[8].text.strip().isdigit() else 0,
                'overtime_losses': int(cells[9].text.strip()) if cells[9].text.strip().isdigit() else 0,
                'goals_against': int(cells[10].text.strip()) if cells[10].text.strip().isdigit() else 0,
                'goals_against_average': float(cells[11].text.strip()) if cells[11].text.strip().replace('.', '').isdigit() else 0.0,
                'saves': int(cells[12].text.strip()) if cells[12].text.strip().isdigit() else 0,
                'save_percentage': float(cells[13].text.strip()) if cells[13].text.strip().replace('.', '').isdigit() else 0.0,
                'shutouts': int(cells[14].text.strip()) if cells[14].text.strip().isdigit() else 0,
                'time_on_ice': float(cells[15].text.strip()) if cells[15].text.strip().replace('.', '').isdigit() else 0.0,
                'time_on_ice_per_game': float(cells[16].text.strip()) if cells[16].text.strip().replace('.', '').isdigit() else 0.0,
                'penalty_minutes': int(cells[17].text.strip()) if cells[17].text.strip().isdigit() else 0,
            }
            
            stats.append(stats_data)
            
        except (ValueError, AttributeError, IndexError) as e:
            print(f"⚠️ Error parsing NHL goalie row: {e}")
            continue
    
    print(f"✅ Scraped {len(stats)} NHL goalie stats")
    return stats

def save_nhl_player_stats_to_db():
    """Save NHL player stats to database"""
    print("💾 Saving NHL player stats to database...")
    
    with SessionLocal() as session:
        # Get NHL league
        nhl_league = session.query(League).filter(League.name == "NHL").first()
        if not nhl_league:
            print("❌ NHL league not found")
            return
        
        current_year = datetime.now().year
        season = f"{current_year}-{current_year + 1}"
        
        # Clear existing NHL player stats for this season
        session.query(NHLPlayerStats).filter(
            NHLPlayerStats.league_id == nhl_league.id,
            NHLPlayerStats.season == season
        ).delete()
        
        session.query(NHLGoalieStats).filter(
            NHLGoalieStats.league_id == nhl_league.id,
            NHLGoalieStats.season == season
        ).delete()
        
        session.commit()
        
        # Scrape and save skater stats
        skater_stats = scrape_nhl_skaters()
        saved_skaters = 0
        
        for stat in skater_stats:
            # Get or create player
            player = session.query(Player).filter(
                Player.name == stat['player_name'],
                Player.league_id == nhl_league.id
            ).first()
            
            if not player:
                # Try to find team
                team = session.query(Team).filter(
                    Team.name.ilike(f"%{stat['team_abbr']}%"),
                    Team.league_id == nhl_league.id
                ).first()
                
                if not team:
                    print(f"  ⚠️ Team '{stat['team_abbr']}' not found for player '{stat['player_name']}'. Creating player without team.")
                    team_id = None
                else:
                    team_id = team.id
                
                player = Player(
                    name=stat['player_name'],
                    team_id=team_id,
                    league_id=nhl_league.id
                )
                session.add(player)
                session.flush()
            
            # Create NHL player stats record
            now = datetime.utcnow()
            nhl_stat = NHLPlayerStats(
                player_id=player.id,
                league_id=nhl_league.id,
                season=season,
                games_played=stat['games_played'],
                goals=stat['goals'],
                assists=stat['assists'],
                points=stat['points'],
                plus_minus=stat['plus_minus'],
                penalty_minutes=stat['penalty_minutes'],
                power_play_goals=stat['power_play_goals'],
                power_play_assists=stat['power_play_assists'],
                power_play_points=stat['power_play_points'],
                short_handed_goals=stat['short_handed_goals'],
                short_handed_assists=stat['short_handed_assists'],
                short_handed_points=stat['short_handed_points'],
                game_winning_goals=stat['game_winning_goals'],
                overtime_goals=stat['overtime_goals'],
                shots=stat['shots'],
                shooting_percentage=stat['shooting_percentage'],
                time_on_ice=stat['time_on_ice'],
                average_time_on_ice=stat['average_time_on_ice'],
                faceoff_wins=stat['faceoff_wins'],
                faceoff_losses=stat['faceoff_losses'],
                faceoff_percentage=stat['faceoff_percentage'],
                blocks=stat['blocks'],
                hits=stat['hits'],
                created_at=now,
                updated_at=now
            )
            session.add(nhl_stat)
            saved_skaters += 1
        
        # Scrape and save goalie stats
        goalie_stats = scrape_nhl_goalies()
        saved_goalies = 0
        
        for stat in goalie_stats:
            # Get or create player
            player = session.query(Player).filter(
                Player.name == stat['player_name'],
                Player.league_id == nhl_league.id
            ).first()
            
            if not player:
                # Try to find team
                team = session.query(Team).filter(
                    Team.name.ilike(f"%{stat['team_abbr']}%"),
                    Team.league_id == nhl_league.id
                ).first()
                
                if not team:
                    print(f"  ⚠️ Team '{stat['team_abbr']}' not found for goalie '{stat['player_name']}'. Creating player without team.")
                    team_id = None
                else:
                    team_id = team.id
                
                player = Player(
                    name=stat['player_name'],
                    team_id=team_id,
                    league_id=nhl_league.id
                )
                session.add(player)
                session.flush()
            
            # Create NHL goalie stats record
            now = datetime.utcnow()
            goalie_stat = NHLGoalieStats(
                player_id=player.id,
                league_id=nhl_league.id,
                season=season,
                games_played=stat['games_played'],
                games_started=stat['games_started'],
                wins=stat['wins'],
                losses=stat['losses'],
                ties=stat['ties'],
                overtime_losses=stat['overtime_losses'],
                goals_against=stat['goals_against'],
                goals_against_average=stat['goals_against_average'],
                saves=stat['saves'],
                save_percentage=stat['save_percentage'],
                shutouts=stat['shutouts'],
                time_on_ice=stat['time_on_ice'],
                time_on_ice_per_game=stat['time_on_ice_per_game'],
                penalty_minutes=stat['penalty_minutes'],
                created_at=now,
                updated_at=now
            )
            session.add(goalie_stat)
            saved_goalies += 1
        
        session.commit()
        print(f"✅ Saved {saved_skaters} NHL skater stats and {saved_goalies} NHL goalie stats")

def run_nhl_player_stats_scrape():
    """Main function to run NHL player stats scraping"""
    print("\n🔄 Starting NHL player stats scraping...")
    save_nhl_player_stats_to_db()
    print("🎉 NHL player stats scraping complete!")

if __name__ == "__main__":
    run_nhl_player_stats_scrape()
