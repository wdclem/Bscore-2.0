import sqlite3


def save_to_db(games):
    conn = sqlite3.connect("nhl_games.db")
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            awayTeam TEXT,
            awayScore TEXT,
            awayLogo TEXT,
            homeTeam TEXT,
            homeScore TEXT,
            homeLogo TEXT,
            scrapedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    for game in games:
        cursor.execute('''
            INSERT INTO games (awayTeam, awayScore, awayLogo, homeTeam, homeScore, homeLogo)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            game['awayTeam'], game['awayScore'], game['awayLogo'],
            game['homeTeam'], game['homeScore'], game['homeLogo']
        ))

    conn.commit()
    conn.close()


def get_games():
    conn = sqlite3.connect("nhl_games.db")
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            awayTeam TEXT,
            awayScore TEXT,
            awayLogo TEXT,
            homeTeam TEXT,
            homeScore TEXT,
            homeLogo TEXT,
            scrapedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    cursor.execute(
        """
        SELECT id, awayTeam, awayScore, awayLogo, homeTeam, homeScore, homeLogo, scrapedAt
        FROM games
        ORDER BY scrapedAt DESC, id DESC
        """
    )
    rows = cursor.fetchall()
    conn.close()

    games = [
        {
            "id": row[0],
            "awayTeam": row[1],
            "awayScore": row[2],
            "awayLogo": row[3],
            "homeTeam": row[4],
            "homeScore": row[5],
            "homeLogo": row[6],
            "scrapedAt": row[7],
        }
        for row in rows
    ]
    return games
