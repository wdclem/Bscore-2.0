import requests
from bs4 import BeautifulSoup
from datetime import datetime
import re

def get_team_logo_url(team_name):
    """Get local logo path for a Premier League team"""
    # Map team names to their local logo file names
    team_logos = {
        'Arsenal': '/logos/premier_league/Arsenal%20FC.png',
        'Aston Villa': '/logos/premier_league/Aston Villa.png',
        'Brentford': '/logos/premier_league/Brentford%20FC.png',
        'Chelsea': '/logos/premier_league/Chelsea%20FC.png',
        'Crystal Palace': '/logos/premier_league/Crystal Palace.png',
        'Everton': '/logos/premier_league/Everton%20FC.png',
        'Fulham': '/logos/premier_league/Fulham%20FC.png',
        'Leeds United': '/logos/premier_league/Leeds United.png',
        'Liverpool': '/logos/premier_league/Liverpool%20FC.png',
        'Manchester City': '/logos/premier_league/Manchester City.png',
        'Sunderland': '/logos/premier_league/Sunderland AFC.png',
        'Bournemouth': '/logos/premier_league/AFC Bournemouth.png',
        'Newcastle Utd': '/logos/premier_league/Newcastle United.png',
        'West Ham': '/logos/premier_league/West Ham United.png',
        'Tottenham': '/logos/premier_league/Tottenham Hotspur.png',
        'Brighton': '/logos/premier_league/Brighton & Hove Albion.png',
        'Wolves': '/logos/premier_league/Wolverhampton Wanderers.png',
        'Nott\'ham Forest': '/logos/premier_league/Nottingham Forest.png',
        'Manchester Utd': '/logos/premier_league/Manchester United.png',
        'Burnley': '/logos/premier_league/Burnley%20FC.png'
    }
    
    return team_logos.get(team_name)

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
                attendance_cell = row.find('td', {'data-stat': 'attendance'})
                venue_cell = row.find('td', {'data-stat': 'venue'})
                referee_cell = row.find('td', {'data-stat': 'referee'})
                
                if not all([date_cell, time_cell, home_cell, score_cell, away_cell]):
                    continue
                
                # Get team names and URLs
                home_link = home_cell.find('a')
                away_link = away_cell.find('a')
                
                if not home_link or not away_link:
                    continue
                
                home_team = home_link.get_text(strip=True)
                away_team = away_link.get_text(strip=True)
                home_url = home_link.get('href')
                away_url = away_link.get('href')
                
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
                time_text = time_text.split('(')[0].strip()
                
                # Get additional data
                attendance = attendance_cell.get_text(strip=True) if attendance_cell else None
                venue = venue_cell.get_text(strip=True) if venue_cell else None
                referee = referee_cell.get_text(strip=True) if referee_cell else None
                
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
                    # Get logo URLs using hardcoded mapping
                    home_logo = get_team_logo_url(home_team)
                    away_logo = get_team_logo_url(away_team)
                    
                    game_data = {
                        'game_date': game_date,
                        'homeTeam': home_team,
                        'awayTeam': away_team,
                        'homeScore': home_score,
                        'awayScore': away_score,
                        'homeLogo': home_logo,
                        'awayLogo': away_logo,
                        'attendance': attendance,
                        'venue': venue,
                        'referee': referee,
                    }
                    games.append(game_data)
                    print(f"  ✅ {home_team} vs {away_team}: {home_score}-{away_score} at {venue} (att: {attendance}, ref: {referee})")
                    
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
        print(f"  Logos: {game['homeLogo']}, {game['awayLogo']}")
