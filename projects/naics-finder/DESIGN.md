# NAICS Finder - Technical Design Document

## Executive Summary

This document provides a comprehensive technical design for the NAICS Finder application, a web service that automatically identifies NAICS codes for companies based on URLs, names, and addresses. The recommended approach combines **free Census Bureau NAICS data** with **hybrid AI-traditional matching** for optimal cost-effectiveness and accuracy.

---

## 1. Research Report: NAICS Data Sources

### 1.1 Data Source Comparison Matrix

| Source | Type | Cost | Accuracy | Match Method | Rate Limits | Best For |
|--------|------|------|----------|--------------|-------------|----------|
| **Census Bureau (Recommended)** | Free CSV | $0 | 100% (reference) | Keyword/Description | None | Self-hosted matching |
| **SBA NAICS** | Free Web | $0 | High | Search portal | Manual only | Verification |
| **NAICS.com API** | Paid API | $0.05-0.20/lookup | High | Name/Address lookup | Varies | Direct lookup |
| **Relativity6 API** | Paid API | Custom | Very High (>95%) | ML/AI model | Enterprise | High-volume automation |
| **Middesk API** | Paid API | $0.50-2.00/lookup | Very High | Business verification | 1000/min | Verification + NAICS |
| **D&B Direct** | Paid API | $$$ (enterprise) | Very High | Extensive database | Contract | Enterprise enrichment |
| **ZoomInfo** | Paid API | $$$ (enterprise) | Very High | Proprietary | Contract | Sales/marketing |
| **OpenAI GPT** | AI API | $0.001-0.02/lookup | Good (85-90%) | LLM reasoning | RPM limits | Hybrid fallback |

### 1.2 Detailed Analysis

#### 1.2.1 **Census Bureau NAICS (PRIMARY - FREE)**
- **URL**: https://www.census.gov/naics/
- **Downloads Available**: 
  - 2022 NAICS manual (Excel/CSV)
  - Index files with keywords
  - Descriptions and cross-references
  - ~1,050 industry codes (2-6 digit granularity)
- **Pros**: Completely free, authoritative source, no rate limits, self-hostable
- **Cons**: No direct company lookup; requires custom matching logic
- **Format**: CSV/Excel files updated every 5 years
- **Files Needed**:
  - `naics_2022_codes.csv` - All codes and descriptions
  - `naics_2022_index.csv` - Keyword index for matching
  - `naics_2022_crossrefs.csv` - Cross-references

#### 1.2.2 **Code for America NAICS API (FREE)**
- **URL**: http://api.naics.us/v0/
- **GitHub**: https://github.com/codeforamerica/naics-api
- **Endpoints**:
  - `GET /q?year=2022&code={code}` - Get specific code
  - `GET /s?year=2022&terms={search}` - Search titles/index
- **Pros**: Free, machine-readable, Node.js based
- **Cons**: Unofficial, limited uptime guarantee, data may be stale
- **Use**: Good for development; recommend self-hosting for production

#### 1.2.3 **NAICS.com API (PAID)**
- **URL**: https://www.naics.com/business-intelligence-api/
- **Pricing**: Estimated $0.05-0.20 per lookup
- **Input**: Company name + address + state + country
- **Output**: NAICS code(s) with confidence
- **Pros**: Direct business lookup, official association
- **Cons**: Costly at scale, limited free tier

#### 1.2.4 **Relativity6 API (PREMIUM AI)**
- **URL**: https://www.relativity6.com/industry-classification-api
- **Pricing**: Custom enterprise pricing (~$0.10-0.50/lookup)
- **Features**: 
  - Returns NAICS codes in <2 seconds
  - Uses ML on name + address only
  - 95%+ accuracy claim
  - Insurance/finance focused
- **Pros**: Very high accuracy, purpose-built
- **Cons**: Expensive, enterprise sales process

#### 1.2.5 **Middesk API (VERIFICATION)**
- **URL**: https://www.middesk.com/naics-code-api
- **Pricing**: $0.50-$2.00 per lookup
- **Features**:
  - Business verification + NAICS
  - Live business registration data
  - Address validation included
- **Pros**: Accurate via state registries
- **Cons**: Higher cost, verification-first design

### 1.3 Recommended Strategy

**Primary Approach: Hybrid Tiered Matching**

