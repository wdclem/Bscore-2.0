# BetterScore 🏆

A modern sports scores application with beautiful themes, featuring game data from multiple leagues, flip-card design, and automated scraping.

## ✨ Features

- 🏈 **Multi-League Support**: NFL, NHL, NBA, MLB, Premier League
- 🎴 **Trading Card Design**: Interactive flip cards with detailed game info
- 🎨 **3 Video Themes**: Dark, Light, and Default video backgrounds
- 🔄 **Auto-Scraping**: Updates game data every 6 hours
- 📱 **Responsive Design**: Works on all devices
- ⚡ **Fast & Optimized**: Smart pagination and caching
- 🎯 **Team Filtering**: Filter games by specific teams
- 🏟️ **Detailed Stats**: Venue, attendance, referee info

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: FastAPI, Python, SQLAlchemy
- **Database**: PostgreSQL
- **Scraping**: BeautifulSoup4, Requests
- **Deployment**: Docker Compose, Vercel, Self-hosted

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)

### Quick Start (Local Development)

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd Bscore-2.0
   cp ENV_EXAMPLE.txt .env
   ```

2. **Start all services**
   ```bash
   docker compose up --build
   ```

3. **Run initial scrape** (optional)
   ```bash
   docker compose exec backend python app/main.py --once
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001
   - Database: localhost:5433

### 🌐 Production Deployment

See detailed guides:
- **Full Setup**: `DEPLOYMENT_CHECKLIST.md`
- **Android/Pi Backend**: `DEPLOYMENT.md` 
- **Vercel Frontend**: `VERCEL_DEPLOY.md`

**Quick Summary:**
1. Deploy backend on Android phone/Raspberry Pi via Termux + Cloudflare Tunnel
2. Deploy frontend on Vercel (free)
3. Total cost: **$0/month** 🎉

## 🛡️ Android Safety & Security

**Is it safe to use my Android phone as a server?**

✅ **Very Safe!** Here's why:

### What We Do:
- Install **Termux** (official terminal app from Google Play)
- Run Python/Node.js in a **sandboxed environment**
- **No root access** required
- **No system modifications**

### Safety Guarantees:
- ❌ **Won't brick your phone** - everything runs in Termux's isolated environment
- ❌ **Won't void warranty** - no system-level changes
- ❌ **Won't corrupt your phone** - no access to system files
- ❌ **Won't create security vulnerabilities** - completely isolated

### Potential Considerations:
- 🔋 **Battery usage** - keeps phone awake (normal for servers)
- 💾 **Storage space** - ~1-2GB for Docker/Python
- 🌡️ **Heat generation** - normal for sustained CPU use

### Easy Rollback:
If anything goes wrong:
1. Uninstall Termux
2. Clear app data  
3. Phone returns to completely normal state

**Bottom line:** This is safer than installing most games from the Play Store! 🎮

## 📡 API Endpoints

- `GET /api/leagues` - Get all available leagues
- `GET /api/leagues/{league}/games?limit=10&offset=0` - Get games for a league
- `GET /api/leagues/{league}/teams` - Get teams for a league

## 🔄 Automated Scraping

The scraper runs automatically every 6 hours and:
- ✅ Fetches latest game data from FBref and Sports Reference
- ✅ Updates existing games (scores, attendance, venue)
- ✅ Adds new games automatically
- ✅ Skips unchanged data (efficient)

**Manual trigger:**
```bash
docker compose exec scraper python app/main.py --once
```

## Useful Commands

### DB Performance

```bash
# See what data is being returned
curl "http://localhost:8001/leagues/nfl/games?limit=10&offset=0" | jq .

# Test API response time
curl -w "@-" -o /dev/null -s "http://localhost:8001/leagues/nfl/games?limit=10&offset=0" <<< "
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
"

# Check how many games exist per league
docker exec bscore-20-db-1 psql -U postgres -d nhl_db -c "
SELECT l.name as league, COUNT(g.id) as game_count 
FROM leagues l 
LEFT JOIN games g ON l.id = g.league_id 
GROUP BY l.id, l.name 
ORDER BY game_count DESC;
"
```

### Database Management

```bash
# Run scraper to populate data
docker exec -it <backend-container> python -m app.main --once

# Access database directly
docker exec -it bscore-20-db-1 psql -U postgres -d nhl_db
```

## 📁 Project Structure

```
Bscore-2.0/
├── frontend/                    # Next.js application
│   ├── src/
│   │   ├── app/                # App router pages
│   │   │   ├── page.js         # Home with video backgrounds
│   │   │   └── [league]/games/ # Game cards page
│   │   ├── components/         # React components
│   │   │   ├── GameCard.jsx    # Flip card component
│   │   │   ├── Header.jsx      # Theme-aware header
│   │   │   └── ThemeToggle.jsx # Dark/Light toggle
│   │   └── lib/                # API client utilities
│   └── theme-system/           # Reusable theme package
│       ├── config/themes.js    # Theme definitions
│       └── contexts/           # Theme context
├── backend/                     # FastAPI application
│   ├── app/
│   │   ├── api_server.py       # REST API
│   │   ├── main.py             # Scraper scheduler
│   │   ├── models/             # SQLAlchemy models
│   │   │   ├── game.py
│   │   │   ├── team.py
│   │   │   └── league.py
│   │   ├── league_scrapper.py  # NFL/NHL/NBA/MLB scraper
│   │   └── premier_league_scrapper.py
├── docker-compose.yml          # Multi-service orchestration
├── DEPLOYMENT.md               # Self-hosting guide
├── VERCEL_DEPLOY.md           # Frontend deployment
└── DEPLOYMENT_CHECKLIST.md    # Quick reference
```

## 🎯 Roadmap

### ✅ Completed (Phase 1)
- [x] Multi-league support with automated scraping
- [x] Beautiful video background themes (3 variants)
- [x] Trading card flip design
- [x] Team filtering and pagination
- [x] Automated scraper service (6-hour intervals)

### 🚧 Phase 2: Deployment
- [ ] Deploy backend on Android/Pi
- [ ] Deploy frontend on Vercel
- [ ] Setup Cloudflare Tunnel
- [ ] Production monitoring

### 📅 Phase 3: Features
- [ ] Game status badges (Final/Scheduled)
- [ ] League standings tables
- [ ] Team W-L-D records
- [ ] Top scorers leaderboard
- [ ] Favorite teams (localStorage)
- [ ] Share game links
- [ ] Mobile optimization
- [ ] Score distribution charts
- [ ] Home vs Away statistics
- [ ] Venue statistics

### 🎪 Dream Features
- [ ] Player statistics and profiles
- [ ] Game details modal with lineups
- [ ] **Games calendar view** (monthly/weekly with team filtering)
- [ ] Historical data analysis
- [ ] Prediction features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📝 License

MIT

## 🙏 Acknowledgments

- Data sourced from FBref and Sports Reference
- Video backgrounds from [your source]
- Built with love and ☕