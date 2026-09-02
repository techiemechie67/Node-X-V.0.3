# Node-X Logistics - Intelligent Supply Chain Management Platform

An advanced logistics management system with AI-powered route optimization, risk assessment, and real-time decision intelligence for supply chain operations.

## 🚀 Features

- **AI Route Optimization**: Intelligent pathway selection and optimization
- **Risk & Confidence Engine**: Real-time risk assessment and decision confidence scoring
- **Asset Management**: Comprehensive asset tracking and lifecycle management
- **Exposure Analysis**: Financial and operational exposure monitoring
- **Decision Intelligence**: ML-powered decision recommendations
- **Event Processing**: Real-time event stream processing
- **Financial Ledger**: Automated ledger management and reconciliation
- **Interactive Dashboard**: Real-time visualization of supply chain metrics
- **Crisis Scenario Planning**: Simulate and analyze crisis scenarios
- **Voice Integration**: Voice-based command and control interface

## 📁 Project Structure

```
node_x_logistics_codebase/
├── frontend/                 # React/Vite frontend application
│   ├── index.html          # Main entry point
│   ├── simulator.html      # Logistics simulator interface
│   ├── problem.html        # Problem visualization
│   ├── components/         # Reusable React components
│   ├── js/                 # Frontend logic and utilities
│   ├── css/                # Styling
│   └── assets/             # Images and static assets
├── backend/                 # Python Flask API backend
│   ├── app/                # Main application package
│   │   ├── main.py         # Flask application entry
│   │   ├── asset_api.py    # Asset management API
│   │   ├── models.py       # Data models
│   │   └── engine/         # Intelligence engines
│   │       ├── ai_agent.py
│   │       ├── asset_engine.py
│   │       ├── confidence_engine.py
│   │       ├── decision_engine.py
│   │       ├── exposure_engine.py
│   │       ├── financial.py
│   │       ├── risk_engine.py
│   │       ├── route_intelligence.py
│   │       └── more...
│   ├── tests/              # Backend unit tests
│   ├── scripts/            # Utility scripts
│   ├── requirements.txt    # Python dependencies
│   └── run.py              # Backend startup script
├── package.json            # Frontend dependencies
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
└── README.md               # This file
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: React with Vite
- **Styling**: CSS
- **Visualization**: Graph.js, Vanta.js, D3.js
- **Build Tool**: Vite

### Backend
- **Framework**: Flask (Python)
- **Language**: Python 3.x
- **Data Processing**: Pandas, NumPy
- **AI/ML**: Scikit-learn, TensorFlow (for decision engines)

## 📋 Prerequisites

- **Node.js**: v16+ (for frontend)
- **Python**: 3.8+ (for backend)
- **Git**: For version control
- **GitHub Account**: For deployment

## 🚀 Installation & Setup

### Backend Setup

1. **Create virtual environment**:
   ```bash
   cd backend
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**:
   ```bash
   # Copy .env.example to .env (if exists)
   # Edit .env with your configuration
   ```

4. **Run backend server**:
   ```bash
   python run.py
   # Server will start on http://localhost:5000
   ```

### Frontend Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   # Frontend will be available at http://localhost:5173
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## 🧪 Testing

### Backend Tests

Run all backend tests:
```bash
cd backend
python -m pytest tests/
```

Run specific test file:
```bash
python -m pytest tests/test_engine.py -v
```

### Frontend Testing

```bash
npm run test
```

## 🔌 API Endpoints

### Asset Management
- `GET /api/assets` - List all assets
- `POST /api/assets` - Create new asset
- `GET /api/assets/{id}` - Get asset details
- `PUT /api/assets/{id}` - Update asset
- `DELETE /api/assets/{id}` - Delete asset

### Risk & Confidence
- `GET /api/risk/assess` - Get risk assessment
- `GET /api/confidence/score` - Get confidence scores

### Route Intelligence
- `POST /api/routes/optimize` - Optimize routes
- `GET /api/routes/{id}` - Get route details

### Decision Engine
- `POST /api/decisions/recommend` - Get AI recommendations
- `GET /api/decisions/history` - Decision history

### Financial Ledger
- `GET /api/ledger/entries` - Get ledger entries
- `POST /api/ledger/record` - Record transaction

## 🌍 Environment Variables

Create a `.env` file in the `backend` directory:

```env
FLASK_ENV=development
FLASK_DEBUG=true
DATABASE_URL=sqlite:///app.db
SECRET_KEY=your_secret_key_here
API_PORT=5000
FRONTEND_URL=http://localhost:5173
```

## 📦 Deployment

### Deploy to Heroku

1. **Install Heroku CLI**:
   ```bash
   # Download from heroku.com/cli
   ```

2. **Create Heroku app**:
   ```bash
   heroku create your-app-name
   ```

3. **Set environment variables**:
   ```bash
   heroku config:set FLASK_ENV=production
   ```

4. **Deploy**:
   ```bash
   git push heroku main
   ```

### Deploy to Railway/Render

- Connect your GitHub repository
- Select Python for backend, Static Site for frontend
- Configure environment variables
- Auto-deploy on push

### Deploy to AWS/GCP

- Use AWS Elastic Beanstalk or Google Cloud Run
- Configure auto-scaling and monitoring

## 📊 Key Modules

### Engines

| Engine | Purpose |
|--------|---------|
| **AI Agent** | Main decision orchestration |
| **Asset Engine** | Asset lifecycle and tracking |
| **Risk Engine** | Risk calculation and monitoring |
| **Confidence Engine** | Decision confidence scoring |
| **Decision Engine** | AI-powered recommendations |
| **Exposure Engine** | Financial/operational exposure |
| **Route Intelligence** | Route optimization |
| **Financial Ledger** | Transaction and ledger management |
| **Event Engine** | Event stream processing |

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to GitHub: `git push origin feature/your-feature`
4. Create a Pull Request

## 📝 License

[Add your license here - MIT, Apache 2.0, etc.]

## 📧 Contact

For support or inquiries:
- **GitHub**: [techiemechie67/Node-X-V.0.3](https://github.com/techiemechie67/Node-X-V.0.3)
- **Issues**: [GitHub Issues](https://github.com/techiemechie67/Node-X-V.0.3/issues)

## 🔗 Related Resources

- [Vite Documentation](https://vitejs.dev)
- [Flask Documentation](https://flask.palletsprojects.com)
- [React Documentation](https://react.dev)

---

**Last Updated**: September 2026
**Version**: 0.3.0
