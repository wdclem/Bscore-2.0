import requests
from bs4 import BeautifulSoup
from datetime import datetime
import re

def fetch_premier_league_data():
    """Fetch Premier League data from FBref"""
    url = "https://fbref.com/en/comps/9/schedule/Premier-League-Scores-and-Fixtures"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find the table with the specific ID
        table = soup.find('table', {'id': 'sched_2025-2026_9_1'})
        
        if not table:
            print("Premier League table not found")
            return []
        
        print(f"Found table: {table.get('id')}")
        
        games = []
        rows = table.find('tbody').find_all('tr') if table.find('tbody') else table.find_all('tr')
        
        print(f"Processing {len(rows)} rows...")
        
        for i, row in enumerate(rows):
            cells = row.find_all(['td', 'th'])
            if len(cells) < 9:  # Skip header rows
                continue
                
            try:
                # Extract data using data-stat attributes
                date_cell = row.find('td', {'data-stat': 'date'})
                time_cell = row.find('td', {'data-stat': 'start_time'})
                home_cell = row.find('td', {'data-stat': 'home_team'})
                score_cell = row.find('td', {'data-stat': 'score'})
                away_cell = row.find('td', {'data-stat': 'away_team'})
                
                if not all([date_cell, time_cell, home_cell, score_cell, away_cell]):
                    continue
                
                # Get team names
                home_team = home_cell.find('a').get_text(strip=True) if home_cell.find('a') else home_cell.get_text(strip=True)
                away_team = away_cell.find('a').get_text(strip=True) if away_cell.find('a') else away_cell.get_text(strip=True)
                
                # Get score
                score_link = score_cell.find('a')
                if score_link:
                    score_text = score_link.get_text(strip=True)
                else:
                    score_text = score_cell.get_text(strip=True)
                
                # Parse score (e.g., "4–2")
                home_score = away_score = None
                if '–' in score_text:
                    try:
                        home_score, away_score = score_text.split('–')
                        home_score = int(home_score.strip()) if home_score.strip().isdigit() else None
                        away_score = int(away_score.strip()) if away_score.strip().isdigit() else None
                    except:
                        pass
                
                # Get date
                date_text = date_cell.find('a').get_text(strip=True) if date_cell.find('a') else date_cell.get_text(strip=True)
                
                # Get time
                time_text = time_cell.get_text(strip=True)
                # Extract just the time part (before the local time in parentheses)
                time_text = time_text.split('(')[0].strip()
                
                # Parse date and time
                game_date = None
                if date_text:
                    try:
                        game_date = datetime.strptime(date_text, "%Y-%m-%d")
                        if time_text and time_text != "":
                            time_parts = time_text.split(':')
                            if len(time_parts) == 2:
                                game_date = game_date.replace(hour=int(time_parts[0]), minute=int(time_parts[1]))
                    except ValueError:
                        print(f"Could not parse date: {date_text}")
                        continue
                
                # Only include games with actual scores
                if home_score is not None and away_score is not None and home_team and away_team:
                    game_data = {
                        'game_date': game_date,
                        'homeTeam': home_team,
                        'awayTeam': away_team,
                        'homeScore': home_score,
                        'awayScore': away_score,
                    }
                    games.append(game_data)
                    print(f"  ✅ {home_team} vs {away_team}: {home_score}-{away_score}")
                    
            except Exception as e:
                print(f"Error parsing row {i}: {e}")
                continue
        
        print(f"Fetched {len(games)} Premier League games")
        return games
        
    except Exception as e:
        print(f"Error fetching Premier League data: {e}")
        return []

if __name__ == "__main__":
    games = fetch_premier_league_data()
    for game in games[:5]:  # Print first 5 games
        print(f"{game['homeTeam']} vs {game['awayTeam']}: {game['homeScore']}-{game['awayScore']} on {game['game_date']}")
