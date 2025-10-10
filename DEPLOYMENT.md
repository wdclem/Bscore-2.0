# 🚀 BetterScore Deployment Guide

## 📱 Deploying on Android Phone (via Termux)

### Prerequisites
- Android phone (any version 7+)
- Stable power source (keep plugged in)
- WiFi connection
- ~2GB free storage

---

## 🔧 Part 1: Setup Termux on Android

### Step 1: Install Termux
1. Download **Termux** from [F-Droid](https://f-droid.org/packages/com.termux/) (NOT Google Play - outdated)
2. Open Termux app

### Step 2: Update packages
```bash
pkg update && pkg upgrade -y
```

### Step 3: Install required packages
```bash
pkg install -y python postgresql git
```

### Step 4: Install Python dependencies
```bash
pip install --upgrade pip
pip install fastapi uvicorn sqlalchemy psycopg2-binary requests beautifulsoup4 apscheduler python-dotenv
```

---

## 📦 Part 2: Setup Backend

### Step 1: Clone your repository
```bash
cd ~
git clone YOUR_GITHUB_REPO_URL Bscore-2.0
cd Bscore-2.0/backend
```

### Step 2: Setup PostgreSQL
```bash
# Initialize database
initdb $HOME/postgres_data

# Start PostgreSQL
pg_ctl -D $HOME/postgres_data -l logfile start

# Create database
createdb nhl_db
```

### Step 3: Configure environment
```bash
cd ~/Bscore-2.0
cat > .env << 'EOF'
POSTGRES_DB=nhl_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/nhl_db
EOF
```

### Step 4: Test backend locally
```bash
cd backend
python app/api_server.py
```

Should see: `INFO: Uvicorn running on http://0.0.0.0:8001`

Press Ctrl+C to stop.

---

## 🌐 Part 3: Expose to Internet (Cloudflare Tunnel)

### Step 1: Install Cloudflare Tunnel
```bash
pkg install -y cloudflared
```

### Step 2: Login to Cloudflare
```bash
cloudflared tunnel login
```

This will open a browser. Login to Cloudflare (create free account if needed).

### Step 3: Create a tunnel
```bash
cloudflared tunnel create bscore-backend
```

Note the tunnel ID that appears.

### Step 4: Create tunnel config
```bash
mkdir -p ~/.cloudflared
cat > ~/.cloudflared/config.yml << 'EOF'
tunnel: YOUR_TUNNEL_ID
credentials-file: /data/data/com.termux/files/home/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: YOUR_DOMAIN.com
    service: http://localhost:8001
  - service: http_status:404
EOF
```

### Step 5: Route your domain
```bash
cloudflared tunnel route dns bscore-backend YOUR_DOMAIN.com
```

### Step 6: Start services
```bash
# Terminal 1: Start API
cd ~/Bscore-2.0/backend
python app/api_server.py

# Terminal 2 (swipe from left in Termux): Start scraper
python app/main.py

# Terminal 3: Start Cloudflare tunnel
cloudflared tunnel run bscore-backend
```

---

## 🎨 Part 4: Deploy Frontend on Vercel

### Step 1: Update frontend API endpoint
1. Create `.env.local` in frontend folder
2. Add: `NEXT_PUBLIC_API_URL=https://YOUR_DOMAIN.com`

### Step 2: Deploy to Vercel
```bash
cd frontend
npx vercel
```

Follow prompts:
- Login to Vercel
- Deploy!

---

## 🔄 Keep Services Running (Background)

### Install Termux:Boot (optional but recommended)
1. Install from F-Droid
2. Run once to enable
3. Create startup script:

```bash
mkdir -p ~/.termux/boot
cat > ~/.termux/boot/start-bscore.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
cd ~/Bscore-2.0/backend
python app/api_server.py &
python app/main.py &
cloudflared tunnel run bscore-backend &
EOF

chmod +x ~/.termux/boot/start-bscore.sh
```

Now services auto-start when phone boots!

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check PostgreSQL is running
pg_ctl status

# If not, start it
pg_ctl -D $HOME/postgres_data -l logfile start
```

### Can't access from internet
```bash
# Check tunnel status
cloudflared tunnel info bscore-backend

# Check API is running
curl http://localhost:8001
```

### Out of memory
- Close other apps
- Restart phone
- Consider Raspberry Pi upgrade

---

## 📊 Monitoring

### Check logs
```bash
# API logs
tail -f ~/Bscore-2.0/backend/logfile

# Scraper logs
tail -f ~/Bscore-2.0/backend/scraper.log
```

### Check database
```bash
psql nhl_db
SELECT COUNT(*) FROM games;
\q
```

---

## 🔄 Updates

### Pull latest code
```bash
cd ~/Bscore-2.0
git pull
```

### Restart services
```bash
pkill -f "python app"
pkill cloudflared
# Then start again
```

---

## 💡 Tips
- Keep phone plugged in always
- Use a phone stand near router
- Consider USB fan to prevent overheating
- Monitor battery health
- Set screen timeout to minimum

---

## 🎓 What You Learned
✅ Linux server administration (Termux)
✅ Database setup (PostgreSQL)
✅ Process management
✅ Tunneling and networking
✅ Environment configuration
✅ Service monitoring

**Next Step:** Migrate to Raspberry Pi for better reliability!

