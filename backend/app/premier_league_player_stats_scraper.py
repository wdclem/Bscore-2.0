import requests
from bs4 import BeautifulSoup
import time
from typing import List, Dict
from datetime import datetime
import re

from db.session import SessionLocal
from models import League, Team, Player, PremierLeaguePlayerStats

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

def scrape_premier_league_player_stats() -> List[Dict]:
    """Scrape Premier League player stats from fbref.com"""
    print("⚽ Scraping Premier League player stats...")
    
    url = "https://fbref.com/en/comps/9/stats/Premier-League-Stats"
    
    response = make_request_with_retry(url)
    if not response:
        print("❌ Failed to get Premier League player stats")
        return []
    
    soup = BeautifulSoup(response.content, 'html.parser')
    stats = []
    
    # Find the player stats table
    table = soup.find('table', {'id': 'stats_standard'})
    if not table:
        print("❌ Premier League player stats table not found")
        return []
    
    # Get all rows from the table body
    tbody = table.find('tbody')
    if not tbody:
        print("❌ Premier League player stats table body not found")
        return []
    
    rows = tbody.find_all('tr')
    
    for row in rows:
        try:
            cells = row.find_all(['td', 'th'])
            if len(cells) < 20:  # Skip header rows or incomplete rows
                continue
            
            # Extract player name and team
            player_cell = cells[0]  # Player name is in the first column
            player_link = player_cell.find('a')
            if not player_link:
                continue
                
            player_name = player_link.text.strip()
            
            # Extract team name
            team_cell = cells[1]  # Team is in the second column
            team_link = team_cell.find('a')
            team_name = team_link.text.strip() if team_link else "UNK"
            
            # Extract position
            position = cells[2].text.strip() if len(cells) > 2 else "UNK"
            
            # Extract stats
            stats_data = {
                'player_name': player_name,
                'team_name': team_name,
                'position': position,
                'games_played': int(cells[3].text.strip()) if cells[3].text.strip().isdigit() else 0,
                'games_started': int(cells[4].text.strip()) if cells[4].text.strip().isdigit() else 0,
                'minutes_played': int(cells[5].text.strip()) if cells[5].text.strip().isdigit() else 0,
                'goals': int(cells[6].text.strip()) if cells[6].text.strip().isdigit() else 0,
                'assists': int(cells[7].text.strip()) if cells[7].text.strip().isdigit() else 0,
                'goals_per_game': float(cells[8].text.strip()) if cells[8].text.strip().replace('.', '').isdigit() else 0.0,
                'assists_per_game': float(cells[9].text.strip()) if cells[9].text.strip().replace('.', '').isdigit() else 0.0,
                'shots': int(cells[10].text.strip()) if cells[10].text.strip().isdigit() else 0,
                'shots_on_target': int(cells[11].text.strip()) if cells[11].text.strip().isdigit() else 0,
                'shots_per_game': float(cells[12].text.strip()) if cells[12].text.strip().replace('.', '').isdigit() else 0.0,
                'shots_on_target_per_game': float(cells[13].text.strip()) if cells[13].text.strip().replace('.', '').isdigit() else 0.0,
                'shot_accuracy': float(cells[14].text.strip()) if cells[14].text.strip().replace('.', '').isdigit() else 0.0,
                'passes': int(cells[15].text.strip()) if cells[15].text.strip().isdigit() else 0,
                'passes_completed': int(cells[16].text.strip()) if cells[16].text.strip().isdigit() else 0,
                'pass_accuracy': float(cells[17].text.strip()) if cells[17].text.strip().replace('.', '').isdigit() else 0.0,
                'passes_per_game': float(cells[18].text.strip()) if cells[18].text.strip().replace('.', '').isdigit() else 0.0,
                'key_passes': int(cells[19].text.strip()) if cells[19].text.strip().isdigit() else 0,
                'chances_created': int(cells[20].text.strip()) if cells[20].text.strip().isdigit() else 0,
                'tackles': int(cells[21].text.strip()) if cells[21].text.strip().isdigit() else 0,
                'tackles_won': int(cells[22].text.strip()) if cells[22].text.strip().isdigit() else 0,
                'tackle_accuracy': float(cells[23].text.strip()) if cells[23].text.strip().replace('.', '').isdigit() else 0.0,
                'interceptions': int(cells[24].text.strip()) if cells[24].text.strip().isdigit() else 0,
                'clearances': int(cells[25].text.strip()) if cells[25].text.strip().isdigit() else 0,
                'blocks': int(cells[26].text.strip()) if cells[26].text.strip().isdigit() else 0,
                'yellow_cards': int(cells[27].text.strip()) if cells[27].text.strip().isdigit() else 0,
                'red_cards': int(cells[28].text.strip()) if cells[28].text.strip().isdigit() else 0,
                'fouls_committed': int(cells[29].text.strip()) if cells[29].text.strip().isdigit() else 0,
                'fouls_drawn': int(cells[30].text.strip()) if cells[30].text.strip().isdigit() else 0,
                'offsides': int(cells[31].text.strip()) if cells[31].text.strip().isdigit() else 0,
            }
            
            # Calculate per-game stats
            if stats_data['games_played'] > 0:
                stats_data['minutes_per_game'] = round(stats_data['minutes_played'] / stats_data['games_played'], 1)
            else:
                stats_data['minutes_per_game'] = 0.0
            
            stats.append(stats_data)
            
        except (ValueError, AttributeError, IndexError) as e:
            print(f"⚠️ Error parsing Premier League player row: {e}")
            continue
    
    print(f"✅ Scraped {len(stats)} Premier League player stats")
    return stats

