# DEPLOYMENT GUIDE

## Frontend Deployment (Vercel)
Your frontend is deployed on Vercel and uses `vercel.json` for configuration.

**Vercel URL**: https://your-app.vercel.app

### Environment Variables (Set in Vercel Dashboard)
```
VITE_API_URL=https://your-backend.railway.app
```

---

## Backend Deployment Options

Since Vercel has limitations with Python runtime configuration, deploy your FastAPI backend separately on **Railway** or **Render**.

### Option 1: Deploy to Railway (Recommended)

1. **Create Railway account**: https://railway.app
2. **Connect GitHub**: Link your Node-X-V.0.3 repository
3. **Add new service**:
   - Select "Python"
   - Root directory: `backend`
   - Start command: `python run.py`
4. **Set environment variables** in Railway:
   ```
   FLASK_ENV=production
   DATABASE_URL=your_db_url
   SECRET_KEY=your_secret_key
   OPENAI_API_KEY=your_api_key
   ```
5. **Deploy** - Railway will auto-start on every push

**Backend URL** (from Railway dashboard):
```
https://your-app-production.up.railway.app
```

### Option 2: Deploy to Render

1. **Create Render account**: https://render.com
2. **Create new Web Service**:
   - Connect GitHub
   - Repository: Node-X-V.0.3
   - Root directory: `backend`
   - Runtime: Python 3.9
   - Build command: `pip install -r requirements.txt`
   - Start command: `python run.py`
3. **Set environment variables**
4. **Deploy**

---

## Frontend Configuration

Update `frontend/js/app.js` (or wherever your API calls are):

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// API calls
fetch(`${API_URL}/api/assets`)
  .then(res => res.json())
  .then(data => console.log(data));
```

Update `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
});
```

---

## Test Your Deployment

### Frontend Health Check
```bash
curl https://your-app.vercel.app
```

### Backend Health Check
```bash
curl https://your-backend.railway.app/api/health
```

### Full Flow Test
```bash
curl https://your-app.vercel.app/api/health
```
(Will be proxied to your backend)

---

## CI/CD Pipeline (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: 3.9
      - run: |
          cd backend
          pip install -r requirements.txt
          python -m pytest tests/
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: |
          # Vercel auto-deploys on push
          # Railway/Render auto-deploys on push if connected
          echo "Deployments triggered automatically"
```

---

## Troubleshooting

### CORS Issues
Add to `backend/app/main.py`:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Environment Variables Not Loading
Ensure `.env` file is in the root of backend folder:
```
backend/.env
```

### Backend Timeout
Increase timeout in Railway/Render settings. Default is 30s.

---

## Summary

| Component | Platform | URL |
|-----------|----------|-----|
| Frontend | Vercel | https://your-app.vercel.app |
| Backend | Railway/Render | https://your-backend.railway.app |
| Repository | GitHub | https://github.com/techiemechie67/Node-X-V.0.3 |

**Next Steps**:
1. ✅ Push to GitHub (DONE)
2. 🚀 Deploy frontend to Vercel (DONE)
3. 🚀 Deploy backend to Railway/Render (DO THIS NEXT)
4. 🔗 Update API URLs in frontend environment variables
5. ✅ Test end-to-end

---

Last Updated: September 2026