```
┌─────────────────────────────────────────────────────────────────┐
│  TIER 1: Self-Hosted Census DB + NLP Matching (Free)           │
│  ├── Website scraping → keywords → NAICS index matching        │
│  ├── Business name → semantic similarity → descriptions        │
│  └── Confidence: 60-75%                                          │
├─────────────────────────────────────────────────────────────────┤
│  TIER 2: AI-Enhanced Matching (Low Cost ~$0.005/lookup)        │
│  ├── GPT-4/Claude with Census context                          │
│  ├── Business description extraction + classification            │
│  └── Confidence: 80-90%                                        │
├─────────────────────────────────────────────────────────────────┤
│  TIER 3: PAID API Fallback (As Needed ~$0.50/lookup)           │
│  ├── Middesk/NAICS.com for low-confidence matches              │
│  └── Confidence: 95%+                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Technical Architecture

### 2.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        React Frontend                               │    │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐     │    │
│  │  │   Home/      │ │    Batch     │ │      Results Dashboard   │     │    │
│  │  │   Input Form │ │    Upload    │ │  (Table + Export +       │     │    │
│  │  │              │ │    (CSV)     │ │   Confidence Scores)     │     │    │
│  │  └──────────────┘ └──────────────┘ └──────────────────────────┘     │    │
│  └───────────────┬──────────────────────────────────────────────────────┘    │
└──────────────────┼──────────────────────────────────────────────────────────┘
                   │ HTTPS/JSON
┌──────────────────▼──────────────────────────────────────────────────────────┐
│                           API LAYER (FastAPI)                                │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Core Application Server                           │    │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐  │    │
│  │  │ /api/lookup  │ │/api/batch    │ │ /api/export  │ │/api/jobs │  │    │
│  │  │  Single      │ │  (async)     │ │  CSV/Excel   │ │  status  │  │    │
│  │  │  company     │ │  (10 items)  │ │              │ │          │  │    │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────┘  │    │
│  └───────────────┬─────────────────────────────────────────────────────┘    │
└──────────────────┼──────────────────────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────────────────────┐
│                      PROCESSING LAYER (Celery Workers)                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         Job Queue (Redis)                           │    │
│  └─────────────────────────┬───────────────────────────────────────────┘    │
│                            │                                                │
│  ┌─────────────────────────▼───────────────────────────────────────────┐    │
│  │                      Worker Pool                                     │    │
│  │  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────┐    │    │
│  │  │ Scraper      │   │ Matcher      │   │ AI Classifier        │    │    │
│  │  │ Worker       │   │ Worker       │   │ (Optional)           │    │    │
│  │  │ - Playwright │   │ - Census DB  │   │ - OpenAI/Claude      │    │    │
│  │  │ - URL fetch  │   │ - Vector sim │   │ - Fallback           │    │    │
│  │  └──────────────┘   └──────────────┘   └──────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────────────────────┐
│                           DATA LAYER                                         │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐             │
│  │   PostgreSQL     │ │   Redis          │ │   File Storage   │             │
│  │   - Companies    │ │   - Cache        │ │   - CSV uploads   │             │
│  │   - Jobs/Tasks   │ │   - Queue        │ │   - Exports       │             │
│  │   - Results      │ │   - Sessions     │ │                  │             │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘             │
│  ┌──────────────────────────────────────────────────────────────────┐     │
│  │                    NAICS Reference Data (Static)                   │     │
│  │  - Census 2022 CSVs    - Keywords Index    - Embeddings         │     │
│  └──────────────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Database Schema

```sql
-- Core Tables

-- Companies being looked up
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id),
    url VARCHAR(2048),
    name VARCHAR(500) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zip VARCHAR(10),
    country VARCHAR(2) DEFAULT 'US',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classification results
CREATE TABLE naics_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    naics_code VARCHAR(6) NOT NULL,
    naics_title VARCHAR(500),
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    source VARCHAR(50), -- 'census_match', 'ai_classify', 'paid_api'
    match_reason TEXT, -- explanation of match
    tier INTEGER DEFAULT 1, -- 1, 2, or 3
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Batch jobs
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    total_count INTEGER DEFAULT 0,
    processed_count INTEGER DEFAULT 0,
    input_method VARCHAR(20), -- 'paste', 'csv_upload'
    original_filename VARCHAR(255),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scraped website cache
