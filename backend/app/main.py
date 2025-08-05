from nhl_scraper import fetch_nhl_data
from db.db import save_to_db
if __name__ == "__main__":
    nhl_games = fetch_nhl_data()
    save_to_db(nhl_games)
    print("✅ Games scraped and saved.")
