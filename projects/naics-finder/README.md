# NAICS Finder

A free, open-source web application for automatically finding NAICS (North American Industry Classification System) codes for businesses based on their URLs, company names, and addresses.

## Features

-  **Single Company Lookup**: Enter URL, name, and address for instant NAICS classification
-  **Batch Processing**: Process up to 10 companies simultaneously via CSV or paste
-  **Free-Only Architecture**: Uses Census Bureau data + keyword matching. No paid APIs required.
-  **Confidence Scoring**: See confidence levels (Green >80%, Yellow 50-80%, Red <50%)
-  **Web Scraping**: Extracts keywords from company websites for better matching
-  **Export Results**: Download as CSV or Excel

## Quick Start

### Prerequisites
- Docker & Docker Compose
- OR: Node.js 18+ and Python 3.11+

### Option 1: Docker (Recommended)
```bash
cd projects/naics-finder
docker-compose up
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Option 2: Manual Development Setup

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python scripts/seed_db.py  # Seed the database
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# App will be at http://localhost:3000
```

## Usage

### Single Lookup
1. Go to http://localhost:3000
2. Select "Single Lookup" tab
3. Enter company details:
   - URL (optional but recommended)
   - Company Name (required)
   - Address (optional)
4. Click "Find NAICS Code"
5. View results with confidence score

### Batch Upload
1. Go to http://localhost:3000
2. Select "Batch Upload" tab
3. Enter companies (one per line):
   ```
   https://example.com | Company Name | Address
   https://7catsmusic.com | 7 Cats Music | 70 Grove St, Ramsey, NJ
   ```
4. Or upload a CSV file with columns: url, name, address
5. Submit and wait for processing
6. Export results to CSV/Excel

## API Endpoints

```
POST /api/lookup          # Single company lookup
POST /api/lookup/batch    # Batch lookup (max 10)
GET  /api/jobs/{job_id}   # Check job status
GET  /api/export/{job_id}?format=csv  # Export results
GET  /api/health          # Health check
```

### Example API Call
```bash
curl -X POST http://localhost:8000/api/lookup \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://7catsmusic.com",
    "name": "7 Cats Music",
    "address": "70 Grove St, Ramsey, NJ 07446"
  }'
```

**Response:**
```json
{
  "company_id": "uuid",
  "name": "7 Cats Music",
  "naics_code": "451140",
  "naics_title": "Musical Instrument and Supplies Stores",
  "confidence": 0.87,
  "source": "census_match",
  "match_reason": "Matched keywords: music, instrument"
}
```

## Architecture

### Free-Only Stack (No Paid APIs Required)

| Component | Technology | Cost |
|-----------|-----------|------|
| Frontend | React 18 + Vite | Free |
| Backend | FastAPI (Python) | Free |
| Database | PostgreSQL 15 | Free |
| Cache/Queue | Redis 7 | Free |
| NAICS Data | Census Bureau 2022 | Free |
| Matching | Keyword + FTS | Free |
| Scraping | BeautifulSoup4 | Free |

**Total Monthly Cost: $0** (self-hosted or Railway free tier)

### Optional Paid Tiers (Commented Out)
- OpenAI GPT Classification (~$0.005/lookup)
- Middesk Business Verification (~$0.50-2.00/lookup)

These are available if you need higher confidence but are **not required**.

## Data Sources

### Census Bureau NAICS 2022 (Free)
- 885 industry codes included
- All sectors covered (Agriculture through Public Administration)
- Descriptions and keywords extracted

See: `backend/data/naics_2022_core.csv`

## Project Structure

```
naics-finder/
├── backend/
│   ├── app/                 # FastAPI application
│   │   ├── main.py         # Entry point
│   │   ├── models/         # SQLAlchemy models
│   │   ├── routers/        # API endpoints
│   │   │   ├── lookup.py   # Single lookup
│   │   │   ├── batch.py    # Batch processing
│   │   │   ├── jobs.py     # Job status
│   │   │   └── export.py   # Export results
│   │   ├── services/       # Business logic
│   │   │   ├── matching.py # NAICS matching engine
│   │   │   └── scraper.py  # Website scraper
│   │   └── workers/        # Celery tasks
│   ├── data/               # NAICS data files
│   │   └── naics_2022_core.csv
│   ├── scripts/            # Database seeding
│   │   └── seed_db.py
│   ├── services/           # Utility services
│   │   └── validation.py   # Input validation
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SingleLookup.tsx
│   │   │   ├── BatchUpload.tsx
│   │   │   └── ResultsTable.tsx
│   │   └── services/
│   │       └── api.ts
│   ├── package.json
│   └── vite.config.ts
└── docker-compose.yml
```

## How It Works

### Matching Algorithm
1. **Extract Keywords**: From company name + website content (if URL provided)
2. **Score Against NAICS**: Keyword frequency matching against Census Bureau data
3. **Confidence Calculation**: Based on keyword matches and source (website vs name only)
4. **Return Best Match**: Top NAICS code with confidence score

### Confidence Levels
- **> 80% (Green)**: Strong match, multiple keyword hits from website data
- **50-80% (Yellow)**: Moderate match, some keyword overlap
- **< 50% (Red)**: Weak match, use manual verification

## Development

### Adding New NAICS Keywords
Edit `backend/extra/business_keywords.json`:
```json
{
  "your_keyword": ["123456", "789012"]
}
```
Then run `python scripts/seed_db.py` to reload.

### Running Tests
```bash
cd backend
pytest tests/

# With coverage
pytest --cov=app tests/
```

## Deployment

### Railway (Recommended Free Tier)
```bash
railway login
railway init
railway up
```

### Render
1. Create new Web Service
2. Connect GitHub repo
3. Set build command: `docker build -t naics-finder ./backend`
4. Set start command: `docker run -p 8000:8000 naics-finder`

### Vercel (Frontend Only)
```bash
cd frontend
vercel --prod
```

## Environment Variables

Create `.env` from `.env.example`:
```bash
# Required (Free)
DATABASE_URL=postgresql://postgres:postgres@localhost/naicsdb
REDIS_URL=redis://localhost:6379/0

# Optional (Paid Tiers)
# OPENAI_API_KEY=sk-...      # Only if using AI classification
# MIDDESK_API_KEY=...        # Only if using business verification

# Config
CELERY_WORKER_CONCURRENCY=4
ENVIRONMENT=development
```

## Troubleshooting

### Docker Issues
```bash
# Reset and rebuild
docker-compose down -v
docker-compose up --build
```

### Database Connection
- Check PostgreSQL is running: `docker-compose ps`
- Verify credentials in `.env`
- Try: `python scripts/seed_db.py` to reseed

### Low Confidence Results
- Include company URL for better keyword extraction
- Check if business is in the US (non-US companies may not match well)
- Verify company name is spelled correctly
- Try including the specific business type (e.g., "7 Cats Music Store" vs "7 Cats Music")

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes
4. Test thoroughly
5. PR to main

## License

MIT License - See LICENSE file

## Credits

- NAICS data from [U.S. Census Bureau](https://www.census.gov/naics/)
- Built with FastAPI, React, PostgreSQL
- Free, open-source solution for NAICS classification

---

**Need help?** Open an issue or check the full design doc at `DESIGN.md`