CREATE TABLE website_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url VARCHAR(2048) UNIQUE NOT NULL,
    title VARCHAR(500),
    description TEXT,
    keywords TEXT[],
    raw_text TEXT,
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- NAICS Reference Data (Census import)
CREATE TABLE naics_codes (
    code VARCHAR(6) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    level INTEGER NOT NULL, -- 2, 3, 4, 5, 6 digit
    parent_code VARCHAR(6) REFERENCES naics_codes(code),
    examples TEXT[],
    keywords TEXT[],
    year INTEGER DEFAULT 2022
);

-- Keyword index for fast matching
CREATE TABLE naics_keywords (
    id SERIAL PRIMARY KEY,
    naics_code VARCHAR(6) REFERENCES naics_codes(code),
    keyword VARCHAR(200) NOT NULL,
    weight DECIMAL(3,2) DEFAULT 1.0,
    source VARCHAR(50) -- 'title', 'description', 'index_file'
);

-- Enable text search
CREATE INDEX idx_naics_codes_fts ON naics_codes 
    USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '')));

CREATE INDEX idx_naics_keywords_lookup ON naics_keywords(keyword);
CREATE INDEX idx_results_company ON naics_results(company_id);
```

### 2.3 API Endpoints

```yaml
openapi: 3.0.0
info:
  title: NAICS Finder API
  version: 1.0.0

paths:
  /api/health:
    get:
      summary: Health check
      responses:
        200:
          description: Service is healthy

  /api/lookup:
    post:
      summary: Single company lookup
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                url: { type: string }
                name: { type: string }
                address: { type: string }
                city: { type: string }
                state: { type: string }
                zip: { type: string }
      responses:
        200:
          description: NAICS classification results

  /api/lookup/batch:
    post:
      summary: Batch lookup (up to 10 companies)
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                companies:
                  type: array
                  maxItems: 10
                  items:
                    type: object
                    properties:
                      url: { type: string }
                      name: { type: string }
                      address: { type: string }
      responses:
        202:
          description: Job accepted

  /api/jobs/{job_id}:
    get:
      summary: Get job status and results
      parameters:
        - name: job_id
          in: path
          required: true
          schema:
            type: string
      responses:
        200:
          description: Job status

  /api/export/{job_id}:
    get:
      summary: Export results as CSV or Excel
      parameters:
        - name: job_id
          in: path
          required: true
          schema: { type: string }
        - name: format
          in: query
          schema: 
            type: string
            enum: [csv, xlsx]
      responses:
        200:
          description: File download

  /api/naics/search:
    get:
      summary: Search NAICS codes by keyword
      parameters:
        - name: q
          in: query
          required: true
          schema: { type: string }
      responses:
        200:
          description: Matching NAICS codes
```

### 2.4 Tech Stack Recommendation

| Layer | Technology | Reason |
|-------|-----------|--------|
| **Frontend** | React 18 + Tailwind CSS | Industry standard, fast UI dev |
| **State** | React Query + Zustand | Server state + client state |
| **Backend** | FastAPI (Python) | Fast, modern, async native |
| **Task Queue** | Celery + Redis | Proven, scalable background jobs |
| **Database** | PostgreSQL 15 | JSON support, text search, reliable |
| **Vector DB** | pgvector (PostgreSQL) | Store/search embeddings in PG |
| **Scraping** | Playwright + BeautifulSoup | Modern websites + fallback |
| **AI** | OpenAI API (GPT-4-mini) | Cost-effective classification |
| **Deployment** | Railway/Render | Easy, generous free tiers |

---

## 3. Implementation Plan

### 3.1 MVP Scope (Week 1-2)

**Core Features:**
- [ ] Web interface for pasting up to 10 companies
- [ ] CSV upload for batch input
- [ ] Website scraping (title, meta description, h1, keywords)
- [ ] Census NAICS DB import and basic keyword matching
- [ ] Results table with confidence scores
- [ ] CSV export

**Out of MVP:**
- AI classification tier
- Address-based lookup
- Excel export
- User accounts
- Historical tracking

### 3.2 Development Roadmap

```
Week 1: Foundation
├── Day 1-2: Project setup, DB schema, Census data import
├── Day 3-4: Backend API (lookup endpoints, job queue)
└── Day 5: Frontend shell, input forms

Week 2: Core Features
├── Day 6-7: Web scraping service
├── Day 8-9: Matching algorithm (v1 - keyword based)
└── Day 10: Results UI, CSV export, testing

