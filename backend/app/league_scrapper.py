import requests
from bs4 import BeautifulSoup
from datetime import datetime

LEAGUE_CONFIG = {
    "nfl": {
        "away_sel": 'table.teams tbody tr:nth-of-type(2)',
        "home_sel": 'table.teams tbody tr:last-child',
        "date_mode": "per_box",  # read from 'tr.date td' inside each box
        "logo_prefix": "pfr",
    },
    "nhl": {
        "away_sel": 'table.teams tbody tr:nth-of-type(1)',
        "home_sel": 'table.teams tbody tr:last-child',
        "date_mode": "page",     # read from .prevnext .current
        "logo_prefix": "hr",
    },
    "nba": {
        "away_sel": 'table.teams tbody tr:nth-of-type(1)',
        "home_sel": 'table.teams tbody tr:last-child',
        "date_mode": "page",
        "logo_prefix": "bbr",
    },
}

def fetch_sports_data(base_url: str, league_type: str):
    cfg = LEAGUE_CONFIG[league_type]
    logo_prefix = cfg["logo_prefix"]
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(base_url, headers=headers, timeout=15)
    response.raise_for_status()
    soup = BeautifulSoup(response.content, 'html.parser')
    games = []

    # page-level date (for date_mode == "page")
    page_date = None
    current_span = soup.select_one('.prevnext .current')
    if current_span:
        try:
            page_date = datetime.strptime(current_span.get_text(strip=True), '%b %d, %Y')
        except ValueError:
            page_date = None

    for game_summary in soup.select('.game_summary.nohover'):
        game = {}

        # date
        if cfg["date_mode"] == "per_box":
            dcell = game_summary.select_one('tr.date td')
            game_date = None
            if dcell:
                try:
                    game_date = datetime.strptime(dcell.get_text(strip=True), '%b %d, %Y')
                except ValueError:
                    game_date = None
        else:
            game_date = page_date

        # teams
        away_row = game_summary.select_one(cfg["away_sel"])
        home_row = game_summary.select_one(cfg["home_sel"])
        if not away_row or not home_row:
            continue
        away_team_link = away_row.select_one('td a')
        home_team_link = home_row.select_one('td a')
        if not away_team_link or not home_team_link:
            continue

        game['awayTeam'] = away_team_link.text.strip()
        game['awayScore'] = away_row.select_one('td.right').text.strip()
        game['awayLogo'] = f"https://cdn.ssref.net/req/202305101/tlogo/{logo_prefix}/{away_team_link['href'].split('/')[2]}-{(game_date or datetime.utcnow()).year}.png"

        game['homeTeam'] = home_team_link.text.strip()
        game['homeScore'] = home_row.select_one('td.right').text.strip()
        game['homeLogo'] = f"https://cdn.ssref.net/req/202305101/tlogo/{logo_prefix}/{home_team_link['href'].split('/')[2]}-{(game_date or datetime.utcnow()).year}.png"

        if game_date:
            game['game_date'] = game_date

        games.append(game)
    return games

# Convenience functions for all leagues
def fetch_nfl_data():
    return fetch_sports_data("https://www.pro-football-reference.com/boxscores/", "nfl")

def fetch_nhl_data():
    return fetch_sports_data("https://www.hockey-reference.com/boxscores/", "nhl")

def fetch_nba_data():
    """Fixed NBA scraper that handles the current page structure"""
    url = "https://www.basketball-reference.com/boxscores/"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        games = []
        
        # Find the page date - look for any span with date format
        import re
        page_date = None
        date_spans = soup.find_all('span', string=re.compile(r'\w{3} \d{1,2}, \d{4}'))
        if date_spans:
            try:
                page_date = datetime.strptime(date_spans[0].get_text(strip=True), '%b %d, %Y')
            except ValueError:
                pass
        
        # Process each game summary
        game_summaries = soup.select('.game_summary.nohover')
        
        for game_summary in game_summaries:
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
                    
            except Exception as e:
                continue
        
        return games
        
    except Exception as e:
        return []
