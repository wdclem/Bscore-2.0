import requests
from bs4 import BeautifulSoup, Comment
from datetime import datetime
import time
import random

def make_request_with_retry(url, headers, max_retries=3):
    """Make a request with retry logic and rate limiting"""
    for attempt in range(max_retries):
        try:
            # Add random delay to avoid rate limiting
            time.sleep(random.uniform(1, 3))
            
            response = requests.get(url, headers=headers, timeout=15)
            
            if response.status_code == 429:
                # Rate limited, wait longer before retry
                wait_time = (2 ** attempt) * 5  # Exponential backoff
                print(f"⚠️ Rate limited, waiting {wait_time} seconds before retry {attempt + 1}/{max_retries}")
                time.sleep(wait_time)
                continue
            elif response.status_code == 200:
                return response
            else:
                print(f"⚠️ HTTP {response.status_code} for {url}")
                if attempt < max_retries - 1:
                    time.sleep(2)
                    continue
                else:
                    return None
                    
        except Exception as e:
            print(f"⚠️ Request error on attempt {attempt + 1}: {e}")
            if attempt < max_retries - 1:
                time.sleep(2)
                continue
            else:
                return None
    
    return None

def scrape_nhl_player_stats(stat_type='scoring', limit=20):
    """
    Scrape NHL player stats from leaders page - BBC style approach
    Scrape each section independently and combine data
    """
    url = f"https://www.hockey-reference.com/leagues/NHL_2026_leaders.html"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = make_request_with_retry(url, headers)
        if not response:
            print("❌ Failed to get NHL data after retries")
            return []
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Helper function to scrape a leaders section
        def scrape_leaders_section(section_id, stat_name, limit):
            players = []
            section = soup.find('div', id=section_id)
            if section:
                table = section.find('table')
                if table:
                    rows = table.find_all('tr')[1:limit+1]  # Skip header row
                    
                    for row in rows:
                        cells = row.find_all('td')
                        if len(cells) >= 3:
                            player_cell = cells[1]
                            player_link = player_cell.find('a')
                            if player_link:
                                player_name = player_link.text.strip()
                                # Extract team from the span with class 'desc'
                                team_span = player_cell.find('span', class_='desc')
                                team = team_span.text.strip() if team_span else 'Unknown'
                                stat_value = int(cells[2].text.strip()) if cells[2].text.strip().isdigit() else 0
                                
                                players.append({
                                    'name': player_name,
                                    'team': team,
                                    'position': 'F',  # Default position
                                    stat_name: stat_value
                                })
            return players
        
        # Scrape each section independently
        goals_players = scrape_leaders_section('leaders_goals', 'goals', limit)
        assists_players = scrape_leaders_section('leaders_assists', 'assists', limit)
        points_players = scrape_leaders_section('leaders_points', 'points', limit)
        
        print(f"📊 Scraped sections: {len(goals_players)} goals, {len(assists_players)} assists, {len(points_players)} points")
        
        # Start with points leaders (the best overall players)
        all_players = {}
        
        # Helper function to add/update player stats
        def add_player_stats(player_data, stat_name):
            name = player_data['name']
            if name not in all_players:
                all_players[name] = {
                    'name': name,
                    'team': player_data['team'],
                    'position': 'F',
                    'goals': 0,
                    'assists': 0,
                    'points': 0
                }
            all_players[name][stat_name] = player_data[stat_name]
        
        # Start with points leaders (our base)
        for player in points_players:
            add_player_stats(player, 'points')
        
        # Create lookup dictionaries for goals and assists
        goals_lookup = {p['name']: p['goals'] for p in goals_players}
        assists_lookup = {p['name']: p['assists'] for p in assists_players}
        
        # Fill in goals and assists for our points leaders
        for name, player in all_players.items():
            if name in goals_lookup:
                player['goals'] = goals_lookup[name]
            if name in assists_lookup:
                player['assists'] = assists_lookup[name]
            
            # Calculate points = goals + assists (don't trust scraped points)
            player['points'] = player['goals'] + player['assists']
        
        # Convert to list and sort by calculated points
        players_list = list(all_players.values())
        players_list.sort(key=lambda x: x['points'], reverse=True)
        
        print(f"✅ Scraped {len(players_list)} NHL players with complete stats")
        return players_list[:limit]
        
    except Exception as e:
        print(f"❌ Error scraping NHL player stats: {e}")
        return []


def scrape_premier_league_player_stats(stat_type='scoring', limit=20):
    """
    Scrape Premier League player stats
    Note: FBRef Premier League page only shows team stats, not individual player stats
    This function returns empty to trigger fallback to mock data
    """
    print("⚠️ Premier League individual player stats not available on FBRef")
    print("⚠️ Using fallback mock data for Premier League")
    return []