Week 3: Enhancement (Post-MVP)
├── Day 11-12: AI classification fallback
├── Day 13: Address parsing integration
└── Day 14: Excel export, confidence tuning

Week 4: Polish
├── Day 15-16: Testing, error handling
├── Day 17: Performance optimization
└── Day 18-20: Documentation, deployment
```

### 3.3 Cost Estimates

#### Free Tier Option
| Component | Cost | Notes |
|-----------|------|-------|
| Railway/Render | $0 | 500 hours/month, sleeps after inactivity |
| PostgreSQL | $0 | 500 MB storage on Railway |
| Redis | $0 | Included with Railway |
| OpenAI API | $0 | Skip AI tier initially |
| **Total** | **$0/month** | Limited uptime, sleeps |

#### Production-Ready (Low Cost)
| Component | Cost/Month | Notes |
|-----------|------------|-------|
| Railway Standard | $5 | No sleep, always-on |
| PostgreSQL Pro | $10 | 100GB, backups |
| Redis | Included | With Railway plan |
| OpenAI API | $1-5 | ~1,000 lookups/month |
| **Total** | **$16-20/month** | Handles 10k lookups/month |

#### Scale Option
| Component | Cost/Month | Notes |
|-----------|------------|-------|
| VPS (Hetzner/Linode) | $10-20 | More control |
| Managed Postgres | $15 | (Supabase/Railway) |
| Paid API fallback | $50 | 100 high-confidence verifications |
| OpenAI API | $10 | Higher volume |
| **Total** | **$85-95/month** | Production scale |

### 3.4 Time Estimates

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Setup + Data Import | 2 days | Working local dev environment |
| Core API | 3 days | All endpoints functional |
| Matching Algorithm | 2 days | Basic keyword matching |
| Frontend MVP | 3 days | Working web interface |
| Testing & Polish | 2 days | Ready for demo |
| **MVP Total** | **12 days** (~2.5 weeks) | |
| AI Enhancement | 2 days | GPT integration |
| Address Lookup | 2 days | Geocoding integration |
| Export Features | 1 day | Excel + better CSV |
| **Full V1** | **17 days** (~3.5 weeks) | |

---

## 4. Code Structure

### 4.1 Project Structure

```
naics-finder/
├── backend/
│   ├── alembic/                    # DB migrations
│   │   └── versions/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI entry point
│   │   ├── config.py               # Settings/env vars
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── company.py
│   │   │   ├── job.py
│   │   │   ├── naics_result.py
│   │   │   └── naics_reference.py
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── lookup.py           # /api/lookup endpoints
│   │   │   ├── batch.py            # /api/lookup/batch
│   │   │   ├── jobs.py             # /api/jobs endpoints
│   │   │   ├── export.py           # /api/export endpoints
│   │   │   └── naics.py            # /api/naics reference
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── scraper.py          # Website scraping
│   │   │   ├── matcher.py          # NAICS matching logic
│   │   │   ├── ai_classifier.py    # OpenAI integration
│   │   │   ├── address_lookup.py   # Address → NAICS
│   │   │   └── export_service.py   # CSV/Excel generation
│   │   ├── workers/
│   │   │   ├── __init__.py
│   │   │   └── classification.py   # Celery tasks
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── census_import.py    # Import Census data
│   │       └── text_processing.py  # NLP helpers
│   ├── data/
│   │   └── naics_2022/             # Census CSV files
│   ├── tests/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── celery_worker.py
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── InputForm.tsx
│   │   │   ├── BatchUpload.tsx
│   │   │   ├── ResultsTable.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── ExportButton.tsx
│   │   ├── hooks/
│   │   │   ├── useLookup.ts
│   │   │   └── useJobStatus.ts
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
├── Makefile
└── README.md
```

### 4.2 Key Files and Sample Code

#### 4.2.1 Data Import Script (`backend/app/utils/census_import.py`)

```python
"""Import Census Bureau NAICS data into PostgreSQL."""

import csv
from pathlib import Path
from sqlalchemy.orm import Session
from app.models.naics_reference import NAICSCode, NAICSKeyword


