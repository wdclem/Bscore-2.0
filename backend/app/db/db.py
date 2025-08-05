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
