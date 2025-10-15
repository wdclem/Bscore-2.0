import requests
from bs4 import BeautifulSoup, Comment
from datetime import datetime

def scrape_nhl_standings():
    """Scrape NHL standings from hockey-reference.com"""
    url = "https://www.hockey-reference.com/leagues/NHL_2026.html"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        standings = []
        
        # Find standings tables (they might be in comments)
        tables = soup.find_all('table', id=lambda x: x and 'standings' in x.lower())
        
        # Also check in HTML comments
        if not tables:
            comments = soup.find_all(string=lambda text: isinstance(text, Comment))
            for comment in comments:
                comment_soup = BeautifulSoup(comment, 'html.parser')
                comment_tables = comment_soup.find_all('table', id=lambda x: x and 'standings' in x.lower())
                tables.extend(comment_tables)
        
        for table in tables:
            # Determine conference/division from table ID or caption
            table_id = table.get('id', '')
            caption = table.find('caption')
            division_name = caption.text.strip() if caption else table_id
            
            rows = table.find('tbody').find_all('tr')
            
            for row in rows:
                # Skip header rows
                if row.find('th', class_='over_header'):
                    continue
                
                team_cell = row.find('th', {'data-stat': 'team_name'}) or row.find('th')
                if not team_cell:
                    continue
                
                team_link = team_cell.find('a')
                if not team_link:
                    continue
                
                team_name = team_link.text.strip()
                team_abbr = team_link.get('href', '').split('/')[2] if team_link.get('href') else None
                
                # Extract stats
                stats = {}
                for td in row.find_all('td'):
                    stat_name = td.get('data-stat')
                    if stat_name:
                        stats[stat_name] = td.text.strip()
                
                standing = {
                    'team_name': team_name,
                    'team_abbr': team_abbr,
                    'division': division_name,
                    'wins': int(stats.get('wins', 0) or 0),
                    'losses': int(stats.get('losses', 0) or 0),
                    'ot_losses': int(stats.get('ot_losses', 0) or 0),
                    'points': int(stats.get('points', 0) or 0),
                    'points_pct': float(stats.get('points_pct', 0) or 0),
                    'goals_for': int(stats.get('goals_for', 0) or 0),
                    'goals_against': int(stats.get('goals_against', 0) or 0),
                    'goal_diff': int(stats.get('goal_diff', 0) or 0),
                }
                
                standings.append(standing)
        
        print(f"✅ Scraped {len(standings)} NHL team standings")
        return standings
        
    except Exception as e:
        print(f"❌ Error scraping NHL standings: {e}")
        return []


def scrape_premier_league_standings():
    """Scrape Premier League standings from FBref"""
    url = "https://fbref.com/en/comps/9/Premier-League-Stats"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find the standings table (usually id='results...' or 'standings_...')
        table = soup.find('table', id=lambda x: x and ('standing' in x.lower() or 'results' in x.lower()))
        
        if not table:
            print("❌ Could not find Premier League standings table")
            return []
        
        standings = []
        rows = table.find('tbody').find_all('tr')
        
        for row in rows:
            # Get team name
            team_cell = row.find('th', {'data-stat': 'team'}) or row.find('td', {'data-stat': 'team'})
            if not team_cell:
                continue
            
            team_link = team_cell.find('a')
            if not team_link:
                continue
            
            team_name = team_link.text.strip()
            
            # Extract stats
            stats = {}
            for td in row.find_all('td'):
                stat_name = td.get('data-stat')
                if stat_name:
                    stats[stat_name] = td.text.strip()
            
            standing = {
                'team_name': team_name,
                'team_abbr': team_name[:3].upper(),
                'division': 'Premier League',
                'wins': int(stats.get('wins', 0) or 0),
                'draws': int(stats.get('ties', 0) or 0),
                'losses': int(stats.get('losses', 0) or 0),
                'points': int(stats.get('points', 0) or 0),
                'goals_for': int(stats.get('goals_for', 0) or 0),
                'goals_against': int(stats.get('goals_against', 0) or 0),
                'goal_diff': int(stats.get('goal_diff', 0) or 0),
                'games_played': int(stats.get('games', 0) or 0),
            }
            
            standings.append(standing)
        
        print(f"✅ Scraped {len(standings)} Premier League team standings")
        return standings
        
    except Exception as e:
        print(f"❌ Error scraping Premier League standings: {e}")
        return []


def scrape_nfl_standings():
    """Scrape NFL standings from pro-football-reference.com"""
    url = "https://www.pro-football-reference.com/years/2025/"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        standings = []
        
        # AFC and NFC tables
        for conference in ['AFC', 'NFC']:
            table = soup.find('table', id=f'{conference}')
            
            if not table:
                continue
            
            rows = table.find('tbody').find_all('tr')
            
            for row in rows:
                if row.find('th', class_='over_header'):
                    continue
                
                team_cell = row.find('th', {'data-stat': 'team'})
                if not team_cell:
                    continue
                
                team_link = team_cell.find('a')
                if not team_link:
                    continue
                
                team_name = team_link.text.strip()
                team_abbr = team_link.get('href', '').split('/')[2] if team_link.get('href') else None
                
                stats = {}
                for td in row.find_all('td'):
                    stat_name = td.get('data-stat')
                    if stat_name:
                        stats[stat_name] = td.text.strip()
                
                standing = {
                    'team_name': team_name,
                    'team_abbr': team_abbr,
                    'division': conference,
                    'wins': int(stats.get('wins', 0) or 0),
                    'losses': int(stats.get('losses', 0) or 0),
                    'ties': int(stats.get('ties', 0) or 0),
                    'win_pct': float(stats.get('win_loss_perc', 0) or 0),
                    'points_for': int(stats.get('points', 0) or 0),
                    'points_against': int(stats.get('points_opp', 0) or 0),
                    'point_diff': int(stats.get('point_diff', 0) or 0),
                }
                
                standings.append(standing)
        
        print(f"✅ Scraped {len(standings)} NFL team standings")
        return standings
        
    except Exception as e:
        print(f"❌ Error scraping NFL standings: {e}")
        return []


# Test function
if __name__ == "__main__":
    print("\n🏒 Testing NHL Standings Scraper...")
    nhl_standings = scrape_nhl_standings()
    if nhl_standings:
        print(f"\nFirst team: {nhl_standings[0]}")
    
    print("\n⚽ Testing Premier League Standings Scraper...")
    pl_standings = scrape_premier_league_standings()
    if pl_standings:
        print(f"\nFirst team: {pl_standings[0]}")
    
    print("\n🏈 Testing NFL Standings Scraper...")
    nfl_standings = scrape_nfl_standings()
    if nfl_standings:
        print(f"\nFirst team: {nfl_standings[0]}")

