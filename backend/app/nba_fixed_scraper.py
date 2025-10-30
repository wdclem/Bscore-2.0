import requests
from bs4 import BeautifulSoup
from datetime import datetime
import re

def fetch_nba_data_fixed():
    """Fixed NBA scraper that handles the current page structure"""
    url = "https://www.basketball-reference.com/boxscores/"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        games = []
        
        # Find the page date - look for any span with date format
        page_date = None
        date_spans = soup.find_all('span', string=re.compile(r'\w{3} \d{1,2}, \d{4}'))
        if date_spans:
            try:
                page_date = datetime.strptime(date_spans[0].get_text(strip=True), '%b %d, %Y')
                print(f"📅 Found page date: {page_date}")
            except ValueError:
                print("⚠️ Could not parse page date")
        
        # Process each game summary
        game_summaries = soup.select('.game_summary.nohover')
        print(f"🏀 Found {len(game_summaries)} game summaries")
        
        for i, game_summary in enumerate(game_summaries):
            try:
                game = {}
                
                # Extract teams and scores from the first two rows
                rows = game_summary.find_all('tr')
                if len(rows) < 2:
                    continue
                
                # First row is away team, second row is home team
                away_row = rows[0]
                home_row = rows[1]
                
                # Extract team names and scores
                away_text = away_row.get_text(strip=True)
                home_text = home_row.get_text(strip=True)
                
                # Parse team names and scores using regex
                # Format is usually "TeamNameScoreFinal" or "TeamNameScore"
                away_match = re.match(r'^([A-Za-z\s]+?)(\d+)(?:Final)?$', away_text)
                home_match = re.match(r'^([A-Za-z\s]+?)(\d+)(?:Final)?$', home_text)
                
                if away_match and home_match:
                    away_team = away_match.group(1).strip()
                    away_score = int(away_match.group(2))
                    home_team = home_match.group(1).strip()
                    home_score = int(home_match.group(2))
                    
                    game['awayTeam'] = away_team
                    game['awayScore'] = away_score
                    game['homeTeam'] = home_team
                    game['homeScore'] = home_score
                    game['game_date'] = page_date
                    
                    # Add placeholder logos
                    game['awayLogo'] = f"https://cdn.ssref.net/req/202305101/tlogo/bbr/{away_team.lower().replace(' ', '')}-{page_date.year if page_date else 2025}.png"
                    game['homeLogo'] = f"https://cdn.ssref.net/req/202305101/tlogo/bbr/{home_team.lower().replace(' ', '')}-{page_date.year if page_date else 2025}.png"
                    
                    games.append(game)
                    print(f"  ✅ {away_team} {away_score} vs {home_team} {home_score}")
                else:
                    print(f"  ⚠️ Could not parse: {away_text} vs {home_text}")
                    
            except Exception as e:
                print(f"  ❌ Error parsing game {i+1}: {e}")
                continue
        
        print(f"🎉 Successfully parsed {len(games)} NBA games")
        return games
        
    except Exception as e:
        print(f"❌ Error fetching NBA data: {e}")
        return []

if __name__ == "__main__":
    games = fetch_nba_data_fixed()
    print(f"\nFinal result: {len(games)} games")
    for game in games[:3]:
        print(f"  {game['awayTeam']} {game['awayScore']} vs {game['homeTeam']} {game['homeScore']} - {game['game_date']}")




