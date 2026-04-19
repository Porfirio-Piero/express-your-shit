# AgentForge 🚀

An AI Agent Marketplace - The home for agentic workflows. Share, discover, and monetize AI agents.

![AgentForge Banner](https://via.placeholder.com/1200x300/4f46e5/ffffff?text=AgentForge+-+AI+Agent+Marketplace)

## Features

- 🤖 **Agent Discovery** - Browse and search agents by category, framework, pricing
- 🔒 **Secure Auth** - Clerk authentication for safe access
- 💰 **Monetization** - Pay-per-use and subscription pricing with Stripe
- 📝 **README Support** - Display agent documentation
- 📊 **Analytics** - Track views, downloads, and earnings
- 🎨 **Modern UI** - Clean, professional design inspired by Hugging Face

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Clerk Authentication
- shadcn/ui components

### Backend
- FastAPI
- SQLAlchemy + SQLite (MVP)
- Python 3.10+

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/Piero-Porfirio/agentforge.git
cd agentforge
```

### 2. Set up the Backend

```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

The backend will start on `http://localhost:8000`

### 3. Set up the Frontend

```bash
cd client
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Clerk keys

npm run dev
```

The frontend will start on `http://localhost:3000`

### 4. Set up Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Get your Publishable Key and Secret Key
4. Add them to `.env.local`

## Project Structure

```
agentforge/
├── client/              # Next.js frontend
│   ├── src/
│   │   ├── app/        # App Router pages
│   │   ├── components/ # React components
│   │   └── lib/        # Utilities and API client
│   └── public/         # Static assets
├── server/             # FastAPI backend
│   ├── app/
│   │   ├── models.py   # Database models
│   │   ├── routers/    # API endpoints
│   │   └── crud.py     # Database operations
│   └── main.py         # Entry point
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /agents/ | List all agents |
| GET | /agents/featured | Get featured agents |
| GET | /agents/search | Search agents |
| GET | /agents/{id} | Get agent by ID |
| POST | /agents/ | Create new agent |
| PUT | /agents/{id} | Update agent |
| DELETE | /agents/{id} | Delete agent |
| GET | /categories/ | List categories |
| GET | /stats/ | Platform statistics |

## Deployment

### Frontend (Vercel)

```bash
cd client
vercel
```

### Backend (Railway/Render)

```bash
# Deploy to Railway
railway login
railway link
railway up

# Or use Render blueprint
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details

## Roadmap

- [ ] x402 Payment Protocol integration
- [ ] Live agent execution sandbox
- [ ] Skills marketplace (.md skills)
- [ ] Organization management
- [ ] Advanced analytics dashboard
- [ ] API rate limiting
- [ ] Webhook support
- [ ] Docker deployment templates

## Contact

- GitHub: [@Piero-Porfirio](https://github.com/Piero-Porfirio)
- Twitter: [@thebotfather](https://twitter.com/thebotfather)

---

Built with ❤️ for the agentic future.