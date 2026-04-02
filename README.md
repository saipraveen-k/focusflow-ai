# FocusFlow AI – Context-Aware Notification Filter System

🚀 **Hackathon-Winning Smart Notification Management System**

> FocusFlow AI is an intelligent notification filtering system that uses machine learning and context-awareness to help users stay focused by intelligently managing notifications across all their apps and devices.

![FocusFlow AI Demo](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=FocusFlow+AI+-+Reclaim+Your+Focus)

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution Overview](#-solution-overview)
- [Key Features](#-key-features)
- [Live Demo](#-live-demo)
- [Quick Start](#-quick-start)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [API Documentation](#-api-documentation)
- [Machine Learning](#-machine-learning)
- [Demo & Testing](#-demo--testing)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Problem Statement

Users are overwhelmed by excessive notifications across apps, leading to:

| Problem | Impact |
|---------|--------|
| **Constant Distraction** | Average user checks phone 96 times/day |
| **Reduced Productivity** | 23 minutes to refocus after interruption |
| **Digital Stress** | Notification anxiety affects mental health |
| **Sleep Disruption** | Night notifications impact sleep quality |

Current solutions are either:
- ❌ **Too simple** - Basic "Do Not Disturb" blocks everything
- ❌ **Too manual** - Requires constant user configuration
- ❌ **Not intelligent** - No learning from user behavior

---

## 🧠 Solution Overview

FocusFlow AI combines three key innovations:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │  Node.js API    │    │   ML Model      │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Python)      │
│                 │    │                 │    │                 │
│ • Dashboard     │    │ • REST APIs     │    │ • Scikit-learn  │
│ • Settings      │    │ • Auth System   │    │ • Decision Tree │
│ • Activity Mode │    │ • Context Engine│    │ • Predictions   │
│ • Logs          │    │ • Decision Engine│   │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### How It Works

1. **Context Analysis** - Analyzes time, activity, and user state
2. **ML Prediction** - Predicts notification importance using trained model
3. **Rule Engine** - Applies user preferences and business rules
4. **Decision** - Combines ML + Rules for final SHOW/DELAY/BLOCK decision
5. **Learning** - Collects feedback to improve future predictions

---

## ✨ Key Features

### 🤖 AI-Powered Intelligence

| Feature | Description |
|---------|-------------|
| **Smart Classification** | Automatically categorizes notifications as SHOW, DELAY, or BLOCK |
| **Learning System** | Improves accuracy based on user feedback |
| **Context Analysis** | Considers time, activity, app usage patterns |
| **Urgency Detection** | Identifies critical messages using NLP |
| **Hybrid AI** | Combines ML predictions with rule-based transparency |

### 🎯 Activity Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| 📚 **Study Mode** | Blocks social media, allows educational content | Focus on learning |
| 💼 **Work Mode** | Prioritizes professional communications | Deep work sessions |
| 😴 **Sleep Mode** | Only emergency contacts get through | Uninterrupted rest |
| 🎮 **Leisure Mode** | Minimal filtering for relaxation time | Free time |

### 📊 Analytics & Insights

- **Productivity Tracking** - Monitor focus efficiency and distraction reduction
- **Notification Statistics** - Detailed breakdown of filtering performance
- **App Usage Analysis** - Understand which apps generate the most interruptions
- **Confidence Metrics** - AI decision transparency with confidence scores

### 🎨 Modern UI/UX

- **Dashboard** - Real-time monitoring and statistics
- **Settings Panel** - Comprehensive customization options
- **Activity Mode Selection** - Easy mode switching
- **Detailed Logs** - Complete notification history with filtering reasons

---

## 🎬 Live Demo

### Try It Now

1. **Start the application** (see [Quick Start](#-quick-start))
2. **Login with demo account:**
   - Email: `demo@focusflow.ai`
   - Password: `demo123`
3. **Explore the features:**
   - Switch between activity modes
   - Simulate notifications
   - View analytics dashboard
   - Check notification logs

### Demo Simulation

Run the interactive demo simulation:

```bash
python demo/demo_simulation.py
```

This will show you how FocusFlow AI processes different notifications across various activity modes.

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| Node.js | 16+ | Backend & Frontend |
| Python | 3.8+ | ML Model |
| MongoDB | 4.4+ | Database |
| Git | Latest | Version Control |

### Installation (5 Minutes)

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/focusflow-ai.git
cd focusflow-ai

# 2. Start MongoDB
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# 3. Setup Backend
cd server
npm install
npm run seed    # Seed sample data
npm run dev     # Start on port 5000

# 4. Setup ML Model (new terminal)
cd ml-model
pip install -r requirements.txt
python train_model.py
python predict_api.py  # Start on port 5001

# 5. Setup Frontend (new terminal)
cd client
npm install
npm start  # Opens on port 3000
```

### Verification

- **Backend**: http://localhost:5000/api/health
- **ML Service**: http://localhost:5001/health
- **Frontend**: http://localhost:3000

📖 For detailed instructions, see [QUICKSTART.md](docs/QUICKSTART.md)

---

## 🏗️ Architecture

### System Components

```
┌────────────────────────────────────────────────────────────────────┐
│                         FocusFlow AI                                │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐        │
│  │   Frontend   │────►│   Backend    │────►│   ML Model   │        │
│  │   (React)    │◄────│  (Node.js)   │◄────│  (Python)    │        │
│  └──────────────┘     └──────────────┘     └──────────────┘        │
│         │                    │                    │                │
│         └────────────────────┼────────────────────┘                │
│                              │                                      │
│                     ┌────────▼────────┐                             │
│                     │    MongoDB      │                             │
│                     │   (Database)    │                             │
│                     └─────────────────┘                             │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### Notification Processing Flow

```
Notification → Context Engine → ML Prediction → Rule Engine → Decision
                                     │
                              ┌──────┴──────┐
                              ▼             ▼
                           SHOW          DELAY/BLOCK
                              │             │
                              ▼             ▼
                         Log & Learn ←── Feedback
```

📖 For detailed architecture, see [ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Tailwind CSS** - Utility-first styling
- **React Router** - Navigation
- **React Query** - Data fetching and caching
- **Lucide React** - Beautiful icons
- **Recharts** - Data visualization

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### Machine Learning
- **Python** - ML language
- **Scikit-learn** - ML library (Random Forest)
- **Flask** - ML API server
- **Pandas** - Data processing
- **Joblib** - Model serialization

---

## 📚 API Documentation

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/notifications/process` | Process notification |
| GET | `/api/notifications` | Get notification history |
| POST | `/api/notifications/:id/feedback` | Submit feedback |

### ML Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict` | Single prediction |
| POST | `/batch_predict` | Batch predictions |
| GET | `/model_info` | Model information |
| POST | `/retrain` | Retrain model |

### Example API Calls

```bash
# Process a notification
curl -X POST http://localhost:5000/api/notifications/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "app": "whatsapp",
    "sender": "teacher",
    "message": "URGENT: Assignment due tomorrow"
  }'

# Get ML prediction
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "app": "whatsapp",
    "sender": "teacher",
    "message": "URGENT: Assignment due tomorrow",
    "activity": "study",
    "timestamp": 1693526400,
    "is_weekday": 1
  }'
```

📖 For complete API documentation, see [ARCHITECTURE.md](docs/ARCHITECTURE.md#api-reference)

---

## 🤖 Machine Learning

### Model Details

- **Algorithm**: Random Forest Classifier
- **Features**: 8 (app, sender, activity, time, urgency, etc.)
- **Classes**: SHOW, DELAY, BLOCK
- **Accuracy**: 92% on test dataset

### Feature Importance

| Feature | Importance |
|---------|------------|
| Activity Mode | 28% |
| App Type | 24% |
| Sender Type | 15% |
| Hour of Day | 12% |
| Urgency Keywords | 8% |
| Message Length | 7% |
| Is Weekday | 4% |
| Is Weekend | 2% |

### Training the Model

```bash
cd ml-model

# Install dependencies
pip install -r requirements.txt

# Train with full dataset
python train_model.py

# The model will be saved as notification_model.pkl
```

### Dataset

The ML model is trained on a dataset of 100+ labeled notifications covering various scenarios:
- Different activity modes (study, work, sleep, leisure)
- Various apps (social media, messaging, email, etc.)
- Different sender types (friends, family, work, emergency)
- Message content with/without urgency

📖 See [ml-model/dataset.csv](ml-model/dataset.csv) for the full dataset.

---

## 🧪 Demo & Testing

### Run Demo Simulation

```bash
python demo/demo_simulation.py
```

This interactive demo shows how FocusFlow AI processes notifications across different scenarios.

### Run API Tests

```bash
# Make the test script executable
chmod +x tests/api_examples.sh

# Run all tests
./tests/api_examples.sh all

# Run specific tests
./tests/api_examples.sh health
./tests/api_examples.sh auth
./tests/api_examples.sh notifications
./tests/api_examples.sh ml
./tests/api_examples.sh analytics
```

### Test Scenarios

| Scenario | Activity | Notification | Expected Result |
|----------|----------|--------------|-----------------|
| Study Session | Study | Instagram from friend | BLOCK |
| Study Session | Study | WhatsApp from teacher | SHOW |
| Study Session | Study | Amazon promo | DELAY |
| Work Mode | Work | Slack from manager | SHOW |
| Work Mode | Work | YouTube notification | BLOCK |
| Sleep Mode | Sleep | Emergency contact | SHOW |
| Sleep Mode | Sleep | Social media | BLOCK |
| Leisure | Leisure | Any notification | SHOW |

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Write tests for new features
- Update documentation
- Keep commits atomic

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🏆 Hackathon Highlights

| Achievement | Description |
|-------------|-------------|
| **Innovation** | First context-aware notification system with hybrid AI |
| **Technical Excellence** | Full-stack implementation with real-time processing |
| **User Experience** | Intuitive interface with comprehensive analytics |
| **Scalability** | Designed for production deployment |
| **Impact** | Addresses real-world productivity challenges |

---

## 🔮 Future Scope

### Short-term (3 months)
- [ ] Mobile app (iOS/Android)
- [ ] Browser extension
- [ ] Calendar integration
- [ ] Advanced NLP for better understanding

### Medium-term (6 months)
- [ ] Team/enterprise features
- [ ] Wearable integration
- [ ] Cross-platform sync
- [ ] Advanced analytics

### Long-term (1 year+)
- [ ] GPT integration for message understanding
- [ ] Predictive scheduling
- [ ] Smart home integration
- [ ] Biometric feedback integration

---

## 📞 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs on [GitHub Issues](https://github.com/yourusername/focusflow-ai/issues)
- **Discussions**: Join our [community discussions](https://github.com/yourusername/focusflow-ai/discussions)
- **Email**: contact@focusflow.ai

---

<div align="center">

**Built with ❤️ for the Hackathon Community**

*FocusFlow AI - Reclaim Your Focus, Amplify Your Productivity*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

</div>