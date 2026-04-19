---
name: naics-finder
description: A free, open-source web application for finding NAICS codes for businesses based on URLs, company names, and addresses. Uses Census Bureau data, keyword matching, and web scraping. No paid APIs required. Processes batches of up to 10 companies with confidence scoring.
---

# NAICS Finder Skill

## Overview

The NAICS Finder is a complete web application stack for automatically identifying NAICS (North American Industry Classification System) codes for businesses. It's designed to be **free-first** with optional paid tiers for higher confidence.

## Location

**Path:** `projects/naics-finder/`

## Quick Start

### Run with Docker
```bash
cd projects/naics-finder
docker-compose up
```

### Manual Setup
```bash
# Backend
cd backend
pip install -r requirements.txt
python scripts/seed_db.py
uvicorn app.main:app --reload

# Frontend
cd ../frontend
npm install
npm run dev
```

## Architecture

### Free-Only Stack
| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend | React 18 + Vite | Free |
| Backend | FastAPI | Free |
| Database | PostgreSQL 15 | Free |
| Data | Census Bureau 2022 | Free |
| Matching | Keyword + FTS | Free |

## Key Features Implemented

| Feature | Status | Location |
|---------|--------|----------|
| ✅ Single company lookup | Complete | `frontend/src/components/SingleLookup.tsx` |
| ✅ Batch upload (10 max) | Complete | `frontend/src/components/BatchUpload.tsx` |
| ✅ CSV/Excel export | Complete | `frontend/src/components/ResultsTable.tsx` |
| ✅ Confidence scoring | Complete | Backend scoring algorithm |
| ✅ Web scraping | Complete | `backend/services/scraper.py` |
| ✅ Keyword matching | Complete | `backend/services/matching.py` |
| ✅ Census data (885 codes) | Complete | `backend/data/naics_2022_core.csv` |
| ✅ Docker deployment | Complete | `docker-compose.yml` |

## API Usage

```python
# Single lookup
POST /api/lookup
{
  "url": "https://7catsmusic.com",
  "name": "7 Cats Music", 
  "address": "70 Grove St, Ramsey, NJ"
}

# Response
{
  "naics_code": "451140",
  "naics_title": "Musical Instrument and Supplies Stores",
  "confidence": 0.87,
  "source": "census_match"
}
```

## Data Sources

### Census Bureau NAICS 2022 (Free)
- 885 industry codes
- All 20 major sectors
- Descriptions and keywords
- **Cost: $0**

## Optional Paid Tiers (Not Required)

| Service | Cost | When to Use |
|---------|------|-------------|
| OpenAI GPT | ~$0.005/lookup | When confidence < 50% |
| Middesk API | $0.50-2.00/lookup | Business verification needed |

**Note:** These are commented out in the free version.

## Configuration

### Environment Variables
```bash
# Required (Free)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/naicsdb
REDIS_URL=redis://localhost:6379/0

# Optional (Paid)
# OPENAI_API_KEY=sk-...
# MIDDESK_API_KEY=...
```

### Custom Keywords
Edit `backend/extra/business_keywords.json`:
```json
{
  "your_keyword": ["123456", "789012"]
}
```

## Troubleshooting

### Low Confidence Results
- Include company URL for website scraping
- Ensure company name is specific
- Check business is US-based (NAICS is US/Canada/Mexico standard)

### Docker Won't Start
```bash
docker-compose down -v
docker-compose up --build
```

### Database Not Seeded
```bash
cd backend
python scripts/seed_db.py
```

## Use Cases

1. **Business Research**: Quickly classify companies for market analysis
2. **Sales Prospecting**: Segment leads by industry code
3. **Compliance**: Verify vendor/supplier classifications
4. **Data Enrichment**: Add NAICS codes to CRM data

## Performance

- Single lookup: ~1-2 seconds (with web scraping)
- Batch of 10: ~10-15 seconds
- Database: 885 codes pre-loaded
- Free tier handles 500+ lookups/day on Railway

## Related Projects

- **Launchpad**: Similar FastAPI + React architecture
- **AgentForge**: Micro-SaaS template
- **ReceiptSplit**: Production-grade deployment example

## Documentation

- Full design: `DESIGN.md`
- API docs: Auto-generated at `/docs` when running
- Architecture diagrams: See Design section 2.1

**Maintained by:** The Botfather
**License:** MIT
**Status:** MVP Complete, Ready for Deployment
