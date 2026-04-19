# AgentOps Platform - Render Deployment Guide

## Quick Deploy (One-Click)

Use the button below to deploy to Render:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Piero-Porfirio/openclaw-workspace)

## Manual Steps

1. Go to https://dashboard.render.com/
2. Click "New Blueprint Instance"
3. Connect your GitHub account
4. Select the repository: `Piero-Porfirio/openclaw-workspace`
5. Select branch: `master`
6. Render will auto-detect `render.yaml` in `projects/agentops/`
7. Click "Deploy"

## Services Deployed

| Service | Type | Plan | URL Pattern |
|---------|------|------|-------------|
| agentops-frontend | Web (Node) | Free | `https://agentops-frontend.onrender.com` |
| agentops-backend | Web (Docker) | Free | `https://agentops-backend.onrender.com` |
| agentops-worker | Worker | Free | Internal |
| agentops-scheduler | Worker | Free | Internal |
| agentops-postgres | Database | Free | Internal |
| agentops-redis | Redis | Free | Internal |

## Environment Variables (Auto-Generated)

Render will auto-generate:
- `JWT_SECRET`
- `ENCRYPTION_KEY`
- `API_KEY_SALT`

## Post-Deployment

1. Update frontend environment variable `VITE_API_URL` to point to backend URL
2. Access the API docs at: `https://agentops-backend.onrender.com/docs`
3. Health check: `https://agentops-backend.onrender.com/health`

## Logs

View logs in Render Dashboard:
- https://dashboard.render.com/projects

## Important Notes

- Free tier spins down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- PostgreSQL free tier has 1GB storage limit
- Redis free tier has persistence enabled

## Troubleshooting

1. **Build fails**: Check `render.yaml` syntax
2. **Database connection error**: Ensure postgres service is provisioned
3. **CORS errors**: Update `CORS_ORIGINS` in backend env vars
4. **Celery not processing**: Check Redis connection and worker logs

## SSL/HTTPS

All services are automatically configured with SSL certificates.