def scrape_nfl_player_stats(stat_type='passing', limit=20):
    """
    Scrape NFL player stats
    stat_type: 'passing', 'rushing', 'receiving'
    """
    url = f"https://www.pro-football-reference.com/years/2025/{stat_type}.htm"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = make_request_with_retry(url, headers)
        if not response:
            print("❌ Failed to get NFL data after retries")
            return []
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find the stats table
        table = soup.find('table', id=stat_type)
        
        if not table:
            print(f"❌ Could not find NFL {stat_type} stats table")
            return []
        
        players = []
        rows = table.find('tbody').find_all('tr', limit=limit)
        
        for row in rows:
            # Skip separator rows
            if row.find('th', class_='over_header'):
                continue
            
            player_cell = row.find('td', {'data-stat': 'player'})
            if not player_cell:
                continue
            
            player_link = player_cell.find('a')
            if not player_link:
                continue
            
            player_name = player_link.text.strip()
            
            # Extract stats
            stats = {}
            for td in row.find_all('td'):
                stat_name = td.get('data-stat')
                if stat_name:
                    stats[stat_name] = td.text.strip()
            
            if stat_type == 'passing':
                player_data = {
                    'name': player_name,
                    'team': stats.get('team', ''),
                    'position': 'QB',
                    'games_played': int(stats.get('g', 0) or 0),
                    'pass_completions': int(stats.get('pass_cmp', 0) or 0),
                    'pass_attempts': int(stats.get('pass_att', 0) or 0),
                    'pass_yards': int(stats.get('pass_yds', 0) or 0),
                    'pass_touchdowns': int(stats.get('pass_td', 0) or 0),
                    'interceptions': int(stats.get('pass_int', 0) or 0),
                }
            elif stat_type == 'rushing':
                player_data = {
                    'name': player_name,
                    'team': stats.get('team', ''),
                    'position': stats.get('pos', 'RB'),
                    'games_played': int(stats.get('g', 0) or 0),
                    'rush_attempts': int(stats.get('rush_att', 0) or 0),
                    'rush_yards': int(stats.get('rush_yds', 0) or 0),
                    'rush_touchdowns': int(stats.get('rush_td', 0) or 0),
                }
            else:  # receiving
                player_data = {
                    'name': player_name,
                    'team': stats.get('team', ''),
                    'position': stats.get('pos', 'WR'),
                    'games_played': int(stats.get('g', 0) or 0),
                    'receptions': int(stats.get('rec', 0) or 0),
                    'rec_yards': int(stats.get('rec_yds', 0) or 0),
                    'rec_touchdowns': int(stats.get('rec_td', 0) or 0),
                }
            
            players.append(player_data)
        
        print(f"✅ Scraped {len(players)} NFL {stat_type} stats")
        return players
        
    except Exception as e:
        print(f"❌ Error scraping NFL {stat_type} stats: {e}")
        return []


def scrape_nba_player_stats(limit=20):
    """Scrape NBA player stats"""
    url = "https://www.basketball-reference.com/leagues/NBA_2026_leaders.html"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = make_request_with_retry(url, headers)
        if not response:
            print("❌ Failed to get NBA data after retries")
            return []
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find the stats table
        table = soup.find('table', id='per_game_stats')
        
        if not table:
            print("❌ Could not find NBA stats table")
            return []
        
        players = []
        rows = table.find('tbody').find_all('tr', limit=limit * 2)
        
        count = 0
        for row in rows:
            if count >= limit:
                break
                
            # Skip separator rows
            if row.find('th', class_='over_header'):
                continue
            
            player_cell = row.find('td', {'data-stat': 'player'})
            if not player_cell:
                continue
            
            player_link = player_cell.find('a')
            if not player_link:
                continue
            
            player_name = player_link.text.strip()
            
            # Extract stats
            stats = {}
            for td in row.find_all('td'):
                stat_name = td.get('data-stat')
                if stat_name:
                    stats[stat_name] = td.text.strip()
            
            player_data = {
                'name': player_name,
                'team': stats.get('team_id', ''),
                'position': stats.get('pos', ''),
                'games_played': int(stats.get('g', 0) or 0),
                'points_per_game': float(stats.get('pts_per_g', 0) or 0),
                'rebounds_per_game': float(stats.get('trb_per_g', 0) or 0),
                'assists_per_game': float(stats.get('ast_per_g', 0) or 0),
                'field_goal_pct': float(stats.get('fg_pct', 0) or 0),
            }
            
            players.append(player_data)
            count += 1
        
        print(f"✅ Scraped {len(players)} NBA player stats")
        return players
        
    except Exception as e:
        print(f"❌ Error scraping NBA player stats: {e}")
        return []


# Test function
if __name__ == "__main__":
    print("\n🏒 Testing NHL Player Stats Scraper...")
    nhl_players = scrape_nhl_player_stats(limit=10)
    if nhl_players:
        print(f"\nTop scorer: {nhl_players[0]}")
    
    print("\n⚽ Testing Premier League Player Stats Scraper...")
    pl_players = scrape_premier_league_player_stats(limit=10)
    if pl_players:
        print(f"\nTop scorer: {pl_players[0]}")
    
    print("\n🏈 Testing NFL Player Stats Scraper (Passing)...")
    nfl_players = scrape_nfl_player_stats('passing', limit=10)
    if nfl_players:
        print(f"\nTop passer: {nfl_players[0]}")
    
    print("\n🏀 Testing NBA Player Stats Scraper...")
    nba_players = scrape_nba_player_stats(limit=10)
    if nba_players:
        print(f"\nTop scorer: {nba_players[0]}")