def save_premier_league_player_stats_to_db():
    """Save Premier League player stats to database"""
    print("💾 Saving Premier League player stats to database...")
    
    with SessionLocal() as session:
        # Get Premier League
        pl_league = session.query(League).filter(League.name == "PREMIER_LEAGUE").first()
        if not pl_league:
            print("❌ Premier League not found")
            return
        
        current_year = datetime.now().year
        season = f"{current_year}-{current_year + 1}"
        
        # Clear existing Premier League player stats for this season
        session.query(PremierLeaguePlayerStats).filter(
            PremierLeaguePlayerStats.league_id == pl_league.id,
            PremierLeaguePlayerStats.season == season
        ).delete()
        
        session.commit()
        
        # Scrape and save player stats
        player_stats = scrape_premier_league_player_stats()
        saved_players = 0
        
        for stat in player_stats:
            # Get or create player
            player = session.query(Player).filter(
                Player.name == stat['player_name'],
                Player.league_id == pl_league.id
            ).first()
            
            if not player:
                # Try to find team
                team = session.query(Team).filter(
                    Team.name.ilike(f"%{stat['team_name']}%"),
                    Team.league_id == pl_league.id
                ).first()
                
                if not team:
                    print(f"  ⚠️ Team '{stat['team_name']}' not found for player '{stat['player_name']}'. Creating player without team.")
                    team_id = None
                else:
                    team_id = team.id
                
                player = Player(
                    name=stat['player_name'],
                    team_id=team_id,
                    league_id=pl_league.id
                )
                session.add(player)
                session.flush()
            
            # Create Premier League player stats record
            now = datetime.utcnow()
            pl_stat = PremierLeaguePlayerStats(
                player_id=player.id,
                league_id=pl_league.id,
                season=season,
                games_played=stat['games_played'],
                games_started=stat['games_started'],
                minutes_played=stat['minutes_played'],
                minutes_per_game=stat['minutes_per_game'],
                goals=stat['goals'],
                assists=stat['assists'],
                goals_per_game=stat['goals_per_game'],
                assists_per_game=stat['assists_per_game'],
                shots=stat['shots'],
                shots_on_target=stat['shots_on_target'],
                shots_per_game=stat['shots_per_game'],
                shots_on_target_per_game=stat['shots_on_target_per_game'],
                shot_accuracy=stat['shot_accuracy'],
                passes=stat['passes'],
                passes_completed=stat['passes_completed'],
                pass_accuracy=stat['pass_accuracy'],
                passes_per_game=stat['passes_per_game'],
                key_passes=stat['key_passes'],
                chances_created=stat['chances_created'],
                tackles=stat['tackles'],
                tackles_won=stat['tackles_won'],
                tackle_accuracy=stat['tackle_accuracy'],
                interceptions=stat['interceptions'],
                clearances=stat['clearances'],
                blocks=stat['blocks'],
                yellow_cards=stat['yellow_cards'],
                red_cards=stat['red_cards'],
                fouls_committed=stat['fouls_committed'],
                fouls_drawn=stat['fouls_drawn'],
                offsides=stat['offsides'],
                created_at=now,
                updated_at=now
            )
            session.add(pl_stat)
            saved_players += 1
        
        session.commit()
        print(f"✅ Saved {saved_players} Premier League player stats")

def run_premier_league_player_stats_scrape():
    """Main function to run Premier League player stats scraping"""
    print("\n🔄 Starting Premier League player stats scraping...")
    save_premier_league_player_stats_to_db()
    print("🎉 Premier League player stats scraping complete!")

if __name__ == "__main__":
    run_premier_league_player_stats_scrape()