def import_naics_codes(db: Session, csv_path: Path) -> int:
    """Import NAICS codes from Census Bureau CSV."""
    count = 0
    with open(csv_path, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            code = NAICSCode(
                code=row['code'],
                title=row['title'],
                description=row.get('description'),
                level=len(row['code']),
                year=2022
            )
            db.add(code)
            count += 1
    db.commit()
    return count


def import_naics_keywords(db: Session, csv_path: Path) -> int:
    """Import NAICS index keywords for matching."""
    count = 0
    with open(csv_path, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            keyword = NAICSKeyword(
                naics_code=row['code'],
                keyword=row['keyword'].lower(),
                source='index_file'
            )
            db.add(keyword)
            count += 1
    db.commit()
    return count
```

#### 4.2.2 Matching Service (`backend/app/services/matcher.py`)

```python
"""NAICS matching engine - combines multiple strategies."""

import re
from typing import List, Dict, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import NAICSCode, NAICSKeyword, NAICSResult


class NAICSMatcher:
    """Hybrid matching engine for company → NAICS classification."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def match_company(
        self, 
        company_name: str, 
        website_text: str = "",
        keywords: List[str] = None
    ) -> List[NAICSResult]:
        """
        Find matching NAICS codes for a company.
        
        Strategy:
        1. Extract keywords from website text
        2. Match against NAICS keyword index
        3. Score by frequency and relevance
        4. Return top matches with confidence
        """
        results = []
        
        # Combine all text sources
        search_text = f"{company_name} {website_text}".lower()
        search_terms = self._extract_keywords(search_text)
        if keywords:
            search_terms.extend([k.lower() for k in keywords])
        
        # Query matching keywords
        matches = (
            self.db.query(
                NAICSKeyword.naics_code,
                func.count(NAICSKeyword.id).label('match_count')
            )
            .filter(NAICSKeyword.keyword.in_(search_terms))
            .group_by(NAICSKeyword.naics_code)
            .order_by(func.count(NAICSKeyword.id).desc())
            .limit(10)
            .all()
        )
        
        # Calculate confidence scores
        total_matches = sum(m.match_count for m in matches) if matches else 1
        
        for match in matches[:5]:  # Top 5
            code = self.db.query(NAICSCode).get(match.naics_code)
            if not code:
                continue
                
            confidence = min(match.match_count / total_matches * 2, 1.0)
            
            result = NAICSResult(
                naics_code=code.code,
                naics_title=code.title,
                confidence_score=round(confidence, 2),
                source='census_match',
                tier=1,
                match_reason=f"Matched {match.match_count} keywords"
            )
            results.append(result)
        
        return results or self._fallback_match(company_name)
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract meaningful keywords from text."""
        # Remove common stop words
        stop_words = {'the', 'and', 'of', 'in', 'to', 'a', 'is', 'for', 'llc', 'inc'}
        words = re.findall(r'\b[a-z]{3,}\b', text.lower())
        return [w for w in words if w not in stop_words]
    
    def _fallback_match(self, company_name: str) -> List[NAICSResult]:
        """Fallback: Use full-text search on descriptions."""
        # Query using PostgreSQL full-text search
        tsquery = func.plainto_tsquery('english', company_name)
        
        codes = (
            self.db.query(NAICSCode)
            .filter(
                func.to_tsvector('english', 
                    NAICSCode.title + ' ' + func.coalesce(NAICSCode.description, '')
                ).op('@@')(tsquery)
            )
            .limit(3)
            .all()
        )
        
        return [
            NAICSResult(
                naics_code=code.code,
                naics_title=code.title,
                confidence_score=0.4,  # Low confidence for fallback
                source='census_match',
                tier=1,
                match_reason="Text similarity match"
            )
            for code in codes
        ] or [NAICSResult(
            naics_code="000000",
            naics_title="Unable to classify",
            confidence_score=0.0,
            source='census_match',
            tier=1,
            match_reason="No match found"
        )]
```

#### 4.2.3 Scraping Service (`backend/app/services/scraper.py`)

```python
"""Website scraping for company information extraction."""

import asyncio
from typing import Optional, Dict, List
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import re


class WebsiteScraper:
    """Scrape company websites for relevant information."""
    
    async def scrape(self, url: str) -> Dict:
        """Scrape a website and extract key information."""
        if not url.startswith('http'):
            url = f'https://{url}'
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            try:
                await page.goto(url, timeout=30000)
                html = await page.content()
                await browser.close()
                
                return self._parse_html(html, url)
            except Exception as e:
                await browser.close()
                return {
                    'url': url,
                    'error': str(e),
                    'title': None,
                    'description': None,
                    'keywords': []
                }
    
    def _parse_html(self, html: str, url: str) -> Dict:
        """Parse HTML and extract metadata."""
        soup = BeautifulSoup(html, 'html.parser')
        
        # Extract title
        title = None
        title_tag = soup.find('title')
        if title_tag:
            title = title_tag.get_text(strip=True)
        
        # Extract meta description
        description = None
        desc_tag = soup.find('meta', attrs={'name': 'description'})
        if desc_tag:
            description = desc_tag.get('content', '')
        
        # Extract keywords
        keywords = []
        keywords_tag = soup.find('meta', attrs={'name': 'keywords'})
        if keywords_tag:
            keywords = [k.strip() for k in keywords_tag.get('content', '').split(',')]
        
        # Extract h1 text for additional context
        h1_tags = soup.find_all('h1')[:3]
        h1_text = ' '.join(h.get_text(strip=True) for h in h1_tags)
        
        # Get visible text (first 500 chars)
        body_text = soup.get_text(separator=' ', strip=True)[:500]
        
        return {
            'url': url,
            'title': title,
            'description': description,
            'keywords': keywords,
            'h1_text': h1_text,
            'body_text': body_text
        }
```

#### 4.2.4 AI Classifier (`backend/app/services/ai_classifier.py`)

```python
"""AI-based classification fallback using OpenAI."""

import json
from typing import List
from openai import AsyncOpenAI
from app.models import NAICSResult, NAICSCode
from sqlalchemy.orm import Session


class AIClassifier:
    """Use GPT to classify companies when traditional matching fails."""
    
    def __init__(self, api_key: str):
        self.client = AsyncOpenAI(api_key=api_key)
    
    async def classify(
        self,
        company_name: str,
        website_data: dict,
        db: Session
    ) -> NAICSResult:
        """Classify company using GPT with Census context."""
        
        # Get top-level NAICS categories for context
        sectors = db.query(NAICSCode).filter(NAICSCode.level == 2).all()
        sector_context = "\n".join([
            f"{s.code}: {s.title}" for s in sectors[:20]
        ])
        
        prompt = f"""You are an expert in business classification using NAICS codes.

Given the following company information, identify the most appropriate NAICS code.

Company Name: {company_name}
Website Title: {website_data.get('title', 'N/A')}
Website Description: {website_data.get('description', 'N/A')}
Keywords: {', '.join(website_data.get('keywords', []))}

Here are the top-level NAICS sectors for reference:
{sector_context}

Respond with a JSON object:
{{
    "naics_code": "6-digit code (e.g., 541511)",
    "naics_title": "Official NAICS title",
    "confidence": 0.0-1.0,
    "reasoning": "brief explanation"
}}

If uncertain, provide the best estimate with a lower confidence score."""

        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=200
            )
            
            content = response.choices[0].message.content
            result = json.loads(content)
            
            return NAICSResult(
                naics_code=result['naics_code'],
                naics_title=result['naics_title'],
                confidence_score=result['confidence'],
                source='ai_classify',
                tier=2,
                match_reason=result.get('reasoning', 'AI classification')
            )
            
        except Exception as e:
            return NAICSResult(
                naics_code="000000",
                naics_title="Classification failed",
                confidence_score=0.0,
                source='ai_classify',
                tier=2,
                match_reason=f"Error: {str(e)}"
            )
```

#### 4.2.5 FastAPI Router (`backend/app/routers/batch.py`)

```python
"""Batch processing API endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.schemas import (
    BatchLookupRequest, 
    BatchLookupResponse,
    JobStatusResponse
)
from app.services.scraper import WebsiteScraper
from app.services.matcher import NAICSMatcher
from app.workers.classification import process_batch

router = APIRouter(prefix="/api/lookup", tags=["lookup"])


@router.post("/batch", response_model=BatchLookupResponse)
async def batch_lookup(
    request: BatchLookupRequest,
    db: Session = Depends(get_db)
):
    """
    Submit a batch of companies for NAICS classification.
    
    - Accepts up to 10 companies per batch
    - Returns a job ID for status tracking
    - Processing happens asynchronously
    """
    if len(request.companies) > 10:
        raise HTTPException(400, "Maximum 10 companies per batch")
    
    if len(request.companies) == 0:
        raise HTTPException(400, "At least one company required")
    
    # Create job record
    job = create_job(db, len(request.companies), request.input_method)
    
    # Queue for processing
    process_batch.delay(job.id, [c.dict() for c in request.companies])
    
    return BatchLookupResponse(
        job_id=job.id,
        status="pending",
        message=f"Processing {len(request.companies)} companies",
        estimated_seconds=len(request.companies) * 5  # 5s est per company
    )


@router.get("/batch/{job_id}", response_model=JobStatusResponse)
async def get_batch_status(
    job_id: UUID,
    db: Session = Depends(get_db)
):
    """Get status and results for a batch job."""
    job = get_job(db, job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    
    results = get_job_results(db, job_id) if job.status == "completed" else []
    
    return JobStatusResponse(
        job_id=job.id,
        status=job.status,
        total_count=job.total_count,
        processed_count=job.processed_count,
        results=results,
        completed_at=job.completed_at
    )
```

#### 4.2.6 Celery Worker (`backend/app/workers/classification.py`)

```python
"""Celery tasks for async classification."""

from celery import Celery
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.services.scraper import WebsiteScraper
from app.services.matcher import NAICSMatcher
from app.services.ai_classifier import AIClassifier
from app.models import Company, NAICSResult, Job
import asyncio

# Celery app
app = Celery('classification', broker='redis://redis:6379/0')


@app.task(bind=True, max_retries=3)
def process_batch(self, job_id: str, companies_data: list):
    """Process a batch of companies asynchronously."""
    db = SessionLocal()
    scraper = WebsiteScraper()
    
    try:
        job = db.query(Job).get(job_id)
        job.status = "processing"
        db.commit()
        
        for idx, company_data in enumerate(companies_data):
            try:
                # Create company record
                company = Company(
                    job_id=job_id,
                    url=company_data.get('url'),
                    name=company_data['name'],
                    address=company_data.get('address'),
                    city=company_data.get('city'),
                    state=company_data.get('state'),
                    zip=company_data.get('zip')
                )
                db.add(company)
                db.flush()
                
                # Scrape website if URL provided
                website_data = {}
                if company.url:
                    try:
                        website_data = asyncio.run(scraper.scrape(company.url))
                    except Exception:
                        pass  # Continue without website data
                
                # Match to NAICS
                matcher = NAICSMatcher(db)
                matches = matcher.match_company(
                    company_name=company.name,
                    website_text=website_data.get('description', ''),
                    keywords=website_data.get('keywords', [])
                )
                
                # If low confidence, try AI (optional)
                if not matches or matches[0].confidence_score < 0.5:
                    ai = AIClassifier(api_key=os.getenv('OPENAI_API_KEY'))
                    ai_result = asyncio.run(ai.classify(company.name, website_data, db))
                    matches = [ai_result] + matches
                
                # Save results
                for match in matches:
                    match.company_id = company.id
                    db.add(match)
                
                job.processed_count = idx + 1
                db.commit()
                
            except Exception as exc:
                # Log error but continue with next company
                db.rollback()
                continue
        
        job.status = "completed"
        job.completed_at = datetime.utcnow()
        db.commit()
        
    except Exception as exc:
        job.status = "failed"
        db.commit()
        raise self.retry(exc=exc, countdown=60)
    finally:
        db.close()
```

### 4.3 Frontend Key Components

#### 4.3.1 Input Form Component (React)

```tsx
// src/components/InputForm.tsx
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';

interface Company {
  name: string;
  url?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

interface Props {
  onJobCreated: (jobId: string) => void;
}

export function InputForm({ onJobCreated }: Props) {
  const [companies, setCompanies] = useState<Company[]>([{ name: '' }]);
  
  const batchMutation = useMutation({
    mutationFn: api.createBatchJob,
    onSuccess: (data) => onJobCreated(data.job_id)
  });

  const addCompany = () => {
    if (companies.length < 10) {
      setCompanies([...companies, { name: '' }]);
    }
  };
  
  const removeCompany = (index: number) => {
    setCompanies(companies.filter((_, i) => i !== index));
  };

  const updateCompany = (index: number, field: keyof Company, value: string) => {
    const updated = [...companies];
    updated[index] = { ...updated[index], [field]: value };
    setCompanies(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = companies.filter(c => c.name.trim());
    if (valid.length > 0) {
      batchMutation.mutate({ companies: valid, input_method: 'paste' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {companies.map((company, idx) => (
        <CompanyRow
          key={idx}
          company={company}
          index={idx}
          onChange={updateCompany}
          onRemove={removeCompany}
          canRemove={companies.length > 1}
        />
      ))}
      
      {companies.length < 10 && (
        <button
          type="button"
          onClick={addCompany}
          className="text-blue-600 hover:text-blue-800"
        >
          + Add Another Company
        </button>
      )}
      
      <button
        type="submit"
        disabled={batchMutation.isPending}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {batchMutation.isPending ? 'Processing...' : 'Lookup NAICS Codes'}
      </button>
    </form>
  );
}
```

---

## 5. Deployment Configuration

### 5.1 Docker Compose (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  app:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://naics:naics@postgres:5432/naicsdb
      - REDIS_URL=redis://redis:6379/0
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - postgres
      - redis

  worker:
    build: ./backend
    command: celery -A app.workers.classification worker --loglevel=info --concurrency=2
    environment:
      - DATABASE_URL=postgresql://naics:naics@postgres:5432/naicsdb
      - REDIS_URL=redis://redis:6379/0
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=naics
      - POSTGRES_PASSWORD=naics
      - POSTGRES_DB=naicsdb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### 5.2 Environment Variables (`.env`)

```bash
# Database
DATABASE_URL=postgresql://naics:naics@localhost:5432/naicsdb

# Redis (Celery broker)
REDIS_URL=redis://localhost:6379/0

# OpenAI (for AI tier - optional for MVP)
OPENAI_API_KEY=sk-...

# App
DEBUG=false
LOG_LEVEL=INFO
MAX_BATCH_SIZE=10
REQUEST_TIMEOUT=30
```

---

## 6. Data Sources Reference

### 6.1 Census Bureau Download Links

| File | URL | Size | Description |
|------|-----|------|-------------|
| NAICS 2022 Codes | `https://www.census.gov/naics/?68967` | ~150KB | Complete code list with descriptions |
| NAICS Index | `https://www.census.gov/naics/?78967` | ~500KB | Keyword index for matching |
| Cross References | `https://www.census.gov/naics/?38451` | ~100KB | SIC to NAICS mapping |

### 6.2 Alternative APIs

| Provider | Endpoint | Cost | Use Case |
|----------|----------|------|----------|
| NAICS.com | `POST /api/lookup` | $0.05-0.20 | High-confidence fallback |
| Middesk | `POST /v1/businesses` | $0.50-2.00 | Verification + NAICS |
| OpenAI | `POST /v1/chat/completions` | $0.001-0.02 | AI classification |

---

## 7. Recommendations Summary

### 7.1 Recommended Architecture

**Hybrid 3-Tier Approach**:
1. **Tier 1**: Self-hosted Census data with keyword matching (FREE)
2. **Tier 2**: GPT-4-mini classification for low-confidence ($0.005-0.02/lookup)
3. **Tier 3**: Paid API (NAICS.com/Middesk) for critical lookups ($0.50/lookup)

### 7.2 Implementation Priority

| Priority | Feature | Cost | Time |
|----------|---------|------|------|
| 1 | Census DB + Keyword Matching | Free | 3 days |
| 2 | Web Interface + Batch Upload | Free | 2 days |
| 3 | Website Scraping | Free | 2 days |
| 4 | AI Classification Tier | Low | 2 days |
| 5 | Paid API Fallback | Variable | 1 day |

### 7.3 Cost at Scale

| Lookups/Month | Cost | Configuration |
|----------------|------|----------------|
| 100 | $2 | Free tier + AI |
| 1,000 | $10 | Census + AI (95%) + 50 paid lookups |
| 10,000 | $55 | Census + AI (90%) + 500 paid lookups |
| 100,000 | $300 | Census + AI (85%) + 3,000 paid lookups |

---

## 8. Next Steps

1. **Download Census Data**: Get 2022 NAICS files from census.gov
2. **Set up Dev Environment**: Run `docker-compose up`
3. **Import Data**: Run `python scripts/import_census_data.py`
4. **Build MVP**: Start with `/api/lookup/batch` endpoint
5. **Test Matching**: Validate against sample companies
6. **Add UI**: Build React frontend
7. **Deploy**: Push to Railway/Render

---

*Document Version: 1.0*  
*Last Updated: 2026-02-26*  
*Author: Technical Architect*
