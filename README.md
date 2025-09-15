# Bscore-2.0

A modern sports scores application built with Next.js and FastAPI, featuring real-time game data, team filtering, and responsive design.

## Features

- 🎯 **Multi-League Support**: NFL, NHL, NBA, MLB, Premier League
- 🎯 **Team Filtering**: Filter games by specific teams
- 📱 **Responsive Design**: Works on all devices
- ⚡ **Fast Loading**: Pagination and optimized API calls
- 🎨 **Theme System**: Customizable UI themes
- 🔄 **Real-time Data**: Live game scores and updates

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: FastAPI, Python, SQLAlchemy
- **Database**: PostgreSQL
- **Deployment**: Docker, Docker Compose

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Bscore-2.0
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001
   - Database: localhost:5433

### Development

```bash
# Start frontend development server
cd frontend
npm run dev

# Start backend development server
cd backend
python -m app.main
```

## API Endpoints

- `GET /leagues` - Get all available leagues
- `GET /leagues/{league}/games` - Get games for a league
- `GET /leagues/{league}/teams` - Get teams for a league

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

## Project Structure

```
Bscore-2.0/
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/       # App router pages
│   │   ├── components/ # React components
│   │   └── lib/       # API client utilities
│   └── theme-system/  # Reusable theme system
├── backend/           # FastAPI application
│   ├── app/
│   │   ├── api_server.py
│   │   ├── models/    # Database models
│   │   └── scrapers/  # Data scrapers
└── docker-compose.yml
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT