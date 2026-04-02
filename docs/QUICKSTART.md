# Quick Start Guide ⚡

> Get FocusFlow AI up and running in under 10 minutes!

## Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Download Link |
|-------------|---------|---------------|
| Node.js | 16+ | [nodejs.org](https://nodejs.org) |
| Python | 3.8+ | [python.org](https://python.org) |
| MongoDB | 4.4+ | [mongodb.com](https://mongodb.com) |
| Git | Latest | [git-scm.com](https://git-scm.com) |

## Quick Installation

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/focusflow-ai.git

# Navigate to project directory
cd focusflow-ai
```

### Step 2: Set Up MongoDB

```bash
# Start MongoDB service (if not running)
# On Windows:
net start MongoDB

# On macOS:
brew services start mongodb-community

# On Linux:
sudo systemctl start mongod

# Verify MongoDB is running
mongosh --eval "db.version()"
```

### Step 3: Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Copy environment file
cp .env.example .env 2>nul || cp .env.example .env

# Edit .env with your configuration (optional - defaults work for local dev)
# Required environment variables:
# - MONGODB_URI (default: mongodb://localhost:27017/focusflow-ai)
# - JWT_SECRET (generate a secure random string)
# - ML_API_URL (default: http://localhost:5001)

# Seed the database with sample data
npm run seed

# Start the backend server
npm run dev
```

The backend will start on `http://localhost:5000`

### Step 4: ML Model Setup

Open a new terminal:

```bash
# Navigate to ML model directory
cd ml-model

# Install Python dependencies
pip install -r requirements.txt

# Train the model with sample data
python train_model.py

# Start the ML prediction API
python predict_api.py
```

The ML API will start on `http://localhost:5001`

### Step 5: Frontend Setup

Open another new terminal:

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will open automatically at `http://localhost:3000`

## Demo Login

Use these credentials to explore the application:

| Field | Value |
|-------|-------|
| **Email** | `demo@focusflow.ai` |
| **Password** | `demo123` |

## Verification Checklist

After setup, verify everything is working:

- [ ] **Backend API**: Visit `http://localhost:5000/api/health` - Should return `{"status": "ok"}`
- [ ] **ML API**: Visit `http://localhost:5001/health` - Should return model status
- [ ] **Frontend**: Visit `http://localhost:3000` - Should show login page
- [ ] **Database**: Run `mongosh focusflow-ai --eval "db.users.countDocuments()"` - Should show 1 user

## Common Issues & Solutions

### Issue: MongoDB Connection Failed
```bash
# Solution: Ensure MongoDB is running
# Windows:
net start MongoDB

# macOS:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod
```

### Issue: ML Model Not Found
```bash
# Solution: Train the model first
cd ml-model
python train_model.py
```

### Issue: Port Already in Use
```bash
# Solution: Kill the process using the port
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5000 | xargs kill -9
```

### Issue: Python Module Not Found
```bash
# Solution: Create virtual environment and reinstall
cd ml-model
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
pip install -r requirements.txt
```

## Production Deployment

For production deployment, refer to the [ARCHITECTURE.md](./ARCHITECTURE.md) for:
- Environment configuration
- Docker deployment
- Reverse proxy setup
- SSL certificate configuration

## Next Steps

1. **Explore the Dashboard**: Log in and explore the analytics dashboard
2. **Configure Activity Modes**: Set up your preferred filtering rules
3. **Test Notifications**: Use the demo flow to see the system in action
4. **Customize Settings**: Adjust AI sensitivity and preferences

---

**Need Help?** Check out our [FAQ](./HACKATHON_QA.md) or open an issue on GitHub.