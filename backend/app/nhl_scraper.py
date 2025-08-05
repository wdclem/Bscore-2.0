import requests
from bs4 import BeautifulSoup
from datetime import datetime
import sqlite3

BASE_URL = "https://www.hockey-reference.com/boxscores/"

def fetch_nhl_data():
    response = requests.get(BASE_URL)
    soup = BeautifulSoup(response.content, 'html.parser')
    games = []
    current_year = datetime.now().year

    for game_summary in soup.select('.game_summary.nohover'):
        game = {}

        away_row = game_summary.select_one('table.teams tbody tr:nth-of-type(1)')
        home_row = game_summary.select_one('table.teams tbody tr:nth-of-type(2)')

        away_team_link = away_row.select_one('td a')
        home_team_link = home_row.select_one('td a')

        if not away_team_link or not home_team_link:
            continue

        # Away team
        game['awayTeam'] = away_team_link.text.strip()
        game['awayScore'] = away_row.select_one('td.right').text.strip()
        game['awayLogo'] = f"https://cdn.ssref.net/req/202305101/tlogo/hr/{away_team_link['href'].split('/')[2]}-{current_year}.png"

        # Home team
        game['homeTeam'] = home_team_link.text.strip()
        game['homeScore'] = home_row.select_one('td.right').text.strip()
        game['homeLogo'] = f"https://cdn.ssref.net/req/202305101/tlogo/hr/{home_team_link['href'].split('/')[2]}-{current_year}.png"

        games.append(game)

    return games
